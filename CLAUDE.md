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

**There is no test suite anywhere** — no framework, no test script, no C++ test
target. The only automated gate is a cppcheck GitHub Action, and that workflow is
misconfigured (it fails on any stderr output, and cppcheck writes progress to
stderr), so it is permanently red. Don't read CI status as signal.

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

**Frontend → backend, two channels.** Reads go over REST through the
`ApiService` singleton (`frontend/src/modules/app/fetch.service.ts`) to
`http://127.0.0.1:3000/api/...` with an `Authorization: Bearer` header. *Writes
and live updates go over Socket.IO*, not REST — one `*.socket.ts` per module,
emitting `sendCreateX` / `sendUpdateX` / `sendDeleteX` and listening for the
broadcast `createX` / `updateX` / `deleteX`. When you add a mutation, the socket
handler is the real path; the REST `POST`/`PATCH`/`DELETE` routes exist but the
UI does not use them.

**Backend → engine, gRPC.** `Generate(GenerateRequest{string input})` returns
`GenerateReply{string output}` — a whole JSON document in, a whole JSON document
out. Cancellation is real: the backend calls `call.cancel()` and the C++ server
polls `context->IsCancelled()` every 100 ms.

**Backend layering.** `api/` (routers) → `controllers/` → `services/` →
`models/`. The `socket/` handlers call the *same* services, so business logic
belongs in `services/` and nowhere else.

## Things that will bite you

- **Constraint names are a wire protocol.** The DB constraint `name` field is
  used verbatim as a JSON key in the engine payload
  (`ImportExportService.getTimetableData` writes `object[constraint.name]`;
  `TimetableConfig.cpp` reads `data["OneTypeOfCourseOnADayClass"]`). The engine's
  own field names differ from these keys. Renaming a seeded constraint breaks
  generation at runtime, not at compile time.
- **Constraints are seeded at boot** by `ConstraintService.initializeConstraints()`,
  which only inserts names that are missing. Changing a seeded description or
  `hard` flag does *not* update existing rows in your local DB.
- **The `fitnes` typo is load-bearing.** `fitnesClas`, `fitnesTeacher`,
  `fitnesLocation` are spelled that way in both the C++ output and the TS that
  reads it. Fix both sides or neither.
- **Socket.IO is not authenticated.** REST is globally guarded by
  `express-oauth2-jwt-bearer`, but the socket layer has no auth middleware — and
  the socket layer is where all writes happen. Scheduled for fixing, see below.
- **`deleteMany()` is called with no filter** in all five `imp()` functions, so
  an import currently wipes the entire collection for everyone.
- **The C++ grid is fixed at compile time**: `DAY_COUNT 5`, `HOUR_COUNT 8`,
  `#define`d in `stdafx.h` — and duplicated in `TimetableGeneratorExe/stdafx.h`.

## Known gaps and dead code

Don't treat any of this as intentional design. Items marked *(ADR 0001)* have a
decision attached and are scheduled.

- **Socket.IO is unauthenticated** and `sendSyncUser` trusts a client-supplied
  `auth0Id` without checking it against any token. Fixed in step 1 *(ADR 0001)*.
- `backend/src/routes/timetable.ts` — dead but **mounted** at `/timetable`, with
  its own complete unscoped generation path. From the pre-gRPC era when the
  backend wrote `in.json` and shelled out to an `.exe`. References an undefined
  MQTT `client` and would throw if ever called. To be deleted in step 1
  *(ADR 0001)*.
- `backend/TimetableGenerator.exe` — stale committed binary from that same era.
  Deleted alongside it.
- The five `imp()` functions use `array.forEach(async x => await create(x))`,
  which does not await — imports signal completion before inserts finish and race
  each other's `deleteMany`. Fixed in step 8 *(ADR 0001)*.
- `socket.off` appears nowhere on the frontend; listeners registered in
  `onMounted` are never torn down, so they stack on every navigation. Fixed in
  step 5 *(ADR 0001)*.
- `backend/src/index.ts` ends with a CommonJS `module.exports = app` inside an ESM
  file.
- Committed C++ build output (`cmake/build/`, `.vs/`) and two Office `~$` lock
  files.
- `TimetableGeneratorEngine/Dockerfile` (untracked) does not build: gRPC is never
  installed (only protobuf v21.12 from source), and `generator.proto` sits outside
  the build context although the build references it at `../../generator.proto`.
  This was an experiment, not live work.
- Root `README.md` is stale — it describes invoking `timetable_generator.exe`
  directly and predates gRPC and Auth0.

## Roadmap

In progress — **make everything project-scoped.** Today all entities are global;
there is effectively one implicit project. Target shape: a user owns several
projects, each holding one complete school; one owner plus collaborators who can
edit and generate, with inviting, ownership transfer and deletion reserved to the
owner.

The design is settled — see
[ADR 0001](docs/adr/0001-project-scoped-multi-tenancy.md) for the decisions, the
rejected alternatives, and the eight-step implementation order. Headline numbers:
45 unscoped Mongoose queries, 23 global `io.emit` broadcasts, 35 controller
handlers and 12 frontend fetch functions to thread a project through, plus a
socket layer that currently has no authentication at all.

Two rules from that ADR worth having in front of you while working:

- **The tenant filter belongs in `services/`**, never in controllers — socket
  handlers bypass controllers and call services directly, so a filter placed
  higher leaves every write unscoped.
- **Socket handshake auth ships first**, before any scoping. Tenant checks on an
  anonymous socket guard a caller the server cannot identify.

The uncommitted work on `SideBar.vue` / `index.vue` / `Generate.vue` is an early
sketch of the frontend flow; step 5 of the ADR replaces it, including the
placeholder `appStore.projectId = "set"`.

Then, in order:

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
