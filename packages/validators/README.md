# @didact/validators

Los **validadores científicos** de Didact: datos machine-readable derivados de
`specs/education-components/research.md`, organizados en cuatro familias. No son un runtime de
validación todavía (Fase 4) — son la fuente de datos estructurada contra la que ese runtime se
construirá, y ya hoy documentan, con trazabilidad a la investigación, qué debe cumplir cada
componente antes de considerarse terminado.

## Las cuatro familias y su base científica

### `a11y/` — accesibilidad normativa

`wcag-criteria.json`: los criterios de **WCAG 2.2** (normativo, la evidencia más fuerte según la
jerarquía de `research.md` §5) que forman el contrato mínimo no negociable del núcleo, incluyendo
**2.5.7 Dragging Movements** con el matiz de que soporte de teclado no equivale a "un solo puntero
sin arrastre". Incluye el ángulo legal (EN 301 549 / European Accessibility Act) que convierte la
accesibilidad en requisito de venta, no solo ético.

### `pedagogy/` — evidencia de eficacia educativa e interoperabilidad de reporting

`evidence.json` (fuerza de evidencia por RF, según Dunlosky et al. 2013 y Wisniewski/Hattie 2019),
`qti-mapping.json` (vocabulario de interacciones de IMS QTI 3.0 para RF-3/RF-4, con la familia
gráfica/numérica marcada como fuera de v1) y `xapi-mapping.json` (interactionType de xAPI como
inspiración de naming de callbacks). Documenta también el requisito de **slot de feedback
informativo** (Hattie: d=0.99 vs d=0.24 del refuerzo) que `research.md` propone para RF-4/RF-6.

### `schema/` — contrato declarativo de componente

`component.schema.json`: JSON Schema esqueleto siguiendo el patrón dual de H5P `semantics.json`
(un documento que documenta y valida a la vez), con `requiredness` de tres niveles
(`required`/`progressive`/`optional`) para modelar RNF-4 (props que pueden llegar incompletas en
contextos de streaming).

### `drift/` — control de deriva de dependencias no copiadas

`pinned-deps.json`: estructura para fijar versión exacta + motivo de cualquier dependencia externa
que no se copie junto al componente (RNF-5), con el caveat documentado de Radix UI/React 19 de
`research.md` P2 como caso de referencia.

## Por qué "validadores científicos" y no solo "documentación"

Cada familia traza directamente a una fuente citada en `research.md` (WCAG, Dunlosky, Wisniewski/
Hattie, IMS QTI, xAPI, H5P) en vez de a intuición de diseño — respondiendo al riesgo que
`design.md` §9 señala explícitamente: *"accesibilidad de buena intención sin evidencia"*. La
intención de Fase 4 es que estos datos dejen de ser solo documentación y se conviertan en checks
automatizados (lint de a11y, validación de esquema, test de deriva) que un componente debe pasar
antes de publicarse en `@didact/registry`.

## Estado

Datos completos según lo que documenta `research.md` a fecha 2026-08-11. Sin runtime de
validación ejecutable todavía — eso es trabajo de Fase 4 del `ROADMAP.md`, sobre este scaffold.
