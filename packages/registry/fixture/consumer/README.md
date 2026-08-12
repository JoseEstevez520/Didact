# Clean external consumer fixture

This directory is an ordinary React/Vite application contract, not a workspace package. It proves
that copied Didact source can type-check and build without imports from the Didact monorepo.

## Coverage

`pnpm --filter @didact/registry verify:consumer` materializes:

- `hint-reveal` - basic component and theme dependencies;
- `word-bank` - drag dependency plus keyboard/click alternative;
- `interactive-media` - copied schema and composite dependencies;
- `measurement-lab` - responsive domain component and controlled result API;
- `math-foundations` - dependency-only kit expansion.

The verifier resolves the recursive dependency graph, rejects residual `@didact/*` imports,
rejects conflicting targets, and checks every external import against this fixture's public
`package.json`.

## Run the generated application

From the repository root:

```bash
pnpm --filter @didact/registry build
pnpm --filter @didact/registry verify:consumer
cd packages/registry/fixture/consumer/.generated
pnpm install --ignore-workspace
pnpm check
pnpm build
```

The final two commands are the real external TypeScript and Vite gates. Routine registry tests do
not install packages from the network, so they remain deterministic.

## Test the official CLI

The release gate goes one step further in a fresh Vite application:

```bash
pnpm dlx shadcn@latest add <immutable-registry-url>/hint-reveal.json
pnpm dlx shadcn@latest add <immutable-registry-url>/word-bank.json
pnpm dlx shadcn@latest add <immutable-registry-url>/interactive-media.json
pnpm dlx shadcn@latest add <immutable-registry-url>/measurement-lab.json
pnpm dlx shadcn@latest add <immutable-registry-url>/math-foundations.json
pnpm exec tsc --noEmit
pnpm exec vite build
```

Do not substitute mutable `main` URLs for the immutable URL in a production release gate.

## Customize

Copied files belong to the application. Override semantic variables such as `--primary`,
`--background`, and `--radius`, or compose a specific instance with `className`. Keep the `@/*`
alias aligned between `components.json`, TypeScript, and Vite.
