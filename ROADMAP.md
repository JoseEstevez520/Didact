# Roadmap — Librería de Componentes de Educación

> Plan de ejecución. Requiere `specs/education-components/requirements.md` y `design.md` como
> contrato. **Esta sesión solo produce spec + plan — ninguna fase de abajo se ejecuta todavía.**
> Cada fase está pensada para entregarse a un agente distinto (o a una nueva sesión), con
> contexto suficiente para no depender de esta conversación.
>
> Recordatorio de `requirements.md` §0: esto es una librería de propósito general, distribuida
> como registry estilo shadcn/ui, usable en cualquier proyecto. SkillNet (`repo/`) es el primer
> consumidor real, vía un **adaptador** — las fases marcadas "(adaptador)" viven en `repo/`, no
> en este proyecto, y son opcionales respecto al núcleo.

## Cómo usar este roadmap

- Cada fase tiene **entrada** (qué debe existir antes de empezar), **entregable** (qué debe
  existir al terminar) y **criterio de salida** (cómo se sabe que terminó bien).
- Ninguna fase empieza sin que la anterior haya producido su entregable — en particular, la
  fase 2 (decisión de diseño) no puede fijar arquitectura sin el informe de la fase 1.
- Las fases 4+ son iterativas por componente, no un bloque monolítico: se ejecutan en oleadas
  siguiendo la prioridad que fije la fase 2.

---

## Fase 0 — Spec y plan (esta sesión)

**Estado: hecho.**

- `specs/education-components/requirements.md` (núcleo vs adaptador SkillNet explícito en §0)
- `specs/education-components/design.md` (con secciones `[PENDIENTE]` explícitas)
- Este `ROADMAP.md`

---

## Fase 1 — Deep research

**Entrada:** `specs/education-components/requirements.md` §6 (preguntas abiertas, 8 en total).
**Entregable:** un informe de investigación (`specs/education-components/research.md`,
crearlo en esta fase) que responda, con fuentes y evidencia verificada, a las 8 preguntas de
`requirements.md` §6, y que rellene las secciones `[PENDIENTE]` de `design.md` con datos.
**Criterio de salida:** cada pregunta de §6 tiene una respuesta con evidencia citada (no
"parece que" sin fuente) y una recomendación explícita. Donde la evidencia no sea concluyente,
decirlo así — un "no está claro, y esto es lo que faltaría medir" es un resultado válido de
investigación; una respuesta inventada no lo es (mismo estándar que `openui-adoption.md` §1
aplicó: "no verificado, y lo digo con esas palabras").

### Brief para el agente de investigación (usar como prompt de encargo)

> Investiga en profundidad para fundamentar el diseño de una librería de componentes de
> educación de propósito general (no específica de un proyecto), distribuida con el modelo de
> shadcn/ui (registry + CLI que copia código fuente, no dependencia npm versionada). Lee primero
> `Anfaia/library/specs/education-components/requirements.md` completo — especialmente §0
> (decisiones ya tomadas por el dueño del producto: propósito general, estilo shadcn) y §6
> (las 8 preguntas exactas) — y `design.md` (secciones marcadas `[PENDIENTE]`). No propongas
> arquitectura nueva ni escribas código: el entregable es un informe,
> `Anfaia/library/specs/education-components/research.md`, con una sección por cada pregunta de
> `requirements.md` §6, evidencia citada (URLs, comportamiento verificado si es viable), y una
> recomendación explícita por pregunta.
>
> Para la **pregunta 1** (mecanismo de registry de terceros de shadcn/ui): confirma con la
> documentación oficial actual de shadcn/ui si su CLI soporta registries no oficiales/propias
> (`registry.json`, esquema de items, hosting), y si hay límites conocidos (autenticación,
> tamaño, versionado de un mismo componente). No asumas que "shadcn es open source" implica que
> el mecanismo de registry de terceros esté maduro — verifícalo.
>
> Para la **pregunta 2** (base de primitivos: Radix UI vs React Aria/Ariakit vs Base UI):
> confirma compatibilidad real con React 19 con evidencia ejecutada o changelog explícito, no
> solo lectura de README — el repo SkillNet ya tuvo un caso (`@openuidev/react-lang`, ver
> `repo/docs/design/openui-adoption.md`) donde la única forma de saber la verdad fue ejecutar
> contra datos propios.
>
> Para la **pregunta 3** (¿Tailwind como peer dependency obligatoria?): mira cómo maneja esto
> shadcn/ui mismo y si hay alternativas (CSS plano, CSS-in-JS) que no comprometan demasiado el
> objetivo de "cualquier proyecto".
>
> Para la **pregunta 4** (repetición espaciada): compara al menos SM-2 con una alternativa
> moderna y di el coste de implementarlo sin dependencia pesada, con una API agnóstica de dónde
> se persiste el estado.
>
> Para la **pregunta 5** (accesibilidad y neurodiversidad): usa fuentes con respaldo (WCAG 2.2,
> CAST/UDL, guías de organismos reconocidos — British Dyslexia Association, etc.), no intuición
> de diseño.
>
> Para la **pregunta 6** (estándares de e-learning: H5P, Open edX XBlocks, IMS QTI/LTI,
> xAPI/SCORM): identifica qué vocabulario o interoperabilidad aportan como referencia, sin
> recomendar adoptarlos como dependencia salvo que la evidencia lo justifique claramente.
>
> Para la **pregunta 7** (adaptador SkillNet: qué componentes son expresables sin reactividad):
> lee `repo/docs/design/openui-adoption.md` §5.2 y §6 completos y clasifica cada componente de
> `requirements.md` §4.1 como apto o no para el catálogo generativo v2 de SkillNet, con motivo.
>
> Para la **pregunta 8** (adaptador SkillNet: reproductor de vídeo): revisa si `skillnet-web` ya
> integra alguno antes de asumir que hay que elegir uno desde cero.

