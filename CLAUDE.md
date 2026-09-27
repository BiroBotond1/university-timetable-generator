# CLAUDE.md

School timetable generator for small-to-medium schools (up to ~25 classes). Three
deployable pieces: a Vue 3 frontend, a Node/Express backend, and a C++ simulated
annealing engine reached over gRPC.

Domain vocabulary lives in [CONTEXT.md](CONTEXT.md). Read it before touching
entity code — several terms mean something narrower here than in plain English.
Architecture decisions live in [docs/adr/](docs/adr/).

## Layout

```
university-timetable-generator/
├── generator.proto              # gRPC contract, shared by backend + engine
├── TimetableGenerator/          # Yarn workspaces monorepo (the web app)
│   ├── frontend/                # Vue 3 + Vite + Vuetify + Tailwind
│   ├── backend/                 # Express + Socket.IO + Mongoose
│   └── docker-compose-deps.yml  # MongoDB only
└── TimetableGeneratorEngine/    # C++ / CMake, 4 subprojects
    ├── TimetableGenerator/      # the solver library
    ├── GeneratorServer/         # gRPC server, :50051
    ├── TimetableGeneratorExe/   # CLI stub (the actual call is commented out)
    └── InputDataGenerator/      # synthetic school generator for testing
```

## Running it

All three parts must be up for generation to work. From `TimetableGenerator/`:

```bash
yarn deps:up      # MongoDB 8.0 on :27017, db `timetabledb`
yarn start        # backend :3000 (tsx watch) + frontend :8082 (vite), concurrently
yarn deps:down
```

The engine is built and started separately (CMake, then `GeneratorServer` on
`:50051`). The backend dials `localhost:50051` from
`backend/src/services/GenerationService.ts`. If the engine is not running,
generation fails at the gRPC call — there is no fallback path.

Other scripts:

| Command | Where | Notes |
| --- | --- | --- |
| `yarn type-check` | `frontend/` | `vue-tsc`; also runs as part of `yarn build` |
| `yarn lint` | `frontend/`, `backend/` | eslint with `--fix` |
| `yarn build` | `frontend/` | type-check + vite build |

## Tests

```bash
yarn deps:up                  # the suite needs MongoDB
yarn workspace backend test   # or `yarn test` from TimetableGenerator/
```

Backend integration tests in `backend/tests/`, using Node's built-in test runner
through `tsx` — no test framework dependency. They exercise the real services
against a real MongoDB rather than mocking it, because what they are guarding is
query-level behaviour: tenant filtering, cascades, socket room membership.

Each file gets its own database (`timetabledb_test_<name>`), since the runner
executes files in parallel and they would otherwise drop each other's data.

- `projects.test.ts` — membership, the invite/accept/decline cycle, late binding
  of invitations, ownership transfer
- `scoping.test.ts` — cross-tenant reads and writes are refused; the delete
  cascade
- `constraints.test.ts` — per-project seeding and isolation, plus an assertion
  that the seeded names still match the keys the C++ engine reads
- `import-export.test.ts` — id regeneration, reference remapping, round trips
- `generation.test.ts` — the per-project lock and global queue, against a stub
  engine on `:50051` whose calls park until the test releases them
- `socket-rooms.test.ts` — real handlers on a real socket server, with only the
  Auth0 handshake stubbed

**There is no frontend or C++ test target.** The only other automated gate is a
cppcheck GitHub Action, and that workflow is misconfigured (it fails on any
stderr output, and cppcheck writes progress to stderr), so it is permanently red.
Don't read CI status as signal.

When adding a test, prefer an explicit observation over a sleep. The generation
tests originally used fixed timeouts and were flaky; the stub engine now parks
each call so ordering is observed, not raced.

## Package manager

Yarn workspaces. A stray `package-lock.json` also exists at the repo root — it is
not authoritative, and running `npm install` will silently bypass the workspace
setup. Use `yarn`.

## Environment

Backend `.env`: `ISSUER_BASE_URL`, `AUDIENCE` (Auth0).
Frontend `.env`: `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`.

Both `.env` files are present locally and not templated — if you add a variable,
add it to both the file and this list.

## How the pieces talk

**Everything is project-scoped.** A project is one school. Entity REST paths
live under `/api/projects/:projectId/...`; sockets carry the project through a
`joinProject` handshake that puts the connection in a room. See
[ADR 0001](docs/adr/0001-project-scoped-multi-tenancy.md).

**Frontend → backend, two channels.** Reads go over REST through the
`ApiService` singleton (`frontend/src/modules/app/fetch.service.ts`) to
`http://127.0.0.1:3000/api/...` with an `Authorization: Bearer` header; the
`scoped()` helper in `modules/app/project.scope.ts` builds the project-prefixed
path. *Writes and live updates go over Socket.IO*, not REST — one `*.socket.ts`
per module, emitting `sendCreateX` / `sendUpdateX` / `sendDeleteX` and listening
for `createX` / `updateX` / `deleteX`, which are broadcast to the project room
only. When you add a mutation, the socket handler is the real path; the REST
`POST`/`PATCH`/`DELETE` routes exist but the UI does not use them.

