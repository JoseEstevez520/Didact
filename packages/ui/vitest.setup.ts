import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as jestAxeMatchers from "jest-axe";

// See packages/core/vitest.setup.ts for why this is `expect.extend(jestAxeMatchers.toHaveNoViolations)`
// rather than passing the module itself: jest-axe's default export IS the matcher object shape
// `expect.extend` wants, and it plugs into vitest the same way it plugs into jest.
expect.extend(jestAxeMatchers.toHaveNoViolations);
