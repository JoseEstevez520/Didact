import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as jestAxeMatchers from "jest-axe";

// jest-axe's default export IS the matcher object shape expect.extend wants, i.e.
// `{ toHaveNoViolations(results) { ... } }` -- not a bare function under that key. It has no
// dependency on jest itself (only on jest-matcher-utils for diffing), so it plugs into vitest's
// `expect.extend` the same way it plugs into jest's -- this is what packages/core's a11y test
// (mastery-badge.test.tsx) relies on.
expect.extend(jestAxeMatchers.toHaveNoViolations);
