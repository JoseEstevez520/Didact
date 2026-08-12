# Release readiness

Didact is currently a private beta. Component quality and registry materialization are verified;
public distribution is not complete until consumers have an immutable, unauthenticated URL.

## Complete

- 34 public educational types and 28 manifests.
- 56 generated registry artifacts.
- TypeScript, package builds, Storybook, behavior, and automated accessibility tests.
- Recursive registry dependency validation with no residual `@didact/*` imports.
- Clean consumer materialization for a basic component, drag interaction, schema-backed advanced
  component, interactive media, measurement, and a complete kit.
- Versioning and copy-paste update policy.

## Required before public v0.1

1. Choose a public static host or make the GitHub repository public.
2. Generate registry dependencies against an immutable `v0.1.0` base URL.
3. Run the official shadcn CLI against a fresh external Vite application.
4. Run `tsc --noEmit` and `vite build` in that application.
5. Smoke-test one basic component, one drag component, one schema-backed component,
   `InteractiveMedia`, `MeasurementLab`, and one complete kit.
6. Publish release notes with stability labels and known runtime requirements.
7. Install the release in [SkillNet](https://github.com/ANFAIA/SkillNet), Didact's first real
   consumer, and convert general integration failures into Didact regression tests.

## External installation matrix

| Gate | Registry item | Why |
|---|---|---|
| Basic | `hint-reveal` | Theme and ordinary UI dependency closure |
| Drag | `word-bank` | `@dnd-kit/core`, pointer, and keyboard alternative |
| Schema/runtime | `interactive-media` | Copied schema dependency and composite behavior |
| Domain tool | `measurement-lab` | Controlled result and responsive SVG |
| Kit | `math-foundations` | Dependency-only collection expansion |

## Release commands

The exact hosting URL must be chosen first. A release build should then use an immutable base:

```bash
DIDACT_REGISTRY_BASE_URL=https://<host>/v0.1.0/r \
  pnpm --filter @didact/registry build
pnpm --filter @didact/registry lint
pnpm --filter @didact/registry test
pnpm lint
pnpm test
pnpm build
```

Do not call mutable `main` artifacts production-ready. Do not advertise `shadcn diff` for the
third-party registry until an end-to-end test proves it.