---

## Fase 2 — Decisión de diseño

**Entrada:** `research.md` de la fase 1.
**Entregable:** `design.md` actualizado: secciones `[PENDIENTE]` resueltas (mecanismo de
registry §3, base de primitivos §2, requisito de Tailwind), y tabla de inventario de §5 con
prioridad final del núcleo, no "borrador". La ubicación (§7, repo independiente) ya está
decidida y no se reabre aquí salvo que la investigación encuentre un impedimento real.
**Criterio de salida:** no queda ninguna marca `[PENDIENTE]` en `design.md`; el orden de
prioridad de componentes es defendible con la evidencia de `research.md`, no con intuición.

## Fase 3 — Scaffold del proyecto (núcleo)

**Entrada:** `design.md` cerrado (fase 2).
**Entregable:** estructura del repo independiente (`Anfaia/library`): configuración de
build/tsconfig, mecanismo de registry (CLI propio o integración con el de shadcn según lo que
diga fase 2), Storybook con el tema neutro por defecto, pipeline de test.
**Criterio de salida:** un componente trivial de ejemplo (p. ej. un `Badge` educativo simple)
se puede construir, testear, ver en Storybook, y copiar a un proyecto de prueba vía el
mecanismo de registry de punta a punta — probando que el andamiaje funciona antes de construir
los componentes reales.

## Fase 4 — Primera oleada de componentes (núcleo, alta prioridad)

**Entrada:** scaffold de fase 3 + prioridad de fase 2.
**Entregable:** los componentes marcados de prioridad alta en `design.md` §5 (previsiblemente
`Flashcard`, variantes de quiz, `Hint`/`Reveal`, ejercicios de emparejar — a confirmar tras fase
2), cada uno con: implementación, entrada de registry, historia de Storybook con sus estados,
test de comportamiento, paso de comprobación de a11y.
**Criterio de salida:** cada componente de esta oleada cumple RF-12–17 de `requirements.md`
(núcleo, no adaptador).

## Fase 5 (adaptador SkillNet, opcional) — Integración con el catálogo generativo v2

**Vive en `repo/`, no en este proyecto.** No bloquea ninguna fase del núcleo.

**Entrada:** componentes de fase 4 clasificados como "aptos para v2" en fase 2 (pregunta 7).
**Entregable:** esquema `zod` + `defineComponent` en
`repo/apps/skillnet-web/src/components/courses/kit/`, mirror en
`repo/apps/skillnet-api/src/render/kit.py`, y verificación de que
`test_render_prompt_artifact.py` / `catalog-drift.test.ts` siguen en verde con el catálogo
ampliado.
**Criterio de salida:** el catálogo ampliado no introduce reactividad, no reabre
`openui-adoption.md` §6, y los tests de deriva pasan.

## Fase 6 — Segunda oleada + publicación de la registry

**Entrada:** fase 4 completa para la primera oleada (fase 5 es opcional y no bloquea esto).
**Entregable:** componentes de prioridad media/baja restantes, sitio de documentación
navegable de la registry, primera versión publicada (hosting del `registry.json` /
mecanismo elegido en fase 2) para que cualquier proyecto —no solo SkillNet— pueda consumirla.
**Criterio de salida:** inventario de `requirements.md` §4.1 cubierto o explícitamente
descartado con motivo (no simplemente olvidado); al menos un consumidor distinto de SkillNet
(real o de prueba) valida que el mecanismo de copia funciona fuera del contexto original.

## Fase 7 — Medición e iteración

**Entrada:** componentes en uso real en al menos un proyecto consumidor (SkillNet u otro).
**Entregable:** lectura de señales de uso — en SkillNet, vía `node_render_views` o telemetría
equivalente si el componente entró al adaptador v2; en general, feedback de qué componentes se
copian/adoptan más — para decidir qué iterar primero.
**Criterio de salida:** al menos una decisión de iteración (priorizar, rediseñar o retirar un
componente) tomada con datos de uso, no solo con intuición.

---

## Fuera de este roadmap

- Activar reactividad en el catálogo generativo de SkillNet (`RENDER_ALLOW_REACTIVE`).
  Condiciones ya escritas en `openui-adoption.md` §6; este roadmap no las reabre.
- Autoría de contenido pedagógico real (bancos de preguntas, currícula).
- Cualquier decisión de diseño visual específica de SkillNet dentro del núcleo — eso es
  exactamente lo que el adaptador existe para evitar (ver `design.md` §0).
