# Todo++

A task manager built with Next.js, TypeScript, and Zustand. Tasks carry a category,
priority, due date, and manual sort order, and persist to `localStorage` — no backend.

Portfolio Project 1 from `../BUILD-01-task-manager.md`.

## Features

- Add, edit, complete, and delete tasks
- Categories with colors; custom categories, deletable with safe reassignment
- Priorities (low / medium / high) and due dates with overdue highlighting
- Filter by status and category, debounced full-text search, five sort modes
- Drag-to-reorder (mouse and keyboard) via dnd-kit
- Stats row, header progress bar, and a due-date reminder banner
- Keyboard shortcuts: `/` or `⌘/Ctrl+K` to search, `n` for a new task, `Esc` to exit a field

## Getting started

Requires **Node 22.22+** (jsdom 30, used by the test suite, does not support Node 20).
`.nvmrc` pins it:

```bash
nvm use
npm install
npm run dev          # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |

## Architecture

```
src/
├── types/index.ts       Task, Category, FilterStatus, SortOption — the data contract
├── stores/
│   ├── taskStore.ts     Zustand store: all state + all mutations (persist + immer)
│   └── selectors.ts     Derived data: useFilteredTasks, useTaskStats
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useDueReminders.ts
├── lib/utils.ts         cn(), and local-safe date-input parsing
├── components/          UI; each reads the store directly
└── app/                 App Router layout + page
```

Data flows one way: `types → store → selectors → components`. No component passes state
to another; they all subscribe to the store. Only the raw task list is stored — filtered
views, counts, and reminder buckets are derived with `useMemo`, so there is a single
source of truth.

## Notes on the tricky parts

Four bugs the naive version of this app has, and how they're handled here:

**Dates don't survive `localStorage`.** `persist` serializes through JSON, so
`new Date()` comes back as a string still typed as `Date` — and `format()` throws on it.
`onRehydrateStorage` in `taskStore.ts` revives every date field on load. The general
lesson: across a serialization boundary, types are a promise, not a fact.

**`new Date('2026-08-05')` is UTC.** A bare date string parses as UTC midnight, so west
of UTC the date the user picked renders as the day before. `parseDateInput()` in
`lib/utils.ts` builds the Date from parts instead, pinning it to local midnight.

**Reorder indices don't match the store.** The list the user drags is filtered and
sorted, so its indices point at the wrong entries in the full array. `reorderTasks` takes
ids and resolves them against `state.tasks` itself. Dragging is also disabled unless the
list is showing manual order, since reordering a priority-sorted list means nothing.

**Deleting a category orphans its tasks.** `deleteCategory` reassigns them to
`FALLBACK_CATEGORY_ID` (`personal`), which is itself undeletable.

## Testing

`src/stores/*.test.ts` covers the store actions and the derived selectors — the layers
where the real logic lives, and where regressions are cheapest to catch. Store tests need
no DOM; selector tests use `renderHook` from Testing Library.

## Not implemented

Dark mode. The CSS variables are in `globals.css`, but flipping them alone left form
inputs with near-white text on white backgrounds — it needs `dark:` variants across every
component to work, so it was left out rather than shipped broken.
