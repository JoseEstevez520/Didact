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
│ 2. Styled layer                               │  CSS custom properties + variantes sobre
│    (tema neutro, restyleable)                │  los primitivos. Un solo lugar de theming.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Comportamiento accesible sin estilo propio
│    (headless)                                │  (foco, teclado, ARIA). Radix UI por defecto.
└─────────────────────────────────────────────┘
```

## Estado

**Scaffold (Fase 1-3 del `ROADMAP.md`). La implementación real de los componentes es la Fase 4.**
`src/index.ts` no exporta componentes todavía — solo documenta el contrato de entrada.

## Decisiones ya cerradas (no se reabren al implementar)

- **Tailwind NO es obligatorio.** `specs/education-components/research.md` P3 concluye que el
  mecanismo de distribución de shadcn/ui no exige Tailwind (el campo `tailwind` de
  `registry-item.json` está deprecated a favor de `cssVars.theme`); exigirlo chocaría con el
  objetivo de "cualquier proyecto React" (`requirements.md` §0.1). La base de theming del núcleo
  son **CSS custom properties / clases planas**, con una variante Tailwind opcional para quien ya
  lo use (SkillNet incluido).
- **Radix UI como capa 1 por defecto**, alineado con shadcn/ui, documentando la fricción de
  peer-dependency con React 19 estable (research.md P2) y vigilando Base UI como alternativa más
  limpia a medio plazo.
- Cualquier dependencia externa de esta capa que no se copie junto con el componente se fija con
  versión exacta y lleva un test de deriva (RNF-5) — ver `@didact/validators/drift`.

## Relación con el resto del monorepo

- Cada componente de este paquete se describe como una entrada en `@didact/registry` para el
  mecanismo de distribución estilo shadcn/ui (RF-15).
- `@didact/validators` aporta los datos (a11y, evidencia pedagógica, esquema, deriva) contra los
  que se valida cada componente antes de publicarse en la registry.
- El adaptador SkillNet (`adapters/skillnet/`, fuera de este monorepo) consume componentes de esta
  capa; ninguna decisión de SkillNet debe filtrarse aquí.

Ver `specs/education-components/design.md` para la arquitectura completa y `research.md` para la
evidencia detrás de cada decisión.
