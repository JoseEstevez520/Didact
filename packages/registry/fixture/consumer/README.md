# Clean React consumer fixture

This fixture proves that a course activity can consume a Didact registry item as copied source,
without importing `@didact/*` packages or relying on monorepo source paths.

`pnpm --filter @didact/registry verify:consumer` performs the same operation as an external
consumer in a disposable `.generated/` directory:

1. Reads `public/r/hint-reveal.json`.
2. Resolves its complete registry dependency graph.
3. Copies every file to the published `target` under `src/`.
4. Rejects unresolved `@didact/*` imports and conflicting copied targets.
5. Verifies every local alias and every external import against the copied targets and this clean
   consumer's public `package.json`.

## Install in an application

Use the hosted item URL directly:

```bash
pnpm dlx shadcn@latest add https://raw.githubusercontent.com/JoseEstevez520/Didact/main/packages/registry/public/r/hint-reveal.json
```

For reproducible production installation, replace `main` with a Didact release tag or commit SHA.
The registry dependency graph also installs the Didact theme, Button and Card source automatically.

Then import the copied component through the consumer alias:

```tsx
import { HintReveal } from "@/components/didact/hint-reveal";
```

## Customize

The copied files belong to the application. Customize an instance with props and `className`, or
override the semantic variables installed by `didact-theme` (`--primary`, `--background`,
`--radius`, and the remaining light/dark tokens). Keep the `@/*` alias pointing to `src/*` or let
shadcn rewrite targets according to the application's `components.json` aliases.

## Run independently

From a copy of this directory, materialize the registry files under `src/`, then run:

```bash
pnpm install
pnpm check
```

The repository verification intentionally stops before package installation, so routine registry
tests remain deterministic and do not require network access. `pnpm check` is the final independent
React/TypeScript compilation check after installing the fixture's declared public dependencies.

The committed fixture contains only the handwritten activity and configuration. `.generated/` is
ignored because the verification command recreates it from the public artifacts on every run.
