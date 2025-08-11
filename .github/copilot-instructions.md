
# AI Menu Planner — Technical Spec for Copilot

Purpose: Equip AI with precise technical context of stacks, architecture, API contracts, and entities. Planning/milestones are intentionally excluded.

## Product scope (concise)
- Weekly planning UI for 7 days with three meal slots per day (breakfast, lunch, dinner).
- Recipe storage and normalization, recommendations, and shopping lists are provided by an external API (API is the source of truth for all data).
- Client provides calendar-like planner with Notion-style drag-and-drop from a recipe library, and clipboard export for shopping lists.

## Tech stack
- App: Vite + React + TypeScript
- Styling: Tailwind CSS (utility-first). Optional Radix UI primitives for accessible components.
- State management: Zustand (UI/client state slices) + TanStack Query (server state: fetching, caching, retries).
- Data access: fetch/axios client with typed wrappers; zod-based response validation.
- Persistence: API-backed; optional IndexedDB (Dexie) read-through cache for offline viewing.
- Drag-and-drop: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/accessibility
- Icons: Heroicons (npm import, tree-shaken)
- Utilities: zod, date-fns, nanoid/uuid, lodash-es (optional)
- Testing: Vitest + React Testing Library; Playwright optional for e2e
- Lint/format: typescript-eslint, Prettier

## Runtime configuration
- VITE_API_BASE_URL
- VITE_APP_ENV (development|staging|production)
- VITE_FEATURE_FLAGS (optional JSON string)

