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

## Status

Valid `registry.json` with `items: []` — Phase 1-3 scaffold. Entries get added as `packages/core`
implements real components in Phase 4, and this registry gets published in a consumable form
(`shadcn build`, hosting the JSON) in Phase 6 of `ROADMAP.md`.
