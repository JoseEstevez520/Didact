# @didact/validators/schema

Patrón declarativo estilo H5P `semantics.json` para describir un componente Didact, y
`component.schema.json`: un JSON Schema esqueleto que instancia ese patrón.

## El patrón H5P `semantics.json` (research.md §9.2)

H5P (https://h5p.org/semantics) resuelve con un solo documento declarativo dos problemas que
normalmente se resuelven por separado: **generar el editor** de un content type (qué campos
mostrar, con qué controles) y **validar en runtime** que las props que le llegan al componente
tienen la forma correcta. Es un esquema que sirve a la vez de documentación estructurada y de
contrato ejecutable.

`research.md` §9.2 recomienda explícitamente adoptar este patrón dual para las entradas de
registry de Didact (relevante para RF-15/RF-17): un esquema por componente que documente y valide
props a la vez, coherente con **RNF-4** ("los componentes que puedan usarse en contextos de
streaming... no deben asumir que todas sus props llegan completas de una vez").

*(Nota de dato de `research.md`: el repo de drag-and-drop de H5P es `h5p-drag-question`, no
`h5p-drag-and-drop` — corregido aquí para no propagar el error.)*

## `component.schema.json`

Esqueleto de JSON Schema (borrador 2020-12) para describir un componente Didact:

- `name`, `requirementId` (traza a `requirements.md`, p. ej. `RF-1`), `qtiInteraction` y
  `xapiInteractionType` (trazan a `validators/pedagogy/`), `wcagCriteria` (traza a
  `validators/a11y/wcag-criteria.json`).
- `props`: array de `propDescriptor`, cada una con `name`, `type`, `default` opcional, y sobre
  todo **`requiredness`** con tres valores, no dos:
  - `required` — siempre debe estar presente.
  - `progressive` — puede llegar ausente en un render incompleto (RNF-4, streaming) y el
    componente debe degradar con gracia (p. ej. mostrando un estado de carga en vez de romper).
  - `optional` — nunca obligatoria, tiene un comportamiento por defecto razonable si falta.

Esta distinción de tres niveles (en vez del binario `required: true/false` habitual en JSON
Schema) es la traducción directa de RNF-4 al formato de descriptor: una prop puede ser
"obligatoria a largo plazo" pero "tolerable que falte a corto plazo" en un contexto de streaming,
que es exactamente el caso que motivó RNF-4 (el catálogo generativo v2 de SkillNet).

## Estado

Esqueleto sin instanciar todavía para ningún componente real — eso ocurre en Fase 4, cuando
`packages/core` tenga implementaciones que describir. Sin validador ejecutable (p. ej. Ajv) todavía
integrado en el pipeline de test.
