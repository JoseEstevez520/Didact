/**
 * @didact/core
 *
 * Entry point for layer 3 (education molecules) of the 3-layer architecture described in
 * `specs/education-components/design.md` §2:
 *
 *   3. Education molecules  — Flashcard, MatchingExercise, QuizItem, SpacedRepetitionDeck,
 *                              Glossary, Hint, Timeline, Rubric, MasteryBadge, code exercise
 *                              (RF-11, Sandpack), QTI graphical/numeric interactions
 *                              (research.md §9.2) — broad scope organized in complexity waves,
 *                              see this package's README.md and research/decisions.md
 *   2. Styled layer         — Tailwind v4 + `cva` (class-variance-authority) over
 *                              `@didact/theme`'s tokens (CSS custom properties + `@theme` block)
 *   1. Accessible primitives — accessible behavior with no styling of its own (Radix UI by
 *                              default, see research.md P2; Base UI watched as an alternative)
 *
 * IMPORTANT: the real implementation of this layer's components is Phase 4 of `ROADMAP.md`
 * (monorepo root), after the Phase 3 scaffold this file lives in. This package exists today only
 * to fix the package/name contract and the entry point that will consume the registry mechanism
 * (`@didact/registry`) and the shadcn/ui-style distribution model (`requirements.md` RF-15).
 *
 * Decisions that ARE closed for when this layer gets implemented:
 * - Tailwind v4 IS the core's styling layer — a product decision by Jose (2026-08-11, see
 *   `research/decisions.md` D1), even though `research.md` P3 concluded (and it's still true)
 *   that shadcn/ui's registry mechanism doesn't technically require it. Styled with Tailwind +
 *   `cva` over `@didact/theme`'s tokens; see that package for the detail of the two levels
 *   (plain CSS custom properties + `@theme` block).
 * - Broad scope, not a "minimal v1": QTI's graphical/image-based and numeric/Likert interactions
 *   (research.md §9.2) and the code exercise (RF-11, backed by Sandpack for execution) ARE in
 *   scope, as higher-complexity waves — not dropped. See `research/decisions.md` D2 and
 *   `packages/validators/pedagogy/qti-mapping.json` (`scope: "planned"` on the interactions
 *   previously marked as out of v1).
 * - Any non-copied external dependency (e.g. the primitives layer, or Tailwind/cva themselves) is
 *   pinned to an exact version + drift test (RNF-5, see `@didact/validators/drift`).
 * - Every component must be describable with complete or incomplete props without assuming they
 *   all arrive at once (RNF-4, designed for streaming consumption).
 *
 * Phase 3 exit criterion (ROADMAP.md): `MasteryBadge` below is the trivial component that proves
 * this scaffold works end to end (build, test, Storybook, registry entry, copy mechanism) before
 * Phase 4 builds the rest of design.md §5's inventory. It is intentionally simple -- see
 * `src/components/mastery-badge.tsx` for why it needs no layer-1 primitive.
 */

export {
  MasteryBadge,
  type MasteryBadgeProps,
  type MasteryLevel,
} from "./components/mastery-badge.js";
