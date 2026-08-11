# @didact/core

Capa 3 de la arquitectura de 3 capas de Didact (`specs/education-components/design.md` §2):
los **componentes educativos** con significado pedagógico (Flashcard, MatchingExercise, QuizItem,
SpacedRepetitionDeck, Glossary, Hint/Reveal, Timeline, Rubric, MasteryBadge…), construidos sobre
una capa 2 de theming neutro y una capa 1 de primitivos accesibles.

```
┌─────────────────────────────────────────────┐
│ 3. Education molecules                       │  Flashcard, MatchingExercise, QuizItem,
│    (componentes con significado pedagógico)  │  SpacedRepetitionDeck, Glossary, Hint,
│                                               │  Timeline, Rubric, MasteryBadge…
├─────────────────────────────────────────────┤
│ 2. Styled layer                               │  Tailwind v4 + cva sobre los tokens de
│    (tema neutro, restyleable)                │  @didact/theme. Un solo lugar de theming.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Comportamiento accesible sin estilo propio
│    (headless)                                │  (foco, teclado, ARIA). Radix UI por defecto.
└─────────────────────────────────────────────┘
```

## Estado

**Scaffold (Fase 1-3 del `ROADMAP.md`). La implementación real de los componentes es la Fase 4.**
`src/index.ts` no exporta componentes todavía — solo documenta el contrato de entrada.

## Decisiones ya cerradas (no se reabren al implementar)

- **Tailwind v4 SÍ es la capa de estilo del núcleo** — decisión de producto de Jose (2026-08-11,
  ver `research/decisions.md` D1). `specs/education-components/research.md` P3 concluyó, con
  evidencia, que el mecanismo de distribución de shadcn/ui **no exige** Tailwind técnicamente (el
  campo `tailwind` de `registry-item.json` está deprecated a favor de `cssVars.theme`) — esa
  conclusión sigue siendo cierta y no se reescribe. Lo que cambia es que Jose elige usar Tailwind
  de todos modos, por consistencia visual y como referencia de estilo alineada con shadcn/ui, no
  porque el mecanismo lo obligara. En la práctica: los componentes se estilizan con **Tailwind +
  `cva`** (`class-variance-authority`) sobre los tokens de `@didact/theme` (CSS custom properties
  + bloque `@theme` de Tailwind v4) — ver el README de ese paquete para el detalle de los dos
  niveles de theming.
- **Radix UI como capa 1 por defecto**, alineado con shadcn/ui, documentando la fricción de
  peer-dependency con React 19 estable (research.md P2) y vigilando Base UI como alternativa más
  limpia a medio plazo.
- Cualquier dependencia externa de esta capa que no se copie junto con el componente (Radix,
  Tailwind, `cva`) se fija con versión exacta y lleva un test de deriva (RNF-5) — ver
  `@didact/validators/drift`.

## Alcance: amplio y por oleadas de complejidad, no "v1 mínimo"

Decisión de producto de Jose (2026-08-11, ver `research/decisions.md` D2): Didact aspira a cubrir
**todo lo educativo que se pueda**, con buen estilo — desde ejercicios de emparejar/arrastrar
hasta ejercicios de código y componentes complejos — no un recorte mínimo pensado solo para el
primer consumidor. Esto revierte cualquier framing anterior de "fuera de v1":

- Las interacciones **gráficas/sobre imagen** de QTI (`hotspot`, `hot-text`, `graphic-order`,
  `graphic-associate`, `graphic-gap-match`, `position-object`, `select-point`, `drawing`) y de
  **respuesta numérica/slider** (research.md §9.2) están **en alcance**, como una oleada de mayor
  complejidad — no descartadas. Ver `packages/validators/pedagogy/qti-mapping.json`
  (`scope: "planned"`, `phase: "oleada-avanzada"`).
- **RF-11 (ejercicio de código)**, apoyado en Sandpack para la ejecución (research.md §9.3, la
  comprobación sigue siendo trabajo propio), está en alcance, priorizado detrás de los
  componentes con evidencia pedagógica más fuerte (RF-2/RF-4, ver
  `packages/validators/pedagogy/evidence.json`) pero no descartado.
- El orden de implementación real sigue basándose en evidencia y precedente (research.md §9.1 y
  Pregunta 7), no en "lo fácil primero" — pero "más complejo" ya no significa "fuera de alcance".

## Relación con el resto del monorepo

- `@didact/theme` es la capa 2: este paquete la consume como dependencia para sus tokens
  Tailwind/CSS custom properties, nunca redefine colores o radios por su cuenta.
- Cada componente de este paquete se describe como una entrada en `@didact/registry` para el
  mecanismo de distribución estilo shadcn/ui (RF-15).
- `@didact/validators` aporta los datos (a11y, evidencia pedagógica, esquema, deriva) contra los
  que se valida cada componente antes de publicarse en la registry.
- El adaptador SkillNet (`adapters/skillnet/`, fuera de este monorepo) consume componentes de esta
  capa; ninguna decisión de SkillNet debe filtrarse aquí.

Ver `specs/education-components/design.md` para la arquitectura completa y `research.md` para la
evidencia detrás de cada decisión.