**Backend → engine, gRPC.** `Generate(GenerateRequest{string input})` returns
`GenerateReply{string output}` — a whole JSON document in, a whole JSON document
out. Cancellation is real: the backend calls `call.cancel()` and the C++ server
polls `context->IsCancelled()` every 100 ms.

**Backend layering.** `api/` (routers) → `controllers/` → `services/` →
`models/`. The `socket/` handlers call the *same* services, so business logic
belongs in `services/` and nowhere else — **and so does the tenant filter**. A
filter applied in a controller would leave every socket write unscoped, and
every write in this application is a socket write.

Two middlewares carry the context: `userContext` turns the validated JWT into
`req.context.user`, and `requireProjectAccess` resolves `:projectId`, verifies
membership once and adds `req.context.projectId`. On the socket side the
equivalents are the `io.use` handshake (`middleware/socketAuth.ts`, sets
`socket.data.auth0Id` and `socket.data.userId`) and `ProjectRoomSocket.ts`
(`projectOf(socket)`, `roomOf(projectId)`).

## Things that will bite you

- **Constraint names are a wire protocol.** The DB constraint `name` field is
  used verbatim as a JSON key in the engine payload
  (`ImportExportService.getTimetableData` writes `object[constraint.name]`;
  `TimetableConfig.cpp` reads `data["OneTypeOfCourseOnADayClass"]`). The engine's
  own field names differ from these keys. Renaming a seeded constraint breaks
  generation at runtime, not at compile time.
- **Constraints are seeded per project**, at project creation, by
  `ConstraintService.seedForProject`. It uses `$setOnInsert`, so changing a
  description or `hard` flag in `DEFAULT_CONSTRAINTS` does *not* update projects
  that already exist.
- **Service functions take `projectId` first.** `getAll(projectId)`,
  `getById(projectId, id)`, `update(projectId, id, body)`. A socket handler must
  call `projectOf(socket)` and bail out if it is null rather than falling back to
  any global scope.
- **`update()` strips `project` from the payload**, so an entity cannot be moved
  between projects by editing it.
- **The `fitnes` typo is load-bearing.** `fitnesClas`, `fitnesTeacher`,
  `fitnesLocation` are spelled that way in both the C++ output and the TS that
  reads it. Fix both sides or neither.
- **Generation state is in memory** (`GenerationService`'s `inFlight` map) and
  mirrored onto the project as `generationStatus`. A restart clears the mirror at
  boot; don't treat the DB field as the source of truth for a *live* run.
- **The C++ grid is fixed at compile time**: `DAY_COUNT 5`, `HOUR_COUNT 8`,
  `#define`d in `stdafx.h` — and duplicated in `TimetableGeneratorExe/stdafx.h`.

## Known gaps and dead code

Don't treat any of this as intentional design.

- `backend/src/controllers/UserController.ts` is dead and broken — it calls
  `UserService` functions that are commented out. Nothing routes to it.
- `backend/src/index.ts` ends with a CommonJS `module.exports = app` inside an ESM
  file.
- `backend/TimetableGenerator.exe` — stale binary from the pre-gRPC era. Untracked
  and gitignored, so it is a local leftover rather than something in the repo.
- Committed C++ build output (`cmake/build/`, `.vs/`) and two Office `~$` lock
  files.
- `TimetableGeneratorEngine/Dockerfile` (untracked) does not build: gRPC is never
  installed (only protobuf v21.12 from source), and `generator.proto` sits outside
  the build context although the build references it at `../../generator.proto`.
  This was an experiment, not live work.
- Root `README.md` is stale — it describes invoking `timetable_generator.exe`
  directly and predates gRPC and Auth0.

## Roadmap

**Done — everything is project-scoped.** A user owns several projects, each
holding one complete school; one owner plus collaborators who can edit and
generate, with inviting, ownership transfer and deletion reserved to the owner.
Implemented in eight commits on `project-based-schools`; the decisions, the
rejected alternatives and the step order are in
[ADR 0001](docs/adr/0001-project-scoped-multi-tenancy.md).

Next, in order:

1. **Fix the initialization infinite loop.** When the input is over-subscribed
   and no free slot exists, `ClassHour::GetFreeTime` and
   `GetFreeTimeWithLocation` (`TimetableGeneratorEngine/TimetableGenerator/ClassHour.cpp:58`
   and `:70`) retry a random `Time` forever with no iteration cap and no failure
   path. This hangs before annealing even starts.
2. Dockerize.
3. Deploy.

Longer-term ideas from the thesis, not scheduled: parallel annealing runs,
feedback naming the conflict source when generation fails, manual editing of a
generated timetable, automatic fitness-parameter tuning.

## Conventions

- Docs and commit messages in English; the code and identifiers already are.
- Hungarian domain terms map to English code names — see CONTEXT.md.
- Business logic in `services/`, so REST and socket paths share it — and so
  tenant filtering has one home.
- Architecture decisions get an ADR in `docs/adr/`, numbered sequentially.
- Frontend routes are file-based (`unplugin-vue-router`); `src/typed-router.d.ts`
  is generated — don't hand-edit it. Route paths are case-sensitive and match the
  filename, so `pages/Generate.vue` is `/Generate`, not `/generate`.
