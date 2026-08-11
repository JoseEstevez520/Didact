# Investigación complementaria (lote D) — Fuentes aportadas por el dueño del producto

> Contexto leído: `specs/education-components/requirements.md` (§4.1 RF-1..RF-11, §4.2 a11y, §6
> preguntas abiertas) y `specs/education-components/design.md`. Fecha de verificación: 2026-08-11.
> Método: WebFetch directo cuando la fuente fue accesible; cuando el fetch directo falló (403/402/
> paywall/redirect a login), se indica explícitamente y se recurrió a WebSearch sobre fragmentos
> citables de la propia fuente o de resúmenes secundarios verificables (PubMed, ERIC, APS,
> abstract del editor) — nunca se ha inventado contenido no verificado.

---

## Bloque 1 — Taxonomía y esquemas

### QTI 3.0 (1EdTech) — Impl. Guide
**URL**: https://www.imsglobal.org/spec/qti/v3p0/impl — **Accesible** (WebFetch directo, contenido
leído).

**Dato concreto**: QTI 3.0 define **21 tipos de interacción normalizados** (no ~19 como enmarcaba
el brief — discrepancia a señalar), cada uno con un elemento formal `qti-*-interaction`:

| # | Interacción QTI 3.0 | Qué modela | Mapeo a nuestro inventario |
|---|---|---|---|
| 1 | `qti-choice-interaction` | Selección de una o varias opciones | RF-4 (opción única / multi-respuesta) |
| 2 | `qti-text-entry-interaction` | Respuesta textual corta inline | RF-4 (rellenar hueco) |
| 3 | `qti-extended-text-interaction` | Respuesta textual extensa | RF-4 (respuesta abierta corta) |
| 4 | `qti-gap-match-interaction` | Rellenar huecos desde un banco de opciones | RF-3 (matching) / RF-4 (hueco) |
| 5 | `qti-hotspot-interaction` | Selección de áreas sobre una imagen | **Sin RF** — gap |
| 6 | `qti-hot-text-interaction` | Selección de palabras/frases dentro de un texto | **Sin RF** — gap (equivalente a "Mark the Words" de H5P) |
| 7 | `qti-inline-choice-interaction` | Dropdown inline (una opción) | RF-4 (hueco tipo dropdown) |
| 8 | `qti-match-interaction` | Asociar dos conjuntos de opciones | RF-3 (matching) |
| 9 | `qti-order-interaction` | Reordenar una secuencia | RF-3 (ordenar secuencia) |
| 10 | `qti-graphic-order-interaction` | Ordenar hotspots sobre una imagen | **Sin RF** — gap (variante gráfica) |
| 11 | `qti-associate-interaction` | Asociar elementos entre sí (no dos sets separados) | RF-3 (matching) |
| 12 | `qti-graphic-associate-interaction` | Asociar hotspots dentro de una imagen | **Sin RF** — gap |
| 13 | `qti-graphic-gap-match-interaction` | Huecos definidos como hotspots + opciones externas | **Sin RF** — gap |
| 14 | `qti-media-interaction` | Control de reproducción de medios temporales | RF-9 (checkpoint sobre vídeo, parcialmente) |
| 15 | `qti-position-object-interaction` | Posicionar un objeto/imagen sobre otra imagen (stage) | **Sin RF** — gap |
| 16 | `qti-select-point-interaction` | Seleccionar uno o varios puntos sobre un gráfico | **Sin RF** — gap |
| 17 | `qti-slider-interaction` | Control deslizante para valor numérico | **Sin RF** — gap (respuesta numérica) |
| 18 | `qti-upload-interaction` | Subida de archivo como respuesta | **Sin RF** — gap (parcialmente relacionado con RF-11) |
| 19 | `qti-drawing-interaction` | Dibujar/modificar un gráfico | **Sin RF** — gap |
| 20 | `qti-custom-interaction` | Extensión propietaria del motor de entrega | Mecanismo de extensibilidad, no un tipo de contenido |
| 21 | `qti-portable-custom-interaction` | Extensión portable vía JS del autor | Mecanismo de extensibilidad, no un tipo de contenido |

