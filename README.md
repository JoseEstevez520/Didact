# Didact

Didact es una **librería de componentes educativos de propósito general**: flashcards, ejercicios
de emparejar, variantes de quiz, repetición espaciada, glosario, pistas progresivas,
progreso/mastery, timelines y rúbricas, pensados para poder usarse en **cualquier proyecto React**,
no solo en el proyecto donde nació la necesidad.

El modelo de distribución de referencia es el de **shadcn/ui**: no un paquete npm versionado, sino
una **registry + un mecanismo de copia de código fuente** al proyecto consumidor ("copy-paste
ownership"). El consumidor es dueño del código desde el momento en que lo copia; no hay una
actualización de dependencia que le rompa nada sin que él lo decida. Esta decisión está tomada y
justificada en `specs/education-components/requirements.md` §0.

## Por qué existe

No hay hoy un vocabulario de componentes de e-learning comúnmente aceptado, al nivel en que sí
existe para UI genérica (shadcn/ui, Radix, MUI…). Cada plataforma de formación reinventa
flashcards, ejercicios de emparejar, quizzes o repetición espaciada. Didact busca cubrir ese hueco
con una base de buena accesibilidad y buena ergonomía de desarrollo, usando shadcn/ui como
referencia de **forma** (headless + copy-paste + composición de variantes), no de contenido —
los componentes de shadcn son genéricos; los de Didact son pedagógicos.

SkillNet (plataforma de formación para pymes) es el **primer consumidor real** — donde nació la
necesidad y donde se prueba primero — pero no es el criterio de diseño. Cualquier acoplamiento a
decisiones específicas de SkillNet se trata como adaptador opcional (`adapters/skillnet/`), nunca
como parte del núcleo.

## Estilo: Tailwind v4

Didact se estiliza con **Tailwind v4** (CSS-first: `@theme`, colores OKLCH) sobre un tema neutro
por defecto centralizado en `@didact/theme` y restyleable vía CSS custom properties — decisión de
producto de Jose (2026-08-11). `specs/education-components/research.md` P3 investigó y documentó
que el mecanismo de registry de shadcn/ui **no exige** Tailwind técnicamente; esa conclusión sigue
vigente, pero Jose elige usarlo igualmente por consistencia visual y como referencia de estilo
alineada con shadcn/ui — una elección deliberada, no una limitación técnica. Detalle completo en
`research/decisions.md` (D1) y en `packages/theme/README.md`.

## Alcance: amplio y ambicioso

Didact aspira a cubrir tanto vocabulario educativo como sea razonable, con buen estilo — desde
ejercicios de emparejar/arrastrar y variantes de quiz hasta ejercicios de código e interacciones
gráficas/numéricas — organizado en **oleadas de complejidad**, no como un recorte mínimo de "v1".
Las interacciones gráficas/sobre imagen y numéricas de IMS QTI 3.0 (`research.md` §9.2) y el
ejercicio de código (RF-11) están en alcance, no descartadas — ver `research/decisions.md` (D2).

## Estado del proyecto

Este repositorio corresponde a la **Fase 1 completada** del `ROADMAP.md` (investigación profunda) y
al scaffold de las fases 2-3 (decisión de diseño documentada + estructura del monorepo). Contiene:

- La investigación que fundamenta cada decisión (`specs/education-components/research.md` y los
  informes crudos en `research/reports/`).
- Los **validadores científicos**: datos machine-readable derivados de esa investigación
  (criterios WCAG, mapeos QTI/xAPI, evidencia pedagógica por requisito, esquema declarativo de
  componente, control de deriva de dependencias) en `packages/validators/`.
- La estructura de paquetes del monorepo (`packages/core`, `packages/theme`,
  `packages/spaced-repetition`, `packages/registry`) con sus contratos de API documentados.
- La documentación de la frontera con el adaptador SkillNet (`adapters/skillnet/`), sin código —
  el código del adaptador vive en el repo de SkillNet, no aquí.

**Lo que no contiene todavía:** implementación real de los componentes educativos. Eso es la
**Fase 4** del roadmap, y arranca sobre el scaffold de este repo, no antes.

## Estructura del monorepo

```
.
├── ROADMAP.md                        Plan de ejecución por fases
├── specs/education-components/       Requirements, design y research (fuente de verdad)
├── packages/
│   ├── core/                         @didact/core — capa 3, componentes educativos (Fase 4)
│   ├── theme/                        @didact/theme — capa 2, tema neutro (Tailwind v4 + tokens)
│   ├── spaced-repetition/            @didact/spaced-repetition — SM-2 / FSRS tras interfaz agnóstica
│   ├── registry/                     @didact/registry — registry.json estilo shadcn/ui
│   └── validators/                   @didact/validators — validadores científicos (a11y, pedagogía,
│                                      esquema, deriva de dependencias)
├── adapters/
│   └── skillnet/                     Documentación de la frontera con SkillNet (sin código)
├── apps/
│   └── docs/                         Plan de documentación viva (Storybook, Fase 3)
└── research/
    ├── reports/                      Informes crudos de investigación (4 lotes en paralelo)
    ├── sources/                      Bibliografía completa
    └── decisions.md                  Decisiones de producto posteriores a la Fase 1
```

## Por dónde empezar

- `ROADMAP.md` — en qué fase está el proyecto y qué se espera de la siguiente.
- `specs/education-components/requirements.md` — qué se construye y por qué (RF-1..RF-19, RNF-1..5).
- `specs/education-components/design.md` — arquitectura de 3 capas y modelo de distribución.
- `specs/education-components/research.md` — evidencia y recomendaciones detrás de cada decisión.
- `CONTRIBUTING.md` — convenciones antes de proponer un cambio.

## Licencia

MIT — ver `LICENSE`.
