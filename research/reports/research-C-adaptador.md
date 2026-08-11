# Investigación C — Adaptador SkillNet (requirements.md §6, preguntas 7 y 8)

Fuentes leídas completas: `library/specs/education-components/requirements.md`,
`library/specs/education-components/design.md`,
`repo/docs/design/openui-adoption.md` (íntegro).
Fuentes de código leídas: `repo/apps/skillnet-web/src/components/courses/kit/{schemas.ts,library.tsx,index.ts,assertStaticOnly.ts,QuizItemRenderer.tsx}`,
`repo/apps/skillnet-api/src/render/spec.py`.

## Nota metodológica importante: dónde viven realmente "las 7 reglas de §5.2"

`openui-adoption.md` (el documento de *decisión*) **cita** "las 7 reglas de contrato de §5.2"
más de diez veces pero **no las enumera literalmente** dentro de sí mismo — es un documento de
decisión, no la spec original; la numeración `§5.2` que cita pertenece a otro documento
(`docs/design/v2-dynamic-courses.md`, confirmado por grep: ese fichero sí tiene una sección
`### 5.2 La IR canónica: UISpec`). La enumeración autoritativa y ejecutable de las 7 reglas está
en el docstring de `repo/apps/skillnet-api/src/render/spec.py:1-26`, que es el código que las
implementa. La uso como fuente primaria porque es la que de verdad se ejecuta en
`test_render_kit.py` y `test_render_prompt_artifact.py`:

1. **Regla 1** — `root` existe en `components` y es un contenedor (`Stack` o `Card`).
2. **Regla 2** — todo id referenciado en `children` existe (las referencias hacia adelante están permitidas).
3. **Regla 3** — sin ciclos en el grafo de `children`.
4. **Regla 4** — máx. 12 componentes por spec, máx. 5 hijos en el nivel raíz, máx. 64 bloques en el árbol ya expandido.
5. **Regla 5** — `QuizItem` no lleva respuesta correcta ni explicación; eso vive en `answer_key` y nunca viaja en el `ui_spec` (`ANSWER_KEY_KEYS` en `spec.py:75-87`: `correct`, `correct_order`, `correct_answer`, `answer`, `answers`, `blanks`, `explanation`, `rubric`, `solution`).
6. **Regla 6** — `props.text` es texto plano o marcado inline, nunca HTML.
7. **Regla 7** — en los formatos `explanation` y `mixed`, el primer hijo de `root` debe ser un `TextContent` con `variant="lead"` o un `Callout`.

A esto se suma, fuera de las 7 reglas pero igual de vinculante para "sin reactividad"
(`openui-adoption.md` §3 "Lo que NO se adopta" y §6 "condiciones no negociables"):
**cero `Mutation`, cero `Query`, cero `$state`, ningún componente puede llamar
`useTriggerAction()`**. Hoy `RENDER_ALLOW_REACTIVE = False` (citado en `openui-adoption.md`
línea ~386). Esto es lo que requirements.md §6 llama "§6" al referirse a las condiciones de
reactividad.

También reviso el catálogo real de bloques en
`kit/schemas.ts` / `kit/library.tsx`: **hoy son 14 componentes**, no 10 como asume el borrador
de `design.md` §5 (`Stack, TextContent, Card, Callout, StepSequence, Table, CodeBlock, Chart,
QuizItem, BeforeAfter, Markdown, DragOrder, AudioExplanation, PronunciationExercise` —
`schemas.ts:167-182`). El catálogo creció desde que se escribió el borrador de `design.md`, y ya
incluye precedentes directos para varias filas que el borrador marcaba como "a confirmar".

---

## Pregunta 7 — ¿Qué componentes del inventario §4.1 son expresables sin reactividad?

