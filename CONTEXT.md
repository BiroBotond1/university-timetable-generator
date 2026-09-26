# CONTEXT.md — domain model

The vocabulary of this system. Several words mean something narrower here than in
plain English, and the Hungarian terms from the thesis don't map one-to-one onto
the code names. When in doubt, this file wins over intuition.

## Glossary

| Code name | Hungarian | What it actually means |
| --- | --- | --- |
| **Class** | osztály | A *group of students* that moves through the week together (e.g. "9.A"). **Not** a lesson and not an OOP class. Has a default `location`. |
| **ClassHour** | tanóra | The central input entity: "class X needs `number` lessons per week of subject Y, taught by teacher Z". One row per (class, subject, teacher) triple, carrying a weekly count and a `weight`. |
| **Subject** | tantárgy | A taught subject. Carries a list of `locations` it *may* be taught in. Empty list means "wherever the class normally sits". |
| **Teacher** | tanár | Has `inappropriateDates` — times they cannot teach. |
| **Location** | tanterem | A room. Has `reservedDates` — times it is unavailable. |
| **Catalog** | katalógus | The **output**: a filled `DAY_COUNT × HOUR_COUNT` grid (5 × 8) of scheduled lessons. Every class, every teacher and every location each gets its own catalog — three views of one schedule. |
| **Constraint** | megszorítás | A named rule, `hard` or soft, that can be toggled `active`. |
| **Fitness** | fitnesz | The solution quality score. Higher is better. |
| **Project** | projekt | A tenant: one school's worth of data. Owned by one user, shareable with collaborators. Modelled but not yet wired up. |

Note the direction of the `Class`/`ClassHour` relationship: a `Class` is a group
of *students*, so "class hour" is a lesson that group needs, not an hour that an
OOP class has.

## The generation problem

Input is the set of `ClassHour` rows plus the availability data on teachers and
locations. Output is three sets of catalogs. Between them sits a **simulated
annealing** search — not a genetic algorithm, not a CSP solver.

**Fitness** is the sum of satisfied constraints. Satisfying *all* hard
constraints for an entity adds **1000** to that entity's score; individual
constraint contributions are typically in the 1–10 range. So a fitness above
`1000 × (number of entities)` means a *valid* timetable, and the remainder
measures how nice it is. This is why the reported numbers look like 9605 or
29926 rather than percentages.

**Hard constraints** (must hold for the timetable to be usable):

- `OneTypeOfCourseOnADayClass` — a class gets at most one lesson of a given
  subject per day.
- `ClassCoursesStartsAtEight` — every class's day starts at 8:00.
- `NoHoleHoursInClass` — no gaps in a class's day.

**Soft constraints** (optimized for, but optional):

- `EvenHoursInClass` — spread a class's lessons evenly across the week.
- `NoHoleHoursInTeacher` — minimize gaps in a teacher's day.
- `EvenHoursInTeacher` — spread a teacher's lessons evenly.
- `CoursesWeightInClass` — schedule high-`weight` subjects earlier in the day.

These names are not just labels — they are the JSON keys sent to the engine. See
CLAUDE.md, "Things that will bite you".

## How the search works

`TimetableGenerator::Run` does four things:

1. `Database::Fill` — parse the JSON input into entities.
2. `InitLinearAnnealingParameter` — cooling rate α = `0.1` if there are ≤ 14
   classes, else `0.01`. Bigger schools need slower cooling to find a valid
   solution at all.
3. `InitCatalogs` — place every lesson at a *random free* slot. This is the
   greedy seeding step, and it is where the known infinite loop lives.
4. `SimulatedAnnealing` — linear cooling from `MAX_TEMP 100000` down to
   `MIN_TEMP 2`. Each step deep-copies the database, perturbs it, and accepts
   the result if fitness improved or with probability `exp((f_new − f_cur) / t)`.
   The best database seen is kept separately.

**Moves** (`Changes`): `ChangeLocations`, `SwapLocations`, `SwapTeachers`, each
applied at randomly chosen free times.

Because every step deep-copies the whole database, *the deep copy is the hot
path*. Entities are held as `shared_ptr` and cloned in dependency order —
referenced entities first — so that pointers in the copy point at the copy.
`weak_ptr` is used deliberately to break reference cycles; an earlier version
leaked memory until the machine froze because cyclic `shared_ptr` references kept
refcounts above zero. Don't "simplify" a `weak_ptr` into a `shared_ptr` here.

## Known performance envelope

Measured on a Ryzen 7 4800H / 16 GB, five runs per school:

| Classes | Outcome |
| --- | --- |
| ≤ 14 | Valid timetable every time, under ~5 minutes |
| 16 | Valid in 60% of runs (α = 0.1) |
| 20 | Failed 5/5 at α = 0.1 |
| 20–25 | Valid at α = 0.01, but 1–2 hours of runtime |
| 30 | Does not produce a valid timetable |

So the honest claim is "reliable to ~14 classes quickly, ~25 classes slowly".
Lowering α further trades runtime for success rate, and at 30 classes a single
generation was estimated to approach a full day.

## Data shape on the wire

One JSON string each way.

**Request** — the 7 constraint names as booleans at the top level, plus
`teachers`, `locations`, `classes`, `subjects`, `classHours`, each a collection
of Mongo documents keyed by `_id`. `classHours` carry nested `teacher._id`,
`class._id`, `subject._id`.

**Response** — `classCatalogs`, `teacherCatalogs`, `locationCatalogs`, each
mapping `_id` → a grid of `{class, subject, teacher, location}` cells, plus
`active` (whether all hard constraints hold), `fitnesClas`, `fitnesTeacher`,
`fitnesLocation` (note the spelling) and `elapsedTime`.

The backend writes the catalogs straight back onto the corresponding entities via
`addCatalog` on each service.

## History

The project began as a BSc thesis (2023) and was substantially rebuilt for an
MSc thesis (2025): Vue 2 → Vue 3 with the Composition API, a Yarn monorepo,
Tailwind, Socket.IO replacing REST for entity mutations, a local-database +
smart-pointer redesign inside the C++ engine, CMake for cross-platform builds,
and gRPC replacing the previous "write `in.json`, shell out to an `.exe`"
integration. The 2025 thesis describes custom JWT + bcrypt authentication; that
has since been replaced by Auth0. **Where the thesis and the code disagree, the
code is right** — treat the thesis as design rationale and history, not as a
specification.
