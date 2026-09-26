# ADR 0001 — Project-scoped multi-tenancy

- **Status:** Accepted
- **Date:** 2026-09-26
- **Supersedes:** the note in `CLAUDE.md` describing one project per owner

## Context

Every entity in the system is global. There is exactly one implicit school: all
teachers, subjects, classes, locations, class hours and constraints live in
unpartitioned collections, and any authenticated user sees and edits all of them.

A survey of the backend found no tenant awareness of any kind:

| Area | Sites | State today |
| --- | --- | --- |
| Mongoose queries in `services/` | 45 | none filtered |
| Unfiltered `deleteMany()` | 5 | an import by any user wipes every collection |
| `io.emit` global broadcasts | 23 | every client receives every mutation |
| Socket inbound handlers | 22 | no handshake, no auth, no rooms |
| Controller handlers | 35 | call services directly; `req.auth` is validated but never read |
| Express routers | 6 | no project segment |
| Frontend fetch functions | 12 | bare resource paths |
| Models needing a scope key | 6 | — |

Three gaps have no existing code to extend: there is no socket authentication or
room membership (`io.use` and `socket.join` appear nowhere), there is no
per-request context object, and the `Project` model exists but is imported by
nothing.

We want a user to own several projects, each holding one complete school.

## Decision

### Membership

Multiple projects per user. Each project has exactly one owner and any number of
collaborators. Collaborators may edit every entity and run generation.
**Owner-only** powers: inviting members, transferring ownership, deleting the
project.

Membership lives in its own collection rather than in arrays on `Project`:

```
ProjectMember { projectId, userId, role, status }
  index { userId }     // "list my projects" — runs on every login
  index { projectId }  // "who is on this project"
```

`Project.owner` stays denormalized so the ownership check is a single read.
Invitations are `ProjectMember` rows with `status: 'pending'` keyed by email.

A `role` column exists from the start although only one role is used, so adding
a read-only viewer later is a data change rather than a schema migration.

### Identity

`syncUser` returns the synced user document to the client, which then knows its
own Mongo `_id` — required to name an owner or a collaborator. User identity is
`ObjectId ref User`, not a raw `auth0Id` string, because invitations must resolve
an email to a user that may not exist yet.

At login, pending invitations are matched by email and bound to the user, gated
on Auth0's `email_verified` claim.

### Enforcement

A `project` field on all six entity models, with compound indexes.

**The tenant filter lives in `services/`, not in controllers.** The socket
handlers bypass controllers entirely and call the same services directly, so a
filter applied above the service layer would leave every socket write — which is
every write in the application — unscoped.

Transport:

- **REST** — path segment `/api/projects/:projectId/teachers`. A middleware
  resolves `req.params.projectId`, verifies membership once, and attaches
  `req.context`; controllers pass `req.context.projectId` down rather than each
  re-deriving it.
- **Sockets** — `socket.join(projectId)`; all 23 `io.emit` calls become
  `io.to(room).emit`. The four per-caller delete-error branches become
  `socket.emit`.
- **Frontend** — routes carry the project: `/p/:projectId/...`.

Socket handshake authentication (`io.use`, verify the Auth0 JWT, identity onto
`socket.data`) ships **before** any scoping work.

### Constraints

Seeded per project at project creation, replacing the current boot-time global
seed in `initializeConstraints()`. This is the one entity where adding a scope
column is not the whole fix: the 7 constraint rows are shared singletons today,
and `updateByName` does a global `findOne({name})` that would return an arbitrary
project's row.

### Generation

One generation per project, enforced on the backend and not only by graying out
the button. Across projects, requests queue (initially a single promise chain)
rather than being rejected, since "another school is generating" is not something
a user can act on.

Generation state persists on the `Project` document (`generationStatus`,
`generationStartedAt`). The socket broadcast remains the live-update path, but
the button derives its state from persisted data so that a page reload or a
collaborator arriving mid-run sees the truth.

### Deletion

Project deletion hard-cascades across all six entity collections, behind a
type-the-project-name confirmation, with an export offered first.

### Import / export

Export files become portable between projects and installations: ids are
regenerated on import and entity references remapped through an old-id → new-id
map. Today export dumps raw documents including `_id` and import re-creates them
verbatim, so the same file cannot be loaded into two projects.

### Existing data

Assumed wiped. No backfill migration is written; the import/export feature is the
recovery path.

## Consequences

- The C++ engine is unchanged. It receives one JSON document built by
  `getTimetableData()`; once that export is project-scoped the payload is already
  a single school. Scoping stops at the gRPC boundary.
- `routes/timetable.ts` must be deleted, not merely ignored. It is dead but
  *mounted*, and contains a complete unscoped generation path (six `getAll()`
  calls, three `addCatalog()` writes) that would bypass tenant isolation.
- Two latent bugs must be fixed as part of this work rather than after it. The
  five `imp()` functions use `array.forEach(async x => await create(x))`, which
  does not await — imports currently signal completion before inserts finish and
  race each other's `deleteMany`. And `socket.off` appears nowhere on the
  frontend, so listeners stack on every navigation; with project switching, stale
  listeners from one project would fire while viewing another.
- Entity names remain non-unique. No `{project, name}` uniqueness is introduced.

## Alternatives considered

**A separate Mongo database per project.** Perfect isolation, but it complicates
connection management and makes any future cross-project feature — templates,
"copy last year's school" — awkward. Rejected.

**Entities as subdocuments of `Project`.** Rejected outright: `ClassHour`
references teachers and subjects by `ObjectId`, and the engine payload is built
from five separate collections.

**Embedded `collaborators[]` / `invitations[]`** (the current schema). Adequate
for listing a project's members, poor for "list my projects", which becomes a
scan matching an array element — the most frequent query in the application once
projects exist.

**An `X-Project-Id` header instead of a path segment.** Far cheaper (one
injection point in `App.vue`, one middleware) but makes the project invisible in
logs and in the network tab, and decouples the URL being viewed from the data
returned. Rejected despite the cost difference.

**Soft-deleting projects.** Would require a second `deleted: false` filter on all
45 queries in perpetuity, with no benefit unless an undelete UI is also built.

## Implementation order

Each step leaves the application working.

1. Socket handshake auth; `syncUser` returns the user; delete `routes/timetable.ts`
   and its mount, plus the stale `backend/TimetableGenerator.exe`.
2. `Project` and `ProjectMember` models, services, API and sockets — a working
   project list with nothing scoped yet.
3. `project` field on the six models plus indexes; thread `req.context.projectId`
   through 6 routers, 35 controller handlers and 45 queries; fix the 5 unfiltered
   `deleteMany` calls.
4. Socket rooms — `join` plus the 23 broadcasts.
5. Frontend `/p/:projectId/...` routes, the 12 fetch paths, listener cleanup.
   This subsumes the in-flight `SideBar.vue` / `index.vue` / `Generate.vue` work
   and replaces the placeholder `projectId = "set"`.
6. Per-project constraint seeding.
7. Generation lock and persisted status.
8. Portable import/export.

Step 3 is the only step that cannot be split further without leaving the
application broken.