Patrón clave observado en el código real: un bloque del kit puede tener **estado interno de
React puro** (p. ej. `QuizItemBlock` es "autónomo: su propio estado y su propio envío a
`POST /nodes/{id}/answer`" — `QuizItemRenderer.tsx:16-19`) sin violar "sin reactividad", porque
esa prohibición es sobre la **capa del dialecto OpenUI** (`$state`, `Mutation`, `Query`,
`useTriggerAction`), no sobre `useState`/`useEffect` ordinarios dentro del componente React que
renderiza el bloque. Esto es la clave para clasificar Flashcard, Hint/Reveal, DragOrder y Rubric
como APTOS pese a tener interactividad visible.

| Componente (RF) | Veredicto | Motivo, con regla concreta |
|---|---|---|
| **Flashcard** (RF-1) | **APTO** | Front/back/flip/marcar-sabido son estado de React interno efímero, no DSL. No usa `Mutation`/`Query`/`$state` (prohibición de §3/§6, no una de las 7 reglas). No hay `answer_key` que proteger (regla 5 no aplica: no es un ítem calificado). Precedente directo: `QuizItemBlock` ya combina props estáticas + estado interno autónomo (`QuizItemRenderer.tsx:16-19`). |
| **SpacedRepetitionDeck** (RF-2) | **NO APTO** | Necesita persistir/leer estado de repaso entre sesiones (qué carta toca, próxima fecha) — eso exige una `Query`/`Mutation` real, prohibidas sin excepción hoy (`openui-adoption.md` §3 "La capa reactiva queda apagada"; `RENDER_ALLOW_REACTIVE = False`). No es un problema de las 7 reglas de `spec.py`, es la prohibición previa de reactividad de la que dependen esas reglas. Coincide con requirements.md §2 ("Fuera de alcance: Reactividad tipo Mutation/Query/$state"). |
| **MatchingExercise / SortExercise / CategorizeExercise** (RF-3) | **APTO** | Precedente ya construido y en producción: `DragOrder` (`schemas.ts:150-154`, `library.tsx:254-265`) declara `instruction`, `items`, `correctOrder` como props **literales** y resuelve el checkeo con React interno, sin `Mutation`. Cumple regla 6 (texto plano) y regla 4 (tamaño). El borrador de `design.md` decía "a confirmar"; la confirmación con evidencia de código es que **ya está resuelto para el caso de ordenar**; matching/categorizar seguirían el mismo patrón de props literales. |
| **Variantes de quiz** (multi-respuesta, V/F, hueco, abierta corta) (RF-4) | **APTO** | `QuizItem` ya cubre exactamente este espacio: `item_type` tiene 6 valores (`test, true_false, fill_blank, order_steps, practical_case, dialogue`, `schemas.ts:48-55`), sin `correct`/`explanation` en el prop schema (regla 5, `quizItemProps` en `schemas.ts:130-136`: comentario explícito "No `correct` and no `explanation`: contract rule 5"). La verificación asistida de respuesta abierta corta ya corre server-side vía `POST /nodes/{id}/answer` (autónomo, no `Mutation` del dialecto). |
| **Glossary / Term** (RF-5) | **APTO** | Presentación pura (tooltip/popover sobre texto), sin respuesta que proteger (regla 5 no aplica) y sin HTML embebido si el contenido es texto/marcado inline (regla 6). Ningún dato dinámico ni consulta. |
| **Hint / Reveal** (RF-6) | **APTO, con una tensión estructural que el borrador de `design.md` no señala** | Mostrar/ocultar es estado de React interno (como el toggle de `DragOrder`/`QuizItemBlock`), no reactividad del dialecto. PERO: el modelo de "reserialización canónica" (`openui-adoption.md` "La regla arquitectónica que más importa", línea ~262) implica que **todo el `ui_spec`, incluido el contenido oculto, se sirve de una sola vez** al render del nodo — no hay una segunda petición al servidor para pedir la pista. Si el contenido a revelar es información pedagógica normal (una pista, una explicación no calificada), es aceptable que viaje en el prop y solo se oculte por CSS/estado hasta que el usuario la pida — igual que un `<details>`. Pero si lo que se "revela" es la respuesta correcta de un `QuizItem`, eso **sí** choca con la regla 5 (nunca debe estar en el `ui_spec`) y tendría que resolverse revelándose vía el mismo POST autónomo que ya usa `QuizItem`, no como prop del propio bloque `Hint/Reveal`. RF-6 tal como está escrito en requirements.md ("no debe filtrar la respuesta correcta en el DOM hasta que el usuario la solicite explícitamente") es, por tanto, **solo compatible sin reactividad si "Hint/Reveal" nunca envuelve una respuesta de examen** — debe documentarse esa frontera en el adaptador. |
| **Progreso / mastery** (RF-7) | **APTO** | Un indicador que pinta una foto fija (p. ej. `mastery: 0.72` en el momento de generación) es un prop literal, exactamente como `Chart` ya lo hace con `values: number[]` (`schemas.ts:118-123`, sin `Query`). No es una barra que se actualice en vivo — eso sí requeriría `Query`, prohibida. |
| **Timeline / Steps** (RF-8) | **APTO** | Ya existe literalmente: `StepSequence` (`schemas.ts:103-106`, `library.tsx:160-170`) es `title` + `steps: string[]`, ambos literales. Coincidencia 1:1 con RF-8, no es una analogía. |
| **Checkpoint sobre vídeo** (RF-9) | **APTO en principio / bloqueado en la práctica** | Nada en las 7 reglas ni en la prohibición de reactividad impide declarar `videoUrl`, `timestampSeconds`, `question` como props literales y resolver la pausa/pregunta con estado de React interno del propio bloque (mismo patrón autónomo que `QuizItemBlock`) — igual que el checkpoint no necesita `Mutation`/`Query` del dialecto para funcionar. El bloqueo real es de infraestructura, no de reglas: **no hay reproductor de vídeo elegido en `skillnet-web`** (ver Pregunta 8), así que no hay contra qué escribir el `onTimeUpdate`/pausa. Es exactamente la doble condición que ya anticipaba el borrador de `design.md` ("a confirmar, depende del reproductor"), y aquí la confirmo separando las dos preguntas: reactividad del dialecto = no es el problema; reproductor = sí lo es. |
| **Rubric / autoevaluación** (RF-10) | **APTO** | Checklist de criterios con niveles y sin nota automática (por definición de RF-10, "sin nota automática si el criterio es subjetivo") significa que no hay `answer_key` que proteger (regla 5 no aplica: no hay respuesta correcta secreta, es autoevaluación). Estado de selección es efímero, como en `Hint/Reveal`. Estructuralmente es una `Table`/`StepSequence` con un control de selección por fila. |
| **Ejercicio de código** (RF-11) | **NO APTO** | "Comprobación" implica ejecutar o al menos validar código contra un resultado — eso exige una llamada de red equivalente a una `Mutation` (prohibida sin excepción hoy) o un runtime de ejecución en cliente muy por fuera del alcance de un bloque declarativo estático, y fuera del modelo de seguridad de `gate.py`/`assertStaticOnly.ts` (pensado para nodos sin efectos). El *display* de código sin comprobación ya existe (`CodeBlock`, `schemas.ts:113-116`) y ese subconjunto sí es APTO, pero no cubre el requisito completo de RF-11. Coincide con el borrador de `design.md` ("Probable no, necesita ejecución"). |

### Comparación con el borrador de `design.md` §5 — discrepancias encontradas

1. **RF-3 (matching/sort/categorize)**: el borrador decía "A confirmar". Con evidencia de código
   se puede subir a **confirmado APTO** — `DragOrder` ya es un componente en producción con
   exactamente ese patrón (props literales, sin `Mutation`).
2. **RF-8 (Timeline)**: el borrador lo daba como "Sí" genérico; en realidad ya existe
   literalmente como `StepSequence` en el catálogo — no haría falta "crearlo", solo mapear el
   componente del núcleo al bloque ya registrado (o sustituirlo).
3. **RF-6 (Hint/Reveal)**: el borrador anota correctamente el cuidado necesario ("con cuidado de
   no filtrar la respuesta"), pero no explicita que el modelo arquitectónico de "una sola
   reserialización canónica servida de golpe" (sin segunda petición) hace que esa cautela sea
   estructural y no solo de implementación: cualquier "Hint/Reveal" que envuelva una respuesta de
   examen tiene que delegar en el mismo canal autónomo servidor de `QuizItem`, no llevar el
   secreto como prop propio.
4. **RF-9 (checkpoint sobre vídeo)**: el borrador lo marca "a confirmar (depende del
   reproductor)" como una sola pregunta. Aquí separo la pregunta en dos: la compatibilidad con
   "sin reactividad" **no** es el obstáculo (es expresable con el mismo patrón autónomo que
   `QuizItem`/`DragOrder`); el obstáculo real y el único pendiente es la ausencia de reproductor
   (Pregunta 8).
5. El borrador cuenta "10 bloques actuales"; el catálogo real de `schemas.ts`/`library.tsx` tiene
   **14** (se añadieron `BeforeAfter`, `DragOrder`, `AudioExplanation`, `PronunciationExercise`
   desde que se escribió el borrador). No cambia ningún veredicto, pero sí la base de precedentes
   disponibles para justificar APTO en RF-1, RF-3 y RF-8.

### Recomendación explícita — Pregunta 7

De los 11 componentes del inventario, **8 son APTOS** para el catálogo generativo v2 sin tocar
la capa reactiva (Flashcard, Matching/Sort/Categorize, variantes de quiz, Glossary/Term,
Hint/Reveal, progreso/mastery, Timeline/Steps, Rubric), **1 es APTO en principio pero bloqueado
por infraestructura** (checkpoint sobre vídeo, RF-9 — ver Pregunta 8), y **2 son NO APTOS
mientras `RENDER_ALLOW_REACTIVE` siga en `False`** (SpacedRepetitionDeck, ejercicio de código).
Para el adaptador SkillNet, priorizar el registro en este orden: primero los que ya tienen
precedente 1:1 en el kit actual (Timeline vía `StepSequence`, Matching/Sort vía `DragOrder`,
variantes de quiz vía `QuizItem`), luego los nuevos sin precedente directo pero sin fricción de
reglas (Flashcard, Glossary, progreso/mastery, Rubric), y dejar Hint/Reveal para cuando el
adaptador documente explícitamente la frontera "nunca envuelve una respuesta de examen".

---

## Pregunta 8 — ¿Hay ya un reproductor de vídeo integrado en `skillnet-web` que soporte checkpoints?

Búsqueda ejecutada sobre `repo/apps/skillnet-web/` (y comprobación cruzada en
`repo/apps/skillnet-api/src`) con Grep y Glob por: `video`, `player`, `react-player`,
`ReactPlayer`, `video.js`/`videojs`, `hls`/`hls.js`, `mux`, `vimeo`, `youtube`, `<video`, `Plyr`,
y por los términos de eventos de checkpoint: `onTimeUpdate`, `currentTime`, `timeupdate`,
`checkpoint`, `cue`, `seek`.

**Resultado: no se encontró ninguna integración de reproductor de vídeo en `skillnet-web`.**
Cero coincidencias en código fuente, cero ficheros con "video" o "player" en el nombre, y cero
menciones de eventos de timestamp/checkpoint en todo el árbol `src/`. Tampoco hay nada en
`skillnet-api`.

La única dependencia multimedia real del proyecto es `wavesurfer.js` (`^7.12.11`) en
`apps/skillnet-web/package.json`, que es para **audio** (visualización de forma de onda) — es la
base de `AudioExplanationBlock`/`PronunciationExerciseBlock`, no de vídeo. Es, eso sí, un
precedente útil: demuestra que el proyecto **sí** acepta una dependencia externa focalizada con
versión fijada cuando el kit la necesita (coherente con RNF-5 de `requirements.md`: "versión
exacta y test de deriva").

### Qué habría que evaluar desde cero (no hay decisión previa que reutilizar)

1. **Tipo de fuente de vídeo**: ¿vídeo autoalojado (mp4/HLS) o incrustado de terceros
   (YouTube/Vimeo)? Esto condiciona todo lo siguiente — un `<iframe>` de YouTube/Vimeo solo
   expone eventos de tiempo vía su SDK JS (`postMessage`/IFrame API), con menos control fino que
   un elemento nativo.
2. **`<video>` nativo + Web API `timeupdate`/`TextTrack` (`<track kind="chapters">`, `cues`)**:
   es la opción de menor dependencia (cero paquete nuevo), coherente con la filosofía de mínima
   dependencia que ya se ve en el kit (solo `wavesurfer.js` para audio). Soporta checkpoints por
   temporización con eventos nativos del DOM, sin librería.
3. **`react-player`**: wrapper común para unificar mp4/YouTube/Vimeo bajo una API, pero es una
   dependencia npm adicional (con su propio riesgo de versión menor rompiendo, el mismo patrón
   de riesgo que motivó el rechazo de mantener `@openuidev` sin test de deriva) — necesitaría el
   mismo tratamiento de versión exacta + test de deriva que exige RNF-5.
4. **`video.js` / `hls.js` / Mux**: relevantes solo si hay necesidad real de streaming adaptativo
   (HLS) — no hay evidencia en el repo de que SkillNet sirva vídeo en HLS hoy; sería
   sobre-ingeniería evaluarlo sin ese requisito confirmado primero.
5. **Accesibilidad**: subtítulos/transcripción (relevante para RF-12/RF-14 del núcleo,
   neurodiversidad y control de tiempo) — cualquier opción elegida debe soportar `<track>`
   WebVTT o equivalente, no soplarlo como "a añadir después".
6. **Encaje con el modelo "sin reactividad" de la Pregunta 7**: el checkpoint en sí (pausar,
   mostrar pregunta) se resuelve con estado de React autónomo del bloque, no con el dialecto
   OpenUI — así que la elección de reproductor no reabre `openui-adoption.md`, es una decisión de
   dependencia de UI ordinaria del núcleo o del adaptador, sujeta a RNF-5.

### Recomendación explícita — Pregunta 8

No inventar una integración de vídeo en esta fase de investigación: **no existe hoy en
`skillnet-web`, hay que evaluarla desde cero**, y no hay evidencia en el repo de qué tipo de
fuente de vídeo usa o usaría SkillNet (autoalojado vs. YouTube/Vimeo), dato que hace falta antes
de elegir. Punto de partida recomendado para la investigación técnica (no decidido aquí): probar
primero `<video>` nativo + `<track kind="chapters">`/eventos `timeupdate` como opción de coste
cero en dependencias, y solo subir a `react-player` u otra librería si aparece un requisito
concreto (p. ej. vídeos ya alojados en YouTube/Vimeo) que el elemento nativo no cubra.