## Architecture overview
- Presentation (React components): pages/layout; feature widgets (RecipeLibrary, WeeklyPlannerGrid, ShoppingListDrawer).
- State: TanStack Query for server data; Zustand for UI-only state (filters, selections, drag state, dialogs).
- Data access: api/* modules with a shared http client, zod schemas, and typed functions per resource.
- Optional local cache: IndexedDB mirrors of recipes, last MenuWeek, and last ShoppingList; optimistic writes with rollback on failure.
- Feature boundaries:
  - recipes/: browse/search, details (render raw_text and normalized_json)
  - menu/: weekly planner (7×3 grid), meal assignment via DnD
  - recommendations/: fetch/apply suggestions from API
  - shopping/: view/edit items tied to a MenuWeek; copy-to-clipboard export

## Final entities (authoritative)
- Recipe: id, title, raw_text, normalized_json, tags, cuisine, diet, time_minutes, servings, nutrition?
- HouseholdProfile: members [name, preferences, restrictions], defaults per member
- MenuDay: date, meals { breakfast|lunch|dinner: recipe_id/title }
- MenuWeek: id, week_start (YYYY-MM-DD), profile_snapshot, days[7 × MenuDay], notes
- ShoppingList: id, week_id, items[{ name, qty, unit, aisle?, notes? }], status (draft|sent)

Notes
- MenuDay.meals supports either a recipe_id or a free-text title to allow quick planning before the recipe exists.
- normalized_json is produced/maintained by the API (ingredients, steps, parsed quantities); client treats it as opaque JSON.

## Example TypeScript shapes (documentation only)
- type MealRef = { recipe_id?: string; title?: string }
- interface Recipe { id: string; title: string; raw_text: string; normalized_json?: unknown | null; tags: string[]; cuisine?: string; diet?: string; time_minutes?: number; servings?: number; nutrition?: Record<string, unknown> | null }
- interface HouseholdMember { name: string; preferences?: Record<string, unknown>; restrictions?: Record<string, unknown> }
- interface HouseholdProfile { members: HouseholdMember[]; defaults?: Record<string, unknown> }
- interface MenuDay { date: string; meals: { breakfast?: MealRef; lunch?: MealRef; dinner?: MealRef } }
- interface MenuWeek { id: string; week_start: string; profile_snapshot?: HouseholdProfile | null; days: MenuDay[]; notes?: string }
- interface ShoppingItem { name: string; qty?: number; unit?: string; aisle?: string; notes?: string }
- interface ShoppingList { id: string; week_id: string; items: ShoppingItem[]; status: 'draft' | 'sent' }

Conventions
- All data is served by the API; the client performs no local-only business logic for recipes, normalization, recommendations, or list generation.
- Auth: Bearer token ready (future); anonymous allowed for development.
- Validation: zod schemas applied to responses; unknown fields tolerated.
- Errors: JSON envelope { error: { code, message, details? } } with proper HTTP status.
- Caching: ETag/Last-Modified preferred; client honors 304 where provided.
- Idempotency: POST endpoints accept Idempotency-Key header for safe retries.

## Drag-and-drop interactions
- Library → MealCell: set meal to { recipe_id, titleSnapshot } and persist via PUT /menu-weeks/:id/days/:date.
- MealCell ↔ MealCell: move/swap MealRef values across cells; persist impacted days.
- Keyboard DnD: pointer and keyboard sensors; accessible drop indicators and focus management via @dnd-kit/accessibility.

## UI behavior details
- Weekly planner grid: 7 columns (Mon–Sun) × 3 rows (B/L/D). Meal cells show assigned recipe title.
- Recipe library: searchable/filtered list from API; draggable RecipeCard sources use recipe_id.
- Suggestion panel: calls /recommendations for week/day/meal and applies returned recipes; duplicates allowed (API may also return repeats).
- Clipboard export: formats current ShoppingList items into a shareable plain-text block (group by aisle when present).

## State and sync rules
- Server state (recipes, profile, menu weeks, shopping lists) flows through React Query; cache keys by resource and parameters.
- UI state (filters, dialogs, selections, drag hints) lives in Zustand; reset on route changes as appropriate.
- Optimistic updates permitted for meal assignments and shopping list edits; rollback on error.
- Optional offline cache for read paths; writes require connectivity.

## Validation schemas (zod, illustrative)
- Use zod to validate the entities above; keep normalized_json as z.unknown().
- Narrow MealRef to require at least one of recipe_id or title.

## Accessibility (a11y)
- Keyboard operable DnD; visible focus outlines; ARIA roles/labels on droppables and interactive chips.
- Announce assignment changes via aria-live regions (e.g., “Assigned Spaghetti to Monday dinner”).

## Performance considerations
- Virtualize long recipe lists if needed (react-virtual).
- Debounce rapid meal updates; batch server PATCH/PUT when moving multiple items.
- Tune React Query staleTime and cacheTime for recipe lists and current week.

## Security & privacy
- HTTPS only; no secrets in client; sanitize any rendered raw_text.
- Prepare auth header injection and CSRF-safe patterns.

## Directory layout (suggested)
- src/
  - api/ (http client, schemas, resource clients)
  - state/ (zustand slices)
  - features/
    - recipes/
    - menu/
    - recommendations/
    - shopping/
  - components/
  - hooks/
  - styles/
  - app/

## Iconography
- Heroicons (outline/solid). Import individual icons to reduce bundle size.

## Clipboard export format (example)
Shopping List — Week of {week_start}
- [ ] 2 x can | Chickpeas (Aisle: Canned)
- [ ] 500 g | Chicken thighs
- [ ] 1 | Onion — diced
Ungrouped:
- [ ] Salt

Status: all items planned for v1 unless noted in Out of Scope.

## Key assumptions (confirm or adjust)

- Household is a single shared account; no auth in v1. All data local-first in the browser (IndexedDB) with optional future API sync.
- Week is Monday–Friday only; a day represents the whole meal plan (no Breakfast/Lunch/Dinner breakdown; no Snacks in v1).
- Recipes may be entered as free text; basic parsing later to extract ingredients when possible.
- Shopping list aggregates ingredients across the planned week; minimal unit normalization (cup/tsp variants grouped where obvious), advanced parsing deferred.
- Recommendations v1 are lightweight; repeats are allowed (no strict dedup). Can add variety weighting later.

## Success criteria

- A user can: add recipes (free text or minimal fields), plan a week via drag-and-drop, view suggestions, and export/mark-off a shopping list. All persists between sessions.
- Simple, responsive UI that feels like a weekly calendar with smooth DnD, keyboard accessible.

## High-level architecture

- Frontend: Vite + React + TypeScript.
- State: UI state with Zustand (simple) or Redux Toolkit (if we need time travel/devtools). Data persistence via IndexedDB (Dexie) for local-first storage, with a data service layer to swap in API later.
- Drag-and-drop: @dnd-kit/core and @dnd-kit/sortable.
- Icons: Heroicons via npm.
- Optional server (later): API for dietary restrictions/cuisines and data sync (e.g., Supabase/Firebase/Express).

## Data model (v1 minimal)

- Household:
  - id, name, members: ["husband", "wife", "daughter"], dietaryPreferences?: tags, allergies?: tags
- Recipe:
  - id, title, rawText (full unstructured), ingredients?: [{ name, quantity?, unit?, note? }], steps?: string[], tags?: string[], durationMins?, sourceUrl?, imageUrl?
- PlanEntry:
  - id, date (ISO, yyyy-mm-dd), recipeId, orderIndex? (for stacking within a day), servings?
- ShoppingItem (derived):
  - id, name, totalQuantity?, unit?, aggregatedFrom: PlanEntry[], checked: boolean, section?: category

Note: Ingredients are optional; we can compute shopping lists from the parsed subset and include the rest in an "Unparsed items" bucket with the recipe title as context.

## Core user flows

1) Manage recipes
- Add recipe (free text or minimal form). Attach tags (e.g., vegetarian, kid-friendly).
- Edit, duplicate, delete. Search/filter by tag, title.

2) Weekly planning
- Calendar-like 5×1 grid (Mon–Fri). Left side shows recipe library with search/filter.
- Drag recipe card into a day cell. Stack multiple recipes per day and reorder within a day. Click to open details.
- Adjust servings per day or per recipe (optional in v1) and note leftovers (optional).

3) Recommendations
- Suggest recipes for empty days based on dietary prefs (from API later), quick/long balance, and light variety weighting.
- Repeats are allowed in the same week. User can accept, skip, or refresh suggestions.

4) Shopping list
- Generate from the current week (Mon–Fri). Aggregate ingredients, group by category (produce, dairy, etc.) when possible.
- Mark items as purchased; items persist. Primary export is "Copy to clipboard" with a shareable, well-formatted text block (optional Web Share API later).

## UI outline

- Top app bar: week selector (prev/next/today), household summary, icons for settings/help.
- Left panel: Recipe Library (search, filters, add). Infinite list or paginated.
- Main: Weekly grid (Mon–Fri). Empty-state hints + drop targets. Each cell shows stacked recipe chips + quick actions.
- Right panel/drawer: Shopping list (toggle) or Recipe details editor.
- Mobile: stacked views; DnD retained where possible; quick add actions.

## Accessibility and i18n
- Keyboard DnD fallback via @dnd-kit accessibility helpers; focus cues on droppables.
- Semantic landmarks, high-contrast theme support, labels for icons.
- English-only v1; i18n-ready copy structure for later.

## Recommendations (v1 algorithm)

- Inputs: current week plan, recipe library, household prefs.
- Rules:
  - Repeats are allowed; prefer variety but do not enforce uniqueness.
  - Balance tags: rotate proteins or cuisines when signals exist.
  - Respect household dietary exclusions (from API when available).
  - Weight recent popularity lower to increase variety (softly).
- Output: ranked list per empty slot; surface top 3 per slot with a "shuffle" action.

## Shopping list aggregation rules (v1)

- Combine identical ingredient names case-insensitively; basic unit coalescing for tsp/tbsp, g/kg, ml/l (simple conversions only when unit data present).
- Unparsed items: list recipe title + the raw ingredient line as a single actionable line.
- Allow manual edits (add custom item, change quantity/unit, move to section, check off). Provide a one-click "Copy list" action.

## Tech choices and dependencies

- Vite + React + TypeScript
- State: Zustand (simple and lightweight). Alternative: Redux Toolkit if we need advanced tooling.
- Persistence: Dexie (IndexedDB). Alternative: localStorage for very small MVP.
- DnD: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/accessibility
- UI: Tailwind CSS (fast layout) or CSS Modules; small component lib optional (Radix primitives for a11y).
- Icons: Heroicons
- Utilities: zod (validation), date-fns (dates), uuid (ids)

## Milestones & acceptance criteria

M0 — Scaffolding (Done when):
- Vite + React + TS app builds and runs; routing set up; base layout and theming.

M1 — Recipe library (Done when):
- Users can add/edit/delete recipes with title and rawText; optional tags.
- List supports search by title/tag; data persists across reloads.

M2 — Weekly planner + DnD (Done when):
- Mon–Fri grid with a single day slot; drag from library into day cells; stack and reorder within a day; move across days.
- Entries persist; click opens details.

M3 — Shopping list (Done when):
- Generate list from current week (Mon–Fri). Aggregate duplicates. Mark as done. Copy to clipboard with shareable formatting.

M4 — Recommendations (Done when):
- Suggest recipes for empty days; user can apply or shuffle. Honors basic prefs/exclusions (when API available). Repeats allowed.

M5 — Polish (Done when):
- Heroicons in place, responsive mobile layout, keyboard a11y for DnD; basic unit conversion.

M6 — API integration (Later):
- Introduce backend API for dietary prefs/cuisines and data sync. Abstract data access behind a service interface.

## Risks and mitigations

- Ingredient parsing complexity: keep optional; provide unparsed bucket and manual edits.
- DnD on mobile: test early; provide add buttons as fallback.
- Local-only persistence: clearly mark; plan for sync later if needed.

## Decisions confirmed

- Week scope: Monday–Friday only; one meal plan per day (no sub-slots, no snacks in v1).
- Dietary restrictions/cuisines: will come from an API later.
- Storage: local-first for v1; plan to add API sync later.
- Icons: Heroicons.
- Export: shareable clipboard text.
- Recommendations: repeats allowed; variety is a soft preference.
- Images: not required in v1.

## Remaining open questions

1) Multiple recipes per day: should we allow more than one recipe per day (stacked), or exactly one? Current plan allows multiple.
2) Any hard limits on weekly recipe count (e.g., max 10)?
3) Do we want a basic "sections" taxonomy for shopping list (produce/dairy/etc.) now, or later?
4) API scope when added: only preferences and sync, or also recipe library and recommendations?

## Out of scope for v1

- Multi-user auth/sync, role permissions, shared households.
- Advanced NLP ingredient parsing, nutrition calculations, cost optimization.
- External recipe API imports and auto-scraping.
- Meal prep scheduling and leftovers planning logic.

## Implementation notes for Copilot

- Keep modules small and testable; lift business rules (aggregation/recommendations) into pure functions with unit tests.
- Persist writes behind a data service (Dexie). Keep UI state separate from persisted data.
- Favor a11y: focus management and keyboard interactions for DnD actions.
- Seed with a few sample recipes for empty states.

## Example data shapes (illustrative)

Recipe (minimal):
{
  "id": "r_123",
  "title": "Chicken Teriyaki",
  "rawText": "Chicken thighs...\nSauce: soy, mirin, sugar...",
  "tags": ["quick", "chicken"]
}

PlanEntry:
{
  "id": "p_101",
  "date": "2025-08-11",
  "meal": "Dinner",
  "recipeId": "r_123"
}

ShoppingItem (derived):
{
  "id": "s_77",
  "name": "Soy sauce",
  "totalQuantity": 100,
  "unit": "ml",
  "aggregatedFrom": ["p_101"],
  "checked": false
}