**Implicación para el inventario**: el framing del dueño ("es la ontología que estamos
reinventando a mano") se confirma parcialmente — RF-3/RF-4 cubren bien las interacciones
**textuales/de lista** (choice, match, order, gap-match, text-entry) pero dejan **una familia
entera sin cubrir: interacciones sobre gráficos/imágenes** (hotspot, graphic-order,
graphic-associate, graphic-gap-match, position-object, select-point, drawing) y **respuesta
numérica por slider**. Esto no estaba en `requirements.md` §4.1 en absoluto — es un hallazgo de
alcance, no solo de nomenclatura.

### H5P semantics.json
**URL**: https://h5p.org/semantics — **Accesible**.

**Dato concreto**: H5P describe cada content type con un fichero `semantics.json` declarativo
(no código) con tipos básicos (`text`, `number`, `boolean`), contenedores (`group`, `list`) y
tipos complejos (`select`, `library` —dependencia anidada de otro content type—, `image`,
`video`, `audio`, `file`). Atributos obligatorios: `type`, `name`, `label`; opcionales:
`description`, `default`, `optional`, `min`/`max`/`regexp`/`maxLength` según tipo. El mismo
esquema sirve para **generar el formulario del editor** y para **validar el contenido en
runtime** — es doblemente útil (autoría + validación), no solo documentación.

**Implicación para diseño**: nuestras entradas de registry (RF-15/RF-17, `design.md` §3) podrían
adoptar esta misma dualidad: un esquema declarativo por componente (props tipadas, valores por
defecto, restricciones) que sirva a la vez para (a) generar la entrada del registry/Storybook y
(b) validar props en runtime — coherente con RNF-4 (streaming, props incompletas) si el esquema
declara qué campos son obligatorios vs. progresivos.

### Repos de content types de H5P
**URL**: https://github.com/h5p — **Parcialmente accesible** (el listado de la organización solo
renderizó 10 de 158 repos; hubo que buscar repos concretos por nombre).

