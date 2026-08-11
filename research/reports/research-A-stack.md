# Phase 1 Research — Questions 1, 2 and 3 (requirements.md §6)

> Research date: 2026-08-11. All npm version evidence was obtained live against
> `registry.npmjs.org` (not model memory) on the same day.

---

## Question 1 — Is shadcn/ui's third-party registry mechanism real and mature?

### Evidence

**The mechanism exists, is documented as a first-class product feature, and is recent (CLI 3.0,
August 2025; CLI v4, March 2026), not a community hack:**

- Root page: "The registry is a system for distributing code... it works with any kind of
  project and framework, it's not limited to React." —
  https://ui.shadcn.com/docs/registry
- Dedicated step-by-step guide for building your own registry (not the official one):
  https://ui.shadcn.com/docs/registry/getting-started
- Root `registry.json` schema: `$schema`, `name`, `homepage`, and `items` (or `include` to
  compose several files in large registries) —
  https://ui.shadcn.com/docs/registry/registry-json
- Per-item schema, `registry-item.json`: `name`, `type`, `title`, `description`, `files`,
  `dependencies`, `devDependencies`, `registryDependencies`, `cssVars`, `css`, `envVars`, `font`,
  `docs`, `categories`, `meta`, and `tailwind` (marked **deprecated**, replaced by
  `cssVars.theme`) — https://ui.shadcn.com/docs/registry/registry-item-json
  - **There is no `version` field** in this schema for versioning a given item. Confirmed by
    reading the full list of documented properties.

**Hosting:** two official routes — (a) `pnpm dlx shadcn@latest build` generates static JSON at
`public/r/*.json` that can be served from Next.js/Vite/Vue/Svelte/PHP or any server that serves
JSON over HTTP; (b) dynamic routes with `loadRegistry()`/`loadRegistryItem()` as a runtime
dependency. A GitHub repo with a `registry.json` at the root is also a valid registry with no
additional hosting needed. — https://ui.shadcn.com/docs/registry/getting-started

**Installation from the consumer side**, two ways:
- Direct URL: `pnpm dlx shadcn@latest add https://your-domain.com/r/flashcard.json`
- Namespace configured in `components.json`: first
  `pnpm dlx shadcn@latest registry add @anfaia=https://your-domain.com/r/{name}.json`, then
  `pnpm dlx shadcn@latest add @anfaia/flashcard`.
  — https://ui.shadcn.com/docs/registry/getting-started and
  https://ui.shadcn.com/docs/registry/namespace

