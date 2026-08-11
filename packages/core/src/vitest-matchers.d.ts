// Loads @testing-library/jest-dom's Vitest matcher type augmentation (toBeInTheDocument,
// toHaveAttribute, toHaveFocus, etc. on vitest's `expect`) into this package's TS program. The
// runtime side of the same import happens in vitest.setup.ts (outside `src`, so outside this
// tsconfig's `include` -- this file is the type-only counterpart, kept in `src` on purpose so
// `tsc --noEmit` sees it too.
import "@testing-library/jest-dom/vitest";
