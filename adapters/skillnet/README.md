# Adaptador SkillNet — frontera de responsabilidad

**Este directorio documenta la frontera entre Didact y SkillNet. No contiene código.** El código
real del adaptador (mapeo de tema, registro de bloques en el catálogo generativo v2) vive en el
repositorio de SkillNet (`repo/`), fuera de este monorepo — nunca aquí.

Ver `specs/education-components/design.md` §0 y §4, y `requirements.md` §0.1/§2.4: SkillNet es el
**primer consumidor real** de Didact, no el criterio de diseño del núcleo. Cualquier decisión
específica de SkillNet (tokens de `design-system.md`, idioma, el catálogo generativo v2) se trata
como adaptador opcional, nunca como parte de `packages/*`.

## Qué haría el adaptador (en `repo/`, no aquí)

1. **Uso directo (cursos v1, estáticos):** import normal de componentes de `@didact/core` en
   `skillnet-web`, con el tema de `design-system.md` aplicado sobre el tema neutro del núcleo
   (RF-18). Sin restricciones adicionales.
2. **Bloque del catálogo generativo (cursos v2):** un componente de Didact entra al catálogo
   (`apps/skillnet-web/src/components/courses/kit/`) solo si cumple las 7 reglas de contrato de
   `openui-adoption.md` §5.2, se describe con `zod` + `defineComponent`, pasa `assertStaticOnly`,
   tiene mirror en `src/render/kit.py`, y no hace que el DAG de bloques supere
   `MAX_RENDERED_NODES = 64`.

## Tabla de aptitud (research.md, Pregunta 7)

Clasificación de los 11 componentes de `requirements.md` §4.1 frente a las reglas del catálogo
generativo v2 de SkillNet (`RENDER_ALLOW_REACTIVE = False`, regla 5: `QuizItem` nunca lleva
`answer_key` en el `ui_spec`). Fuente primaria: el docstring ejecutable de
`repo/apps/skillnet-api/src/render/spec.py:1-26`, no el resumen de 7 reglas de
`docs/design/v2-dynamic-courses.md` §5.2 (que las cita sin enumerarlas).

**Resultado: 8 de 11 APTOS, 1 apto-pero-bloqueado, 2 no aptos.**

| Componente (RF) | Veredicto | Motivo |
|---|---|---|
| `Flashcard` (RF-1) | **APTO** | Flip/marcar-sabido = estado React efímero; sin `answer_key` que proteger. Precedente: `QuizItemBlock`. |
| `SpacedRepetitionDeck` (RF-2) | **NO APTO** | Persistir estado entre sesiones exige `Query`/`Mutation`, prohibidas mientras `RENDER_ALLOW_REACTIVE=False`. |
| Matching/Sort/Categorize (RF-3) | **APTO** | Precedente en producción: `DragOrder` usa props literales + React interno, sin `Mutation`. |
| Variantes de quiz (RF-4) | **APTO** | `QuizItem` ya cubre 6 `item_type` sin `correct`/`explanation` en props (regla 5); verificación de respuesta abierta corre server-side vía POST autónomo. |
| `Glossary`/`Term` (RF-5) | **APTO** | Presentación pura; sin respuesta que proteger, sin datos dinámicos. |
| `Hint`/`Reveal` (RF-6) | **APTO con tensión estructural** | Toggle = estado React, pero la reserialización canónica llega de golpe: seguro para una pista pedagógica, choca con regla 5 si envuelve una respuesta de examen — en ese caso debe delegar en el POST autónomo de `QuizItem`. |
| Progreso/mastery (RF-7) | **APTO** | Foto fija (`mastery: 0.72`) como prop literal, igual que `Chart`. Una barra en vivo exigiría `Query`. |
| `Timeline`/`Steps` (RF-8) | **APTO** | Ya existe literalmente como `StepSequence` — 1:1 con RF-8, no analogía. |
| Checkpoint sobre vídeo (RF-9) | **APTO EN PRINCIPIO / BLOQUEADO POR INFRAESTRUCTURA** | Las reglas no lo impiden (mismo patrón autónomo que `QuizItem`); el bloqueo real es que no hay reproductor de vídeo en `skillnet-web` (research.md Pregunta 8), no la reactividad. |
| `Rubric` (RF-10) | **APTO** | Autoevaluación sin nota automática → sin `answer_key`; estado de selección efímero. |
| Ejercicio de código (RF-11) | **NO APTO** | La comprobación exige ejecución/red (≈`Mutation`, prohibida). El display sin comprobación (`CodeBlock`) sí es apto, pero no cubre RF-11 completo. |

**Nota de precedente:** el patrón clave que hace posibles los APTOS es que un bloque puede tener
**estado de React puro** (`useState`/`useEffect`) sin violar "sin reactividad" — la prohibición es
sobre la capa del dialecto OpenUI (`Mutation`/`Query`/`$state`/`useTriggerAction()`), no sobre
React ordinario. El catálogo real de SkillNet tiene hoy **14 bloques**, no 10 como asumía el
borrador de `design.md` §5.

## Reproductor de vídeo (research.md, Pregunta 8)

No existe hoy ninguna integración de reproductor de vídeo en `skillnet-web` (búsqueda exhaustiva
sin coincidencias de `video`/`player`/`react-player`/`video.js`/`hls`/eventos de timestamp). Es
capacidad a evaluar desde cero, no una elección ya hecha — punto de partida recomendado: `<video>`
nativo + `<track kind="chapters">`/`timeupdate` antes de subir a una librería con dependencia npm
adicional.

## Enlaces conceptuales (documentos que viven en `repo/`, no aquí)

- `repo/docs/design/openui-adoption.md` — las reglas del catálogo generativo v2 y su estándar de
  honestidad sobre evidencia no concluyente.
- `repo/docs/design/design-system.md` — tokens de tema que el adaptador mapearía sobre el tema
  neutro del núcleo.
- `repo/apps/skillnet-api/src/render/spec.py` — fuente primaria y ejecutable de las reglas de
  contrato (no el resumen narrativo de `v2-dynamic-courses.md` §5.2).

## Estado

Documentación de frontera únicamente (Fase 1-3). La implementación del adaptador es la **Fase 5**
del `ROADMAP.md`, opcional, y vive enteramente en `repo/` — no bloquea ninguna fase del núcleo.