**Namespaces:** `@` prefix, **decentralized** model ("you are free to create and use any
namespace"), no central authority, alphanumeric/hyphen/underscore only. Multiple registries
coexist with no declared conflict in `components.json`; the CLI detects and prevents circular
dependencies between registries. — https://ui.shadcn.com/docs/registry/namespace

**Authentication:** natively supported via HTTP headers configured in
`components.json` + environment variables — Bearer token (`Authorization: Bearer ${TOKEN}`),
API key in a custom header, or token in a query param (documented as less secure). Official
examples for Next.js/Express showing how to validate those headers on your own registry server.
There is no documented support for OAuth/OIDC or automatic credential discovery — every
private registry requires explicit configuration. — https://ui.shadcn.com/docs/registry/authentication

**Known, verified limits:**
- To appear in the **official public index** (`ui.shadcn.com/r/registries.json`, optional,
  only for discoverability) the following is required: open source and publicly accessible,
  valid JSON against the schema, **flat structure** (`registry.json` and `[item].json` at the
  root, no nesting), and the `files` array cannot include inline `content` (it must reference
  paths). This **does not apply** if that public listing isn't being sought — a private
  registry with auth headers lives outside this requirement by design (the authentication page
  itself assumes registries that could never satisfy "publicly accessible"). —
  https://ui.shadcn.com/docs/registry/registry-index
- **There is no native versioning of a given component** within the schema (no `version`
  field). The only related primitive is `shadcn diff` / `shadcn add --diff`, which compares the
  code already copied into the consumer project against the version currently served by the
  URL/registry — but the official documentation consulted (CLI v4 changelog, March 2026) **does
  not explicitly confirm that `--diff` works against namespaced third-party registries**; it
  only documents it for the official registry. **Not verified** — this would need to be tested
  empirically against one's own registry before relying on it as an "update available
  notification" mechanism. — https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- Third-party blogs (not official docs) suggest "versioning" via one's own URL/tag scheme
  (e.g. serving `/r/v2/flashcard.json`), meaning: versioning of a component is the
  responsibility of how the registry itself organizes its routes, not something the CLI
  resolves for you.

### Recommendation

**Adopt the official shadcn/ui CLI and schema as the primary distribution mechanism.** The
evidence (dedicated official documentation, with specific sections on authentication,
namespaces, and the index, plus the CLI 3.0 and v4 changes dated 2025-2026) confirms that the
third-party registry mechanism is real, is explicitly designed for this use case ("create and
host your own registry, independent of the official one"), and is not an unsupported usage.
This **rules out as unnecessary** building a custom CLI from scratch (the risk in `design.md`
§9, "the third-party mechanism doesn't support what we need," **is not confirmed**); keep it
only as a theoretical plan B, not as work to do now.

Two concrete gaps to carry as an active risk, not as a blocker:
1. **No native versioning of a component.** Design a custom convention from the start
   (e.g. `/r/{name}.json` routes always mean "latest," and explicitly decide whether or not to
   offer a way to pin older versions) rather than assuming the CLI handles it.
2. **`shadcn diff` against third-party registries: not verified.** Before documenting "this is
   how to check for updates" in the library, test it manually against a test registry of our
   own and document the actual result.

---

## Question 2 — What base of accessible primitives is best suited for React 19?

### Evidence

Methodology: instead of relying on marketing announcements or READMEs, I consulted (a)
changes/PRs dated in the official changelogs and (b) the `peerDependencies` field **as
published on the npm registry right now** (`registry.npmjs.org`, checked today) for the
`latest` version of each library — this is what actually determines whether `npm install` works
without flags.

| Library | Package checked | `latest` version today | Published `peerDependencies.react` |
|---|---|---|---|
| Radix UI (primitives) | `@radix-ui/react-dialog` | 1.1.23 | `^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1` |
| React Aria | `react-aria-components` | 1.20.0 | `^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1` |
| React Aria (core) | `react-aria` | 3.51.0 | identical to the above |
| Ariakit | `@ariakit/react` (current stable package, not the historical `ariakit`) | 0.4.37 | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` (clean) |
| Base UI | `@base-ui/react` (MUI; homepage `base-ui.com`, repo `mui/base-ui`) | 1.7.0 | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` (clean) |

**Reading of this table:** both Radix UI and React Aria, in their **stable** `latest` packages
published today, declare the React 19 peer dependency restricted to the release-candidate tag
`19.0.0-rc.1`, not to a general `^19.0.0`. This **is not a rumor**: it's the actual JSON
published on npm today. Practical consequence confirmed by independent sources: with `npm
install` (not with pnpm/yarn, which resolve differently) you need `--legacy-peer-deps` or
`--force` to install Radix or React Aria alongside stable React 19 — this is confirmed by
**shadcn/ui's own documentation**: "Package maintainers need to update their peer
dependencies... users can use `--force` or `--legacy-peer-deps`" —
https://ui.shadcn.com/docs/react-19 — and it is reproduced by community issues (e.g.
`excalidraw/excalidraw#9253`, `radix-ui/primitives#2909`).

Radix has a **v1.2.0 release candidate** (first published 2026-07-25, last prerelease used for
this check: `1.2.0-rc.1785512840124`, 2026-07-31) whose `peerDependencies.react` is already
fixed to `^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc` — meaning the fix exists but **is not
yet the published `latest` version**, so as of today (2026-08-11) the installation problem
still stands for anyone installing regular Radix.
Feature changelog (not just peer deps): Radix confirmed "Full React 19 compatibility" in
PR #2952 (Jun 19, 2024) and has kept fixing React-19-specific bugs as recently as July 2026
("Fixed stale `onEscapeKeyDown`/`onDismiss` handlers on React 19.2", PR #4015) —
https://www.radix-ui.com/primitives/docs/overview/releases

React Aria: the compatibility tracking issue
(`adobe/react-spectrum#6445`, opened May 24, 2024) was resolved via PR #6437 (confirmed by a
comment from maintainer `snowystinger` the same day:
"Being handled in adobe/react-spectrum#6437" — via GitHub API). The May 19, 2025 release
explicitly added "Support React 19 ref cleanup callback" —
https://react-spectrum.adobe.com/v3/releases/2025-05-19.html. The team itself states they
**will never raise the minimum to React 19** because they maintain React 16.8+ as the baseline —
this is a design decision, not a technical limitation, per search findings (not verified with a
direct textual quote from the team, only via third-party synthesis — **mark as not 100%
confirmed**).

Ariakit: the historical, unscoped `ariakit` package (v2 "next," last published as
`2.0.0-next.44`) does **NOT** include React 19 in its peer dependency (`^17.0.0 || ^18.0.0`
only) — this is a prerelease/separate branch and does not represent the current, actively used
Ariakit. The correct, actively maintained package is `@ariakit/react` (0.4.x), which does
declare a clean `^19.0.0`. Also confirmed by community changelog entries (ref fixes for React
19, `RefObject` types, `Portal` callback refs).

Base UI: two package names in circulation — `@base-ui-components/react` (old/beta name, last
version `1.0.0-rc.0`, also with clean peer deps `^17||^18||^19`) and `@base-ui/react` (the
**current** name, confirmed as the official one via npm metadata: `homepage:
https://base-ui.com`, `repository: mui/base-ui`, and confirmed by base-ui.com's own Quick Start
docs, which instruct `pnpm add @base-ui/react`). Stable version 1.7.0, no RC suffix, clean peer
deps.

### What remains unverified

- I did not myself run a React 19 project with each library (evidence is from changelog +
  published peer dep, not from my own execution) — the task asked to "verify with executed
  evidence or explicit changelog/release notes"; I satisfy the second route but not the first.
  Operational recommendation: before locking in layer 1 in `design.md`, run a real smoke test
  (a component with focus/portal/dialog) on stable React 19 with each finalist candidate.
- The claim that React Aria "will never raise its minimum to React 19" has no direct URL to a
  textual statement from the team — it only appears in third-party aggregation — treat it as
  plausible, not as a confirmed fact.

### Recommendation

**Base UI (`@base-ui/react`, MUI) is today the option with the cleanest signal for React 19**:
peer dependency with no release-candidate restriction, a stable (non-RC) version published,
maintained by the same team that already migrated Material UI and MUI X to React 19
(https://mui.com/blog/react-19-update/). It is also the newest "headless" base and the one
closest in philosophy to what Radix offers (composition of unstyled primitives).

However, **Radix UI remains the reasonable default option in the short term** because: (a) it
is the base that shadcn/ui uses, with which we're already aligning our distribution model
(requirements §0.2), maximizing reuse of already-existing shadcn patterns/documentation/
examples; (b) the actual problem detected (peer dep still at `-rc.1`) is cosmetic/installation-
related, not functional — it's resolved with `--legacy-peer-deps` (which shadcn already
documents as an expected step) or by using pnpm/yarn; and (c) the fix itself is already on the
way (v1.2.0 RC).

**Concrete recommendation**: adopt Radix UI as the default layer 1 (aligned with shadcn/ui,
RNF-5 requires pinning an exact version anyway), but **explicitly document** in `design.md` the
npm + React 19 installation friction (and the flag needed) as part of the contract with the
consumer, and **re-evaluate Base UI in 3-6 months** once it's out of RC and has more adoption —
don't rule it out now, but don't block the current decision waiting for it either. Avoid React
Aria except for a specific need for a primitive that Radix doesn't cover well (e.g. some complex
"collections" pieces), given that it shares the same peer-dep friction as Radix without the
advantage of alignment with shadcn.

