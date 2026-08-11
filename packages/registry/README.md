# @didact/registry

Didact's `registry.json` in **shadcn/ui's official schema** — the distribution mechanism chosen
for RF-15 in `requirements.md` (registry + CLI that copies source code into the consuming
project, not a versioned npm dependency).

## Why shadcn's official schema and not a custom CLI

`specs/education-components/research.md` Question 1 confirms that shadcn/ui's third-party
registry mechanism is real, documented as a first-class product (not a community hack), and works
with any framework, not just React:

- Root schema `registry.json` (`$schema`, `name`, `homepage`, `items`/`include`).
- Item schema `registry-item.json` (`name`, `type`, `files`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, `envVars`…).
- Hosting as static JSON servable from any HTTP server, or a GitHub repo with `registry.json` at
  the root — this repo.
- Installation via direct URL (`shadcn add https://.../<item>.json`) or via a namespace configured
  in the consumer's `components.json` (decentralized model, no central authority).

**research.md P1 recommendation:** adopt the official CLI and schema as the primary mechanism.
Building a custom CLI stays as a theoretical plan B, not as work to be done — the risk
`design.md` §9 anticipated ("the third-party mechanism doesn't support what we need") was not
confirmed by the research.

## Verified caveats (do not ignore when operating this registry)

- **There is no native `version` field in `registry-item.json`.** There is no schema-level
  versioning for the same component; versioning "same component, different revisions" is the
  responsibility of how this registry organizes its routes (e.g. namespacing by date or tag), not
  something shadcn's CLI solves for us.
- **`shadcn diff` against third-party registries: not verified.** The docs (CLI v4 changelog)
  document it for the official registry; they do not explicitly confirm it works the same way
  with third-party namespaced registries like this one. Before documenting `shadcn diff` as
  Didact consumers' update mechanism, test it empirically.
- **Authentication** is native via HTTP headers + environment variables (Bearer token, API key).
  No OAuth/OIDC or automatic discovery — relevant only if this registry stops being public.
- **`cssVars.theme`'s auto-generated Tailwind alias only triggers for color-shaped values, and
  its naming isn't collision-safe.** Verified empirically in the Phase 3 registry copy proof
  (`shadcn add` against `mastery-badge.json` in a throwaway consumer): when the CLI merges
  `cssVars.theme` into the consumer's `@theme` block, it inserts the literal `--<key>: <value>`
  declaration, and separately auto-generates a `--color-<key>: var(--<key>)` alias **only** when
  `<value>` looks like a color (oklch/hsl/rgb/hex). It does this unconditionally, without checking
  whether `<key>` already contains the word "color" — so a key like `didact-color-bg` (this
  registry's own naming convention, matching `@didact/theme`) becomes the useless
  `--color-didact-color-bg`, not a usable `--color-didact-bg`. Non-color-shaped tokens
  (`didact-radius-md`, `didact-font-sans`, `didact-motion-duration`) get **no** alias at all, so a
  Tailwind theme-scale utility built on their name (e.g. a `rounded-didact-md` utility) silently
  fails to resolve for a consumer who only copied the component through the registry (as opposed
  to importing the `@didact/theme` package directly, which defines its own correct `@theme` block
  by hand). Also verified: trying to work around this with the item's own `css` field (injecting a
  hand-written `@theme` block with the correct alias names) does not work either -- the CLI's `css`
  merger treats every key nested under an at-rule like `"@theme"` as a CSS **selector**, not a flat
  custom-property declaration (confirmed by reading the relevant merge function in
  `shadcn@4.16.2`'s bundled source, `chunk-Q6Y23SOV.js`), so `"css": { "@theme": { "--foo": "var(--bar)" } }`
  throws a `CssSyntaxError` trying to parse `.temp{var(--bar)}` as a declaration body.
  **Consequence / mitigation applied:** `packages/core/src/components/mastery-badge.tsx` does not
  rely on any named theme-scale utility (`bg-didact-*`, `rounded-didact-*`) at all -- it reads the
  raw custom properties directly via Tailwind v4's `[type:var(--x)]` arbitrary-value syntax (e.g.
  `bg-[color:var(--didact-color-muted)]`), which only needs the plain `--didact-*` declaration
  `cssVars.theme` reliably delivers, not the fragile alias. Future components should do the same
  unless/until this gets a cleaner fix (e.g. renaming this registry's `cssVars.theme` keys to
  avoid embedding "color"/"radius" as a prefix of the key itself, so the CLI's own alias no longer
  collides).

## Status

`registry.json` has `mastery-badge` (Phase 3's scaffold proof component), `flashcard` (RF-1, the
first real Phase 4 component), and the Phase 3.5 `@didact/ui` primitive kit -- `button`, `card`,
`badge`, `separator`, `toggle`, `toggle-group` (the last depends on `toggle` via
`registryDependencies` rather than duplicating its file). The built, servable JSON lives in
`public/r/` and IS committed
(same reasoning as `pnpm-lock.yaml`: it's generated, but it's the actual artifact a static host
would serve, not throwaway build junk) -- regenerate it after any change to `registry.json` or the
files it points at with:

```
pnpm dlx shadcn@latest build packages/registry/registry.json -o packages/registry/public/r --cwd <repo root>
```

The registry copy mechanism itself is verified end to end (ROADMAP.md Phase 3 block F): `shadcn
add` against the built item JSON, from a throwaway consumer project outside this workspace,
produces a byte-identical copy of the real source file and a working Vite build. Further Phase 4
components keep arriving alongside `flashcard`; this registry gets published for real hosting in
Phase 6.
