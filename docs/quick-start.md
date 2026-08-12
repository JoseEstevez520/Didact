# Didact Quick Start

This guide takes a React application from zero Didact source to a rendered activity in under ten
minutes. Didact uses copy-paste ownership: installation adds source files to your project rather
than adding an opaque runtime package.

## Before you start

Your application needs React 19, Tailwind CSS 4, and shadcn configured. The important part of
`components.json` is a source alias that matches your TypeScript configuration:

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib"
  }
}
```

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Install an activity

The repository is currently private, so the URL below documents the intended public flow but is
not yet an unauthenticated distribution endpoint:

```bash
pnpm dlx shadcn@latest add \
  https://raw.githubusercontent.com/JoseEstevez520/Didact/main/packages/registry/public/r/hint-reveal.json
```

Do not use `main` in production. Until the first public release, contributors should verify the
same copied source through the clean external application included in this repository:

```bash
pnpm --filter @didact/registry build
pnpm --filter @didact/registry verify:consumer
cd packages/registry/fixture/consumer/.generated
pnpm install --ignore-workspace
pnpm check
pnpm build
```

Once Didact publishes its first public release, use the immutable tag or hosted URL shown there.

The CLI copies `HintReveal` and recursively installs its Didact theme and UI dependencies.

## Render it

```tsx
import { HintReveal } from "@/components/didact/hint-reveal";

export function CachingActivity() {
  return (
    <HintReveal
      heading="Why can this response be reused?"
      description="Reveal one clue at a time before viewing the explanation."
      hints={[
        "Inspect the Cache-Control header.",
        "Compare max-age with the current age.",
      ]}
      solution="The cached response is reusable while its freshness lifetime has not elapsed."
    />
  );
}
```

## Install by goal

Individual activity:

```bash
pnpm dlx shadcn@latest add <registry-base>/measurement-lab.json
```

Curated kit:

```bash
pnpm dlx shadcn@latest add <registry-base>/corporate-training.json
```

Available kits are `learning-essentials`, `math-foundations`, `language-learning`,
`visual-spatial`, `corporate-training`, and `technical-training`.

## Customize theme tokens

`didact-theme` installs neutral light/dark tokens. Override the semantic values in your global CSS:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.18 0 0);
  --primary: oklch(0.55 0.16 250);
  --primary-foreground: oklch(0.98 0 0);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.16 0 0);
  --foreground: oklch(0.96 0 0);
}
```

Prefer semantic tokens over hard-coded colors. Use `className` for local layout changes.

## Controlled state and results

```tsx
import { useState } from "react";
import {
  MeasurementLab,
  type MeasurementLabResult,
  type MeasurementLabState,
} from "@/components/didact/measurement-lab";

export function PressureReading() {
  const [state, setState] = useState<MeasurementLabState>({ reading: null });
  const [result, setResult] = useState<MeasurementLabResult>();

  return (
    <MeasurementLab
      definition={{
        id: "pressure-check",
        title: "Read the pressure gauge",
        observedReading: 116,
        instrument: {
          kind: "dial",
          min: 0,
          max: 160,
          step: 2,
          majorStep: 20,
          unit: "kPa",
        },
      }}
      state={state}
      onStateChange={setState}
      evaluate={({ reading }) => ({
        status: reading !== null && Math.abs(reading - 116) <= 2 ? "correct" : "incorrect",
        feedback: "Read the needle against the nearest minor division.",
      })}
      onSubmit={setResult}
    />
  );
}
```

The application decides where state and results are persisted. Didact does not send network
requests or assume a database.

## Streaming and disabled states

Definitions may arrive progressively from a CMS or generative system:

```tsx
<MeasurementLab streaming />
```

Use a real disabled state when review or permissions prevent editing:

```tsx
<MeasurementLab definition={definition} state={savedState} disabled />
```

## Verify the integration

```bash
pnpm exec tsc --noEmit
pnpm exec vite build
```

If an advanced component imports an optional package, the registry item declares it and shadcn
installs it. If an import under `@/` does not resolve, align `components.json` and `tsconfig.json`.

For evaluators, runtimes, schedulers, and media adapters, continue with
[Component integration patterns](component-integration.md).