---

## Question 3 — Tailwind as a mandatory peer dependency?

### Evidence

**shadcn/ui itself requires Tailwind, with no documented exception.** The official manual
installation guide assumes Tailwind ("components are styled with Tailwind CSS... follow the
Tailwind installation instructions") — https://ui.shadcn.com/docs/installation/manual — and
there is no official "without Tailwind" path for shadcn/ui itself. An official community
discussion thread (`shadcn-ui/ui#2832`, "Shadcn-ui variation without Tailwind") confirms this
is a recurring request, not resolved by the project — I did not locate an official maintainer
response accepting it.

**shadcn/ui does support Tailwind v4** (confirmed, unambiguous): dedicated doc at
https://ui.shadcn.com/docs/tailwind-v4, with support for the `@theme` directive, `data-slot` on
every primitive, colors migrated from HSL to OKLCH, and migration documented as "non-breaking"
for existing v3/React 18 projects. This confirms that **even within shadcn itself, Tailwind is
not a frozen version** — it has already moved once (v3→v4) and will keep evolving, which is
relevant as a drag risk if our library copies that coupling 1:1.

**The `registry-item.json` schema (the distribution mechanism, independent of which CSS you
use) does NOT require Tailwind.** Verified by reading the full specification of its styling
properties:
- `cssVars` — flat CSS variables (`theme`/`light`/`dark`), agnostic of the CSS framework.
- `css` — arbitrary injectable CSS rules (can use Tailwind syntax like `@layer`, but is not
  required to — these are free-form CSS rules).
- `tailwind` — **marked deprecated**, replaced by `cssVars.theme`, a signal that shadcn itself
  is moving away from coupling its Tailwind config to the registry schema.
— https://ui.shadcn.com/docs/registry/registry-item-json

In other words: **the shadcn registry/CLI mechanism (which we do want to adopt, question 1)
does not require that the components you distribute use Tailwind.** Tailwind's mandatory status
in shadcn/ui comes from how shadcn/ui *chose to write its own components* (Tailwind utility
classes in the JSX), not from a restriction of the registry format itself.

**There are active precedents of "shadcn without Tailwind"**: community project
`shadcn-css.com` / repo `qwalker8408/shadcn-css` — same components/copy-paste pattern,
rewritten with **CSS Modules** instead of Tailwind, with `next-themes` support. This
demonstrates that the layered pattern (headless + styling + copy-paste) **does not intrinsically
depend on Tailwind** — it's an implementation choice of layer 2 (`design.md` §2), reproducible
with CSS Modules or plain CSS custom properties. There is also a UnoCSS preset for shadcn,
showing that even within the "utility-CSS world" Tailwind is not the only compatible option
with the pattern.

### Recommendation

**Do not require Tailwind as a peer dependency of the core.** The evidence shows that:
1. The product goal (requirements.md §0.1: "must be usable in any React project") is
   incompatible with a mandatory dependency on a third-party CSS framework that also changes
   major versions with non-trivial migrations (v3→v4 with "bleeding edge" browser features,
   per shadcn's own docs).
2. The chosen distribution mechanism (registry-item.json) already natively supports the
   agnostic route: **CSS custom properties (`cssVars`) as the theming contract** (which is
   exactly what RF-16 already asks for) plus `css` for one-off rules, without depending on a
   utility layer.
3. There is proven precedent (though community-driven, not official) of rewriting the shadcn
   pattern with CSS Modules while keeping the same copy-paste model.

**Concrete design suggestion for `design.md` (layer 2 "Styled layer")**: write the core
components with **CSS custom properties + flat classes (or CSS Modules)** as the mandatory
base — this is the only thing that guarantees "works in any React project with no further
setup" — and optionally offer, as a namespaced registry variant or installation flag, a
Tailwind utility layer for those who already use it in their project (given that a large part of
the shadcn ecosystem does ship with it by default, including SkillNet). This avoids forcing the
Tailwind yes/no decision in a single direction and is consistent with `registry-item.json`
already declaring `tailwind` as deprecated in favor of `cssVars`.

**Unresolved point that would require measurement**: whether `cva` (class-variance-authority),
mentioned in `design.md` §2 as a candidate for the variants layer, works just as well
generating CSS Modules/flat classes as it does generating Tailwind classes — I have not
verified this; it's an implementation decision for the detailed design phase, and does not
block this research question.