Ejemplos verificados individualmente:
- **`h5p-flashcards`** (https://github.com/h5p/h5p-flashcards) — MIT, 749 commits. Modela
  tarjetas donde el usuario debe adivinar la respuesta a partir de un prompt — análogo directo a
  RF-1 (`Flashcard`), pero orientado a "adivinar" más que a "voltear".
- **`h5p-question-set`** (https://github.com/h5p/h5p-question-set) — MIT, 1101 commits. Modela un
  quiz compuesto por múltiples tareas encadenadas (análogo a agrupar varias instancias de RF-4
  bajo un contenedor de sesión) — patrón que nuestro inventario no tiene explícito: un
  "contenedor de ejercicios" con progreso agregado.
- **`h5p-drag-question`** (nombre real del repo de drag-and-drop; la URL
  `h5p-drag-and-drop` del dueño da 404 — **corrección de dato**: el repo correcto es
  https://github.com/h5p/h5p-drag-question). Su `semantics.json`
  (https://github.com/h5p/h5p-drag-question/blob/master/semantics.json) define zonas de destino
  ("drop zones") y elementos arrastrables tipados por librería (`H5P.AdvancedText`, `H5P.Image`),
  con la respuesta correcta marcada en el propio editor — directamente relevante para RF-3.

**Nota de fiabilidad**: no pude enumerar sistemáticamente "2-3 ejemplos" desde el listado de la
organización por limitación de renderizado del fetch; los ejemplos anteriores se verificaron cada
uno por fetch individual a su propio repo.

### xAPI interaction types (ADL)
**URL**: https://github.com/adlnet/xAPI-Spec (documento relevante:
`xAPI-Data.md`) — **Accesible** tras navegar al fichero correcto (el landing del repo no trae el
contenido; hubo que pedir `xAPI-Data.md` directamente).

**Dato concreto**: la enumeración es **cerrada, exactamente 10 valores** para
`interactionType`:

1. `true-false` — dos respuestas posibles (verdadero/falso)
2. `choice` — selección entre varias opciones (una o varias)
3. `fill-in` — respuesta corta (≤250 caracteres típicamente)
4. `long-fill-in` — respuesta larga (>250 caracteres)
5. `matching` — emparejar un conjunto origen con un conjunto destino
6. `performance` — tarea de varios pasos
7. `sequencing` — ordenar elementos de un conjunto
8. `likert` — selección en una escala discreta
9. `numeric` — respuesta numérica
10. `other` — cualquier otra interacción no cubierta arriba

**Implicación**: para que SkillNet (u otro consumidor) pueda emitir *statements* xAPI reales desde
nuestros componentes, cada componente de RF-3/RF-4 necesita declarar a qué `interactionType`
xAPI corresponde. Mapeo directo: RF-3 matching→`matching`, RF-3 ordenar→`sequencing`, RF-4 V/F→
`true-false`, RF-4 multi-respuesta/única→`choice`, RF-4 hueco→`fill-in`, RF-4 abierta corta→
`long-fill-in` o `fill-in` según longitud. **Sin mapeo directo en RF-1..RF-11**: `performance`,
`likert` y `numeric` — ninguno de nuestros RF cubre explícitamente una escala tipo Likert o
respuesta numérica pura (coincide con el gap de `qti-slider-interaction` detectado en QTI arriba).

### Recomendación Bloque 1

Adoptar QTI y xAPI como **vocabulario de referencia para nombrar/tipar**, no como dependencia:
(a) para cada componente de RF-3/RF-4, documentar en su entrada de registry a qué interacción QTI
y a qué `interactionType` xAPI corresponde (habilita interoperabilidad de reporting sin adoptar
todo QTI); (b) **añadir explícitamente a `requirements.md` §4.1 una nota de alcance** sobre las
interacciones gráficas/sobre imagen (hotspot, graphic-order/associate/gap-match, drawing,
select-point) y sobre respuesta numérica/Likert como **fuera de alcance v1, candidatas a v2** —
hoy quedan implícitamente descartadas sin que el spec lo diga; (c) para el formato de entrada de
registry, adoptar el patrón dual de H5P `semantics.json` (un esquema que sirve de documentación +
validación), aplicado a RF-15/RF-17.

---

## Bloque 2 — Evidencia pedagógica

> Nota de acceso: las cuatro fuentes de este bloque están detrás de paywall/login en su URL
> primaria (SAGE, Springer, Wiley) salvo Frontiers, que es open-access. Para las tres cerradas, el
> fetch directo devolvió 403 (SAGE), 402 (Wiley) o una redirección a login de Springer — se indica
> explícitamente. El contenido se reconstruyó vía WebSearch sobre citas textuales y resúmenes de
> fuentes secundarias fiables (abstract de PubMed, página oficial de divulgación de la revista —
> Association for Psychological Science —, ERIC). No se ha inventado ningún dato; donde la
> confirmación es indirecta se dice así.

### Dunlosky et al. 2013
**URL**: https://journals.sagepub.com/doi/10.1177/1529100612453266 — **No accesible
directamente** (403 Forbidden). Reconstruido vía el resumen oficial de la Association for
Psychological Science (https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html)
y el abstract de PubMed (https://pubmed.ncbi.nlm.nih.gov/26173288/).

**Dato concreto**: de las 10 técnicas evaluadas (elaborative interrogation, self-explanation,
summarization, highlighting/underlining, keyword mnemonic, imagery for text, rereading, practice
testing, distributed practice, interleaved practice), solo **practice testing** y **distributed
practice** reciben utilidad **alta**; **highlighting/underlining** y **rereading** reciben
utilidad **baja** confirmada directamente en la fuente secundaria (además, por conocimiento
ampliamente documentado de este paper, keyword mnemonic e imagery for text también se clasifican
como baja utilidad, y elaborative interrogation/self-explanation/interleaved practice como
utilidad moderada — **esta parte no se verificó palabra por palabra en una fuente accesible en
esta sesión**, se señala como consistente con el resumen ampliamente citado pero no confirmado
línea por línea contra el PDF original).

**Traducción al inventario**: RF-2 (repetición espaciada, = distributed practice) y las variantes
de quiz de RF-4 usadas como *practice testing* tienen el respaldo de evidencia MÁS FUERTE de todo
el inventario. En cambio, RF-5 (Glossary/Term con tooltip, análogo a resaltar/consultar términos)
y cualquier variante de "relectura pasiva" no tienen ese respaldo — el `Glossary` debería
diseñarse para **forzar recuperación activa** (p. ej. quiz de términos) en vez de solo consulta
pasiva, si se quiere maximizar aprendizaje real y no solo conveniencia.

### Wisniewski, Zierer & Hattie 2019
**URL**: https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full — **Accesible**
(open access, WebFetch directo).

**Dato concreto**: meta-análisis de **435 estudios / 994 tamaños de efecto / ~61,000
participantes**. Efecto global d=0.48. El feedback **con información sobre tarea, estrategia y
autorregulación** es el más potente (d=0.99). El feedback de **refuerzo/castigo, poco
informativo** es el menos efectivo (d=0.24); el 86% de las intervenciones de feedback con efecto
negativo en motivación eran "no informativas (premios o castigos)". El feedback centrado en el
**yo/elogio personal** es generalmente contraproducente para motivación.

**Traducción a requisito de diseño**: para RF-4 (quizzes) y RF-6 (Hint/Reveal), el feedback de
"correcto/incorrecto" a secas o con elementos gamificados tipo puntos/insignias sin explicación
es la forma de feedback MENOS respaldada por evidencia. Requisito de diseño concreto propuesto:
todo componente de quiz/ejercicio con feedback debe soportar (no necesariamente exigir) un slot de
**feedback informativo** (por qué la respuesta es correcta/incorrecta, qué estrategia usar) —
no solo un estado visual de acierto/error. Esto es una revisión a **RF-4** que `design.md` no
recoge hoy explícitamente.

### Fiorella & Mayer 2016
**URL**: https://link.springer.com/article/10.1007/s10648-015-9348-9 — **No accesible
directamente** (redirección 303 a login de Springer/IDP). Confirmado vía ERIC
(https://eric.ed.gov/?id=EJ1120458) y agregadores de resumen (Semantic Scholar, ResearchGate)
que citan el índice de las 8 estrategias; se intentó también un PDF de terceros
(bootcampmilitaryfitnessinstitute.com) pero no pudo extraerse texto legible del binario.

**Dato concreto**: las 8 estrategias generativas son **summarizing, mapping, drawing, imagining,
self-testing, self-explaining, teaching, enacting**.

**Traducción al inventario**: de las 8, dos son directamente expresables como componente nuevo
que hoy NO existe en RF-1..RF-11:
- **self-testing** → ya cubierto de facto por RF-4/RF-2 (practice testing).
- **self-explaining** → **sin componente hoy**: un prompt que pide al alumno explicar por qué una
  respuesta es correcta antes o después de verla, encajaría como extensión de RF-6 (`Hint/Reveal`)
  o como componente nuevo `SelfExplanation`.
- **mapping** (mapas conceptuales) → **sin componente hoy** — candidato a componente nuevo, pero
  de mayor coste de implementación (editor de nodos/relaciones) que el resto del inventario.
- **teaching** (explicar a otro / a un agente) → parcialmente relacionado con verificación asistida
  de RF-4 (respuesta abierta corta), si se enmarca como "explica esto y el sistema evalúa".
- **drawing / imagining / enacting** → poco expresables como componente de librería genérica
  (requieren canvas de dibujo libre o simulación física) — quedan fuera de alcance razonable.
- **summarizing** → parcialmente cubierto si RF-4 (respuesta abierta corta) se usa para pedir
  resúmenes, pero no hay componente dedicado.

### Sitzmann 2011
**URL**: https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x — **No accesible
directamente** (402 Payment Required). Confirmado vía resultados de búsqueda que citan cifras
específicas del abstract/resumen ampliamente replicado del paper (Personnel Psychology, 64,
489–528).

**Dato concreto**: meta-análisis de **65 estudios, 6,476 participantes**. Frente a grupos de
comparación, los simulation games mostraron: autoeficacia +20% (d=0.52), conocimiento
declarativo +11% (d=0.28), conocimiento procedimental +14% (d=0.37), retención +9% (d=0.22). El
propio estudio **declara evidencia fuerte de sesgo de publicación** en la investigación de
simulation games — es decir, los tamaños de efecto reportados en la literatura publicada
probablemente sobreestiman el efecto real.

**Traducción al inventario**: no hay un RF dedicado a "simulation game" ni "escenario ramificado"
en RF-1..RF-11 hoy. La evidencia es positiva pero moderada (d entre 0.22 y 0.52) y el propio autor
avisa de sesgo de publicación — esto pesa a favor de **no sobrepriorizar** un componente de
simulación/escenario complejo frente a técnicas con evidencia más sólida y sin ese sesgo declarado
(practice testing, distributed practice, feedback informativo). Conecta directamente con Bloque 3
(Ink/inkjs): si se añade un componente de escenario ramificado, debe entrar con prioridad
**media-baja**, no alta, pese a lo atractivo que resulte narrativamente.

### Recomendación Bloque 2

Incorporar una sección nueva a `requirements.md` (o a `design.md`) que declare explícitamente qué
priorización de RF-1..RF-11 está respaldada por evidencia fuerte (RF-2/RF-4 vía Dunlosky) y cuál
es débil/no evaluada (RF-9 vídeo checkpoint, RF-10 rúbrica, RF-11 código — ninguna de las 4
fuentes las evalúa). Añadir a RF-4 y RF-6 un requisito de **slot de feedback informativo**
(Wisniewski et al.), y evaluar dos componentes nuevos candidatos de baja prioridad:
`SelfExplanation` y `ConceptMap` (Fiorella & Mayer), documentándolos como **fuera del inventario
actual, propuesta para v2** — no implementarlos ya, dado que ninguno tiene la prioridad de
RF-1..RF-8.

---

## Bloque 3 — Librerías candidatas

### dnd-kit
**URL**: https://github.com/clauderic/dnd-kit — **Accesible**.

**Dato concreto**: MIT, "keyboard support, sensible default ARIA attributes, customizable screen
reader instructions and live regions built-in"; soporta sensores de puntero, ratón, touch y
teclado. 17.5k stars, mantenimiento activo (1481 commits). **Matiz de mantenimiento
importante** (via WebSearch adicional): el proyecto está en transición — `@dnd-kit/core` (la API
"v1" ampliamente adoptada) no ha tenido release en ~2 años, mientras que `@dnd-kit/react` (nueva
API, 0.5.0) tuvo release hace ~2 meses. No se confirmó explícitamente compatibilidad con React 19
en la documentación fetcheada; una guía de terceros (pkgpulse.com, 2026) lo describe como "la
opción por defecto para React en 2026", pero esto es una fuente secundaria de bajo peso editorial,
no la documentación oficial.

**Traducción a RF**: resuelve directamente la queja del dueño ("los ejercicios de arrastrar
actuales incumplen WCAG 2.5.7") para RF-3 (matching/sort/categorize), al dar alternativa de
teclado de serie en vez de tener que construirla a mano.

### ts-fsrs
**URL**: https://github.com/open-spaced-repetition/ts-fsrs — **Accesible**.

**Dato concreto**: MIT, implementa FSRS v6, TypeScript nativo (ESM/CJS/UMD), requiere Node ≥20,
282 commits, releases recientes (última versión 5.4.1 hace ~3 meses según npm). Es un **paquete
estructurado multi-módulo**, no un fichero único trivial de copiar — publicado en npm, pensado
para instalarse como dependencia, no para copy-paste directo al estilo shadcn.

**Contraste con conclusión de SM-2 de otro lote**: la existencia de ts-fsrs SÍ cambia el
cálculo coste/beneficio de la pregunta 4 (`requirements.md` §6.4), pero no de forma directa hacia
"adóptalo copiándolo" — su naturaleza modular hace más razonable tratarlo como **dependencia
externa fijada con versión exacta + test de deriva** (exactamente el patrón que RNF-5 ya exige
para dependencias no copiadas, como Radix). Esto es una tercera opción intermedia entre "SM-2
casero" y "copiar FSRS a mano": adoptar ts-fsrs como dependencia real, no copiada, del componente
`SpacedRepetitionDeck` (RF-2), aceptando el coste de mantenimiento de RNF-5 a cambio de un
algoritmo con mejor evidencia (FSRS supera a SM-2 en benchmarks públicos del propio proyecto,
aunque esto no se verificó de forma independiente en esta sesión). No se determinó el tamaño del
bundle (bundlephobia no se consultó directamente).

### Ink / inkjs
**URLs**: https://github.com/inkle/ink y https://github.com/y-lohse/inkjs — **Accesibles**.

**Dato concreto**: Ink (MIT, 1559 commits, motor en C#) es un lenguaje de guiones ramificados que
compila a JSON; inkjs es el port JS/TS, "zero dependency", compatible con el compilador Ink 1.2.0
/ formato JSON v21. Ambos con licencia MIT y actividad de mantenimiento visible, aunque no se pudo
confirmar con certeza la fecha exacta del último commit de inkjs (la información de fecha no
estaba disponible en el fetch).

**Traducción a inventario**: SÍ justificaría un componente nuevo — **"escenario ramificado"** —
fuera del inventario RF-1..RF-11 actual. Encaja bien con el caso de uso explícito del dueño
(procedimientos/compliance generables por LLM: un LLM puede generar guiones Ink razonablemente
bien porque es un formato de texto estructurado y compacto). Conectado con Bloque 2: dado que la
evidencia de Sitzmann 2011 sobre simulation games es positiva pero moderada y con sesgo de
publicación declarado, este componente debería proponerse con **prioridad media-baja**, como
extensión post-v1, no como parte de RF-1..RF-11 ya fijado.

### Sandpack
**URL**: https://sandpack.codesandbox.io/ — **Accesible**.

**Dato concreto**: toolkit de CodeSandbox para "live-running code editing experiences"; incluye
CodeMirror para edición y Nodebox (runtime Node.js en navegador) para ejecución real, no solo
resaltado. Soporta React (`@codesandbox/sandpack-react`). **Licencia** (verificada por WebSearch
adicional sobre npm/Socket.dev, no en la página oficial): **Apache-2.0**, no MIT — dato relevante
para RNF-5, ya que Apache-2.0 exige atribución explícita si se llega a redistribuir código
copiado, aunque para uso como dependencia normal no supone bloqueo. La documentación fetcheada no
menciona verificación automatizada de ejercicios (comprobación de respuesta) — eso quedaría a
construir sobre Sandpack, no lo resuelve la librería.

**Traducción a RF-11**: Sandpack SÍ resuelve la parte de **ejecución** que RF-11 necesitaba (editor
+ ejecución en navegador sin backend propio), pero NO resuelve la parte de "comprobación" —
seguiría siendo trabajo nuestro construir el checker sobre la ejecución que Sandpack habilita. Es
coherente con la prioridad baja ya asignada a RF-11 en `design.md` §5: Sandpack reduce el coste de
implementarlo cuando se decida, pero no cambia la prioridad.

### Recomendación Bloque 3

Adoptar **dnd-kit** como dependencia de comportamiento (capa 1/headless, RNF-5, versión fijada)
para todos los componentes de RF-3 — es la mitigación directa y más concreta encontrada para el
incumplimiento actual de WCAG 2.5.7. Para RF-2, reabrir la pregunta 4 de `requirements.md` §6 con
una tercera opción explícita (ts-fsrs como dependencia externa fijada, no SM-2 casero ni FSRS
copiado a mano) en vez de darla por cerrada a favor de SM-2. Proponer **Ink/inkjs** como base de un
componente nuevo "escenario ramificado" fuera del inventario actual, prioridad media-baja. Dejar
Sandpack como solución técnica ya validada para cuando RF-11 se active, sin subir su prioridad.

---

## Bloque 4 — Accesibilidad legal

### WCAG 2.2 §2.5.7 Dragging Movements
**URL**: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html — **Accesible**.

**Dato concreto**: criterio de **Nivel AA**. Texto: "All functionality that uses a dragging
movement for operation can be achieved by a single pointer without dragging, unless dragging is
essential or the functionality is determined by the user agent and not modified by the author."
Excepciones: cuando el arrastre es esencial a la función, o cuando lo determina el user agent (no
el autor). La alternativa exigida es un **método de un solo puntero sin arrastre** (botones, áreas
clicables, campos de texto, menús) que logre el mismo resultado.

**Componentes de nuestro inventario que lo activan**: cualquier implementación de RF-3
(matching/sort/categorize) que dependa de arrastrar-y-soltar como **único** mecanismo de
interacción incumple 2.5.7 directamente — coincide exactamente con la nota del dueño sobre los
ejercicios de arrastrar actuales. La alternativa de un solo puntero típica para estos ejercicios es
un patrón "seleccionar origen → seleccionar destino" (dos clics/taps en vez de arrastre), que
dnd-kit no da gratis (dnd-kit da soporte de **teclado**, que es una alternativa distinta y también
válida bajo 2.5.7 si es operable con un solo mecanismo de puntero-sustituto, pero conviene
verificar si "teclado" por sí solo satisface literalmente "single pointer" o si además conviene
implementar el patrón de dos-clics como refuerzo). Esto es una matización que no estaba en el
brief: **teclado y "single pointer sin arrastre" no son necesariamente el mismo requisito** — RF-3
tal como está redactado hoy ("soporte de teclado, no solo drag-and-drop de ratón") cubre operabilidad
por teclado pero no verifica explícitamente el patrón de puntero-sin-arrastre que 2.5.7 pide en
sentido estricto.

### EN 301 549
**URL**: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/ — **No accesible directamente**
(403 Forbidden en el índice de ETSI). Confirmado vía fuentes secundarias especializadas en
cumplimiento (Deque, Acquia, WCAG.com, a11y-collective) que citan la versión vigente V3.2.1
(2021-03) y su contenido.

**Dato concreto**: EN 301 549 es el estándar europeo armonizado de accesibilidad para
contratación pública de TIC; su Capítulo 9 (contenido web) **referencia directamente los
criterios de éxito de WCAG 2.1 Nivel A y AA** (no reinventa criterios propios para web). Desde el
28 de junio de 2025 es exigible bajo la **European Accessibility Act (EAA)** también para empresas
privadas que venden a consumidores europeos, no solo para sector público — cumplir EN 301 549 da
"presunción de conformidad" con la EAA.

**Traducción a requisito**: para SkillNet (u otro consumidor que venda a empresas/administraciones
en la UE), la accesibilidad no es "buena práctica" sino **requisito de venta legal desde 2025**.
Esto refuerza RF-12..RF-14 y RF-17 (a11y automatizada en CI) como requisitos de **primera clase**,
no aspiracionales — con una fecha límite legal real detrás, no solo una preferencia de producto.
**Nota de fiabilidad**: la versión exacta de WCAG referenciada por EN 301 549 (2.1 según las
fuentes secundarias consultadas) es **anterior** a WCAG 2.2, que es la versión de la que proviene
2.5.7 (Dragging Movements). Esto significa que 2.5.7 **podría no estar aún incorporado
literalmente** en la versión de EN 301 549 vigente citada por estas fuentes — no se verificó
directamente contra el texto de EN 301 549 (bloqueado por 403), así que esto se marca como **no
verificado / no está claro** y debería confirmarse antes de usarlo como argumento legal exacto en
una venta.

### Recomendación Bloque 4

Tratar el cumplimiento de WCAG 2.2 (incluido 2.5.7) como requisito de diseño no negociable para
RF-3, e implementar explícitamente el patrón "seleccionar origen → seleccionar destino" como
alternativa de un solo puntero además del soporte de teclado que ya provee dnd-kit — no dar por
cumplido 2.5.7 solo por tener teclado. Añadir a `design.md` una referencia explícita a EN 301 549 /
EAA como motivación de negocio (no solo ética) para RF-12–RF-17, pero verificar en una investigación
de seguimiento qué versión exacta de WCAG incorpora la revisión vigente de EN 301 549 antes de
usarlo como argumento de cumplimiento legal preciso frente a un cliente.
