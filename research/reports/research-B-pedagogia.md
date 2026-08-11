# Investigación Fase 1 — Bloque B (Pedagogía): Preguntas 4, 5 y 6

> Alcance: `requirements.md` §6, preguntas 4, 5, 6. NO cubre preguntas 1-3, 7, 8 (fuera de este
> encargo). Fecha de la investigación: 2026-08-11.

---

## Pregunta 4 — Repetición espaciada: SM-2 vs FSRS (vs Leitner), coste de implementación, API agnóstica

### Evidencia

**SM-2 (SuperMemo 2)**
- Origen: Piotr Wozniak, usado desde SuperMemo 1.0 (1987), publicado abiertamente en su tesis de
  máster "Optimization of Learning" (1990). Sigue siendo la base de Anki (pre-FSRS), Quizlet,
  Mnemosyne y muchas apps.
  - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 (paper original)
  - https://www.supermemo.guru/wiki/Algorithm_SM-2
  - https://en.wikipedia.org/wiki/SM-2_(algorithm)
- **Estado por tarjeta**: `n` (nº de repeticiones correctas consecutivas), `EF` (easiness factor,
  inicial 2.5), `I` (intervalo en días).
- **Fórmulas exactas** (confirmadas en Wikipedia + supermemo.guru, consistentes entre sí):
  - Input de la review: `q` (calidad de respuesta, 0–5: 5=perfecta, 4=correcta con duda,
    3=correcta con dificultad seria, 2/1/0=incorrecta en distintos grados).
  - `EF ← EF + (0.1 − (5−q) × (0.08 + (5−q) × 0.02))`, con suelo `EF = max(EF, 1.3)`.
  - Si `q ≥ 3` (acierto): `n=0→I=1`; `n=1→I=6`; `n>1→I=round(I×EF)`; luego `n←n+1`.
  - Si `q < 3` (fallo): `n←0`, `I←1` (se reinicia el aprendizaje de esa tarjeta).
- **Coste de implementación**: es aritmética pura, sin estado oculto ni matrices. Una
  implementación completa (constantes, clamps, tipos) cabe en **~40-60 líneas de TypeScript**,
  cero dependencias. Es el algoritmo más citado como "trivial de reimplementar" en tutoriales
  (p. ej. https://dev.to/umangsinha12/how-spaced-repetition-actually-works-the-sm-2-algorithm-1ge3,
  https://github.com/thyagoluciano/sm2 — implementación de referencia en <100 líneas).
- **Limitación conocida**: EF por tarjeta es un modelo muy simple (una sola "facilidad" global);
  no distingue "dificultad intrínseca" de "estabilidad de memoria", y el intervalo crece de forma
  determinista con `EF^n`, lo que en la práctica sobreestima el olvido para tarjetas fáciles y
  subestima para tarjetas difíciles (motivo por el que Anki migró a FSRS).

**FSRS (Free Spaced Repetition Scheduler)**
- Origen: proyecto open-source (open-spaced-repetition), con papers en ACM KDD / IEEE TKDE.
  Es el algoritmo por defecto de Anki desde 2023 (v3 scheduler), sustituyendo a SM-2.
  - https://github.com/open-spaced-repetition/fsrs4anki
  - https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm (y su sucesor
    https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm)
  - https://expertium.github.io/Algorithm.html (explicación técnica detallada, mantenida por el
    propio equipo)
  - https://borretti.me/article/implementing-fsrs-in-100-lines (implementación independiente,
    confirma que el núcleo del algoritmo es compacto)
  - https://domenic.me/fsrs/ (análisis independiente de por qué es mejor que SM-2)
- **Modelo DSR** (Difficulty, Stability, Retrievability): en vez de un único EF, cada tarjeta
  tiene:
  - `S` (stability): días hasta que la probabilidad de recuerdo cae al 90%.
  - `D` (difficulty): 1–10, dificultad intrínseca de la tarjeta.
  - `R(t,s)` (retrievability): probabilidad de recuerdo en el instante `t`, función de `s`.
    Fórmula (v4.5–v6): `R(t,s) = (1 + factor · t/s)^decay`.
- **Parámetros**: un vector de pesos `w` aprendido por optimización sobre historial de reviews
  reales — 19 pesos en FSRS-4.5/v6, ampliado a 35 en v7 (arquitectura de doble curva de olvido).
  Anki trae pesos por defecto razonables sin que el consumidor tenga que entrenar nada; el
  "optimizer" (ajuste de pesos al historial de un usuario) es **opcional y separado** del
  scheduler.
- **Coste de implementación**: el *scheduler* (aplicar los pesos por defecto para calcular
  D/S/R y el próximo intervalo) es tratable en TypeScript puro — la librería de referencia
  `ts-fsrs` (https://github.com/open-spaced-repetition/ts-fsrs,
  https://www.npmjs.com/package/ts-fsrs) implementa todo el scheduler sin dependencias runtime
  pesadas (paquete pequeño, soporta ESM/CJS/UMD, Node ≥20). El artículo
  "Implementing FSRS in 100 Lines" confirma que el *scheduler* puro (sin el optimizador de
  parámetros) es de una complejidad similar a un ejercicio de una tarde, del orden de 100-200
  líneas con las constantes de los 19 pesos por defecto incluidas. El **optimizador** (reentrenar
  los 19-35 pesos con ML sobre miles de reviews) es sustancialmente más caro y NO es necesario
  para un MVP — se puede usar el vector de pesos por defecto de Anki indefinidamente.
- API de `ts-fsrs` (confirmado en README/docs): `createEmptyCard()` crea el estado inicial;
  `fsrs(params)` crea un scheduler; `next(card, now, rating)` devuelve `{ card, log }` con el
  nuevo estado y metadatos; `repeat(card, now)` da un preview de las 4 valoraciones posibles sin
  aplicar cambios. **La librería no persiste nada**: la persistencia es responsabilidad explícita
  de quien la usa — exactamente el contrato que pide RF-2.

**Leitner (caja de tarjetas)**
- Origen: Sebastian Leitner, 1972. https://en.wikipedia.org/wiki/Leitner_system,
  https://supermemo.guru/wiki/Leitner_system
- Modelo: N cajas con intervalos crecientes fijos; acierto → sube de caja; fallo → vuelve a la
  caja 1 (o baja una caja en variantes suaves).
- **Coste de implementación**: trivial, <20 líneas — es una máquina de estados finita sobre un
  entero (número de caja) y una tabla de intervalos fija.
- **Limitación**: mucho más burdo que SM-2/FSRS (no modela dificultad por tarjeta más allá de la
  caja actual, intervalos fijos no personalizados). Útil como opción "modo simple" o para casos
  donde no interesa afinar (p. ej. una demo de Storybook), no como algoritmo principal.

### Comparación de coste (resumen)

| Algoritmo | Estado por tarjeta | Líneas TS aprox. (solo scheduler) | Dependencia externa necesaria | Calidad del modelo |
|---|---|---|---|---|
| Leitner | 1 entero (caja) | <20 | Ninguna | Baja pero robusta y transparente |
| SM-2 | `n`, `EF`, `I` | 40-60 | Ninguna | Media, probado en producción 35+ años |
| FSRS (solo scheduler, pesos por defecto) | `S`, `D`, `reps`, `lapses`, `state`, fechas | 100-250 | Ninguna (ts-fsrs es MIT, puro TS, pero también se puede reimplementar el subconjunto necesario) | Alta — outperforma a SM-2 de forma medida por el propio equipo de Anki en benchmarks públicos |

No hay coste "pesado" en ninguno de los tres si el objetivo es solo el *scheduler* (aplicar
pesos ya calibrados). El coste pesado —y evitable— es el *optimizador* de FSRS (entrenar pesos
por usuario), que no hace falta para cumplir RF-2.

### Diseño de API agnóstica de persistencia (propuesta, alto nivel)

Contrato único, independiente del algoritmo elegido internamente:

```ts
// El estado es opaco al consumidor: se guarda y se devuelve tal cual, en su BD/localStorage/lo que sea.
type ReviewState = Record<string, unknown>; // forma concreta depende del algoritmo (SM2State | FSRSState | LeitnerState)

type ReviewGrade = "again" | "hard" | "good" | "easy"; // o 0-5 si se expone la escala nativa de SM-2

interface ReviewResult {
  state: ReviewState;   // nuevo estado de ESA tarjeta — el consumidor lo persiste donde quiera
  dueAt: Date;           // próxima fecha de repaso
}

interface SpacedRepetitionScheduler {
  createInitialState(): ReviewState;
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult;
  // opcional, útil para UI de "preview de las 4 opciones antes de que el usuario elija":
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
```

Puntos de diseño clave (derivados directamente de cómo ya lo resuelve `ts-fsrs`, que es el
único de los tres con una librería de referencia madura):
- **Pure function**: `schedule()` no tiene efectos secundarios, no llama a red ni a storage. Esto
  es exactamente el requisito de RF-2 ("recibe/devuelve estado, no lo persiste").
- El **mazo** (`SpacedRepetitionDeck`, RF-2) es una capa por encima: mantiene una lista de
  `{ cardId, state }`, decide qué tarjeta mostrar según `dueAt`, y delega en el scheduler para
  actualizar el estado tras cada review. El mazo tampoco persiste — expone `getNextCard()` y
  `recordReview(cardId, grade)` que devuelven el nuevo array de estados; el consumidor decide
  dónde vive ese array.
- El **algoritmo concreto es intercambiable** detrás de esta interfaz: se puede publicar
  `createSM2Scheduler()`, `createFSRSScheduler()` y `createLeitnerScheduler()` como 3
  implementaciones intercambiables del mismo contrato — coherente con el modelo copy-paste de la
  librería (el consumidor copia solo el archivo del algoritmo que quiera).

### Recomendación

**Implementar SM-2 primero** (coste mínimo, cero dependencias, ~50 líneas, evidencia de 35+ años
de uso en producción) como algoritmo por defecto del componente `SpacedRepetitionDeck`, y
**dejar FSRS como alternativa de "modo avanzado" instalable aparte** (mismo contrato de API),
recomendando reimplementar únicamente el *scheduler* de FSRS con los pesos por defecto de Anki
(no el optimizador) si el proyecto quiere mejor precisión — apoyándose en `ts-fsrs`
(MIT, sin dependencias runtime pesadas) como referencia de implementación a copiar/adaptar, no
como dependencia npm versionada (coherente con RF-15). **No usar Leitner como algoritmo
principal**: resérvese como posible variante "modo simple" opcional, dado que su modelo es
demasiado burdo para ser el default de una librería que se anuncia como pedagógicamente seria.
En cualquier caso, el componente debe exponerse tras la interfaz agnóstica descrita arriba para
que cambiar de algoritmo no rompa a los consumidores.

---

## Pregunta 5 — Accesibilidad y neurodiversidad: patrones con evidencia real

> Metodología: para cada patrón se indica la fuente, y se distingue explícitamente **"normativo
> (WCAG, criterio de éxito con nivel A/AA/AAA)"**, **"consenso de experto/investigación
> informada pero no un estudio controlado aislado" (COGA, CAST/UDL)**, o **"guía de estilo
> práctica sin cita de estudio primario" (BDA)**. Ninguna de las tres categorías es "inventada",
> pero tienen distinto peso probatorio — se marca así explícitamente donde la fuente misma lo
> reconoce.

### 5.1 WCAG 2.2 (normativo, la evidencia más fuerte disponible)

Fuente: https://www.w3.org/TR/WCAG22/

| Criterio | Nivel | Qué exige | Traducción a requisito de componente |
|---|---|---|---|
| **2.3.1 Three Flashes or Below Threshold** | A | Nada debe destellar >3 veces/segundo por encima de umbrales de seguridad (riesgo de crisis fotosensibles) | Ninguna animación de "celebración"/feedback puede parpadear; test manual/automatizado de frecuencia si se usan efectos de flash |
| **2.3.3 Animation from Interactions** | AAA (pero recomendado tratarlo como base, no solo AAA) | Animación disparada por interacción del usuario debe poder desactivarse salvo que sea esencial para la información | Todo micro-animación de UI (voltear `Flashcard`, transición de `Timeline`, confetti de acierto) debe respetar `prefers-reduced-motion` (RF-13 ya lo exige) y, si es posible, ofrecer un toggle explícito además del media query del SO |
| **2.2.1 Timing Adjustable** | A | Todo límite de tiempo debe poder desactivarse, ampliarse (≥10x) o avisar con ≥20s para extenderlo — salvo excepciones (evento en tiempo real, esencial, o >20h) | Si algún ejercicio de quiz o `SpacedRepetitionDeck` impone un cronómetro, DEBE ser opcional/configurable — esto fundamenta directamente RF-14 ("límites de tiempo no configurables" como antipatrón) |
| **2.2.2 Pause, Stop, Hide** | A | Contenido en movimiento/parpadeante/auto-actualizado (>5s) necesita control de pausa/parada/ocultación | Cualquier carrusel de progreso, contador animado o vídeo con autoplay necesita controles de pausa visibles |
| **2.4.7 Focus Visible** | AA | El indicador de foco de teclado debe ser visible en todo momento | Todos los componentes interactivos (opciones de quiz, tarjetas de emparejar, botones de `Hint`) deben mantener un `:focus-visible` con contraste suficiente, nunca `outline: none` sin sustituto |
| **2.4.11 Focus Not Obscured (Minimum)** | AA (nuevo en 2.2) | El elemento con foco no puede quedar total mente oculto por overlays/sticky headers propios del autor | Relevante para `Glossary`/tooltips: al navegar por teclado a un término con popover, el popover no puede tapar el elemento enfocado |
| **1.4.3 Contrast (Minimum)** | AA | Texto: contraste ≥4.5:1 (≥3:1 para texto grande) | Tema neutro por defecto (RF-16) debe fijar tokens de color que cumplan esto por defecto, y documentarlo como contrato para quien re-tematice |
| **1.4.11 Non-text Contrast** | AA | Componentes de UI y gráficos informativos: contraste ≥3:1 frente al fondo adyacente | Bordes de tarjetas, iconos de estado (correcto/incorrecto), barras de progreso — no solo texto |

**Recomendación específica**: tratar 2.3.3 (AAA) como requisito de producto aunque formalmente
sea AAA, porque RF-13 ya lo pide vía `prefers-reduced-motion`; y usar 2.2.1/2.2.2 como
fundamento normativo directo de RF-14.

### 5.2 CAST / UDL (Universal Design for Learning) — marco pedagógico, no checklist técnica

Fuente: https://udlguidelines.cast.org/, versión 3.0 (2024).
https://avidopenaccess.org/resource/cast-releases-universal-design-for-learning-guidelines-3-0/

- Framing explícito de CAST: es un **framework basado en investigación de neurociencia
  ("brain science")** sobre 3 redes cerebrales (afectiva, de reconocimiento, estratégica), no
  una lista de criterios verificables como WCAG. **Categoría de evidencia: investigación
  informada / consenso académico**, no un checklist con umbrales medibles.
- 3 principios → 9 guidelines → 35 "considerations": Engagement (el *por qué* de aprender),
  Representation (el *qué*), Action & Expression (el *cómo*).
- Traducción a requisito de componente (interpretación nuestra, no literal de CAST):
  - **Representation** → cada concepto debe poder presentarse en más de un formato: esto
    justifica que `Glossary`/`Term`, `Hint`, y quiz de "respuesta abierta corta" ofrezcan tanto
    texto como (cuando aplique) alternativas visuales/de audio, no un único canal obligatorio.
  - **Action & Expression** → los ejercicios de "emparejar/arrastrar" (RF-3) deben ofrecer una vía
    de interacción alternativa al arrastre de ratón (teclado, selección por clic) — esto es
    además un requisito de accesibilidad motriz que UDL enmarca como principio general de "medios
    múltiples de acción".
  - **Engagement** → los indicadores de progreso/mastery (RF-7) y el `Hint`/`Reveal` (RF-6) deben
    dar control al alumno sobre el ritmo y la dificultad percibida, no solo mostrar una métrica.

### 5.3 British Dyslexia Association (BDA) — guía de estilo práctica

Fuente: BDA Dyslexia Style Guide (versión 2023,
https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf,
y copias espejo consistentes entre sí:
https://princessescanwearkickers.com/wp-content/uploads/2021/06/Dyslexia-style-guide.pdf,
resumen en https://medium.com/@evelyn.brokering/dyslexia-friendly-style-guide-revised-and-updated-84c7f5ca6354).

**Nota de categoría de evidencia**: la BDA presenta esto como **guía de estilo práctica /
consenso profesional acumulado** (producida por una organización especializada, usada
ampliamente en el sector educativo británico), **no como resultados de un ensayo controlado
aleatorizado citado línea por línea**. Se recoge aquí como "práctica común con respaldo
institucional fuerte pero no como evidencia experimental dura" — la propia búsqueda no encontró
que la guía cite estudios primarios punto por punto; es la síntesis de una organización experta,
que es un nivel de evidencia real pero distinto al de un paper revisado por pares.

Recomendaciones concretas → requisito de componente:
- **Tipografía**: sans-serif (Arial, Verdana, Tahoma, Century Gothic, Trebuchet, Calibri, Open
  Sans), tamaño 12-14pt mínimo, opción de aumentar. → El tema neutro (RF-16) debe fijar una
  familia sans-serif por defecto y exponer tamaño de fuente como token ajustable, nunca en `px`
  fijo sin unidad relativa.
- **Interlineado y longitud de línea**: evitar líneas largas, 60-70 caracteres por línea; sin
  justificación (alineación izquierda). → Componentes de texto largo (`Rubric`, enunciados de
  quiz de respuesta abierta) deben limitar `max-width` de línea de texto, no justificar texto.
- **Evitar cursiva y subrayado** salvo para enlaces; usar negrita para énfasis; encabezados ≥20%
  más grandes que el texto base. → Ningún componente debe usar `<em>`/`italic` como único medio
  de destacar una respuesta correcta/incorrecta (esto también conecta con RF-12, "no depender
  solo de color").
- **Color**: evitar fondos blancos deslumbrantes (preferir crema/pastel suave), evitar
  combinaciones verde/rojo puras (también se solapa con daltonismo). → Tokens de color del tema
  neutro no deben depender de rojo/verde puro para éxito/error; debe acompañarse siempre de icono
  o texto (de nuevo, refuerza RF-12).
- **Estructura**: bloques cortos, viñetas y numeración en vez de prosa continua, tabla de
  contenidos en documentos largos. → `Timeline`/`Steps` (RF-8) y `Rubric` (RF-10) encajan
  directamente con esta recomendación por diseño; reforzarlo como principio general para
  cualquier bloque de texto largo dentro de un ejercicio.

### 5.4 W3C WAI-COGA (Cognitive and Learning Disabilities Accessibility Task Force)

Fuentes:
- Documento normativo-adyacente (no WCAG, pero W3C): "Making Content Usable for People with
  Cognitive and Learning Disabilities" — https://www.w3.org/TR/coga-usable/
- Técnicas: https://w3c.github.io/coga/techniques/index.html
- Overview/objetivos: https://www.w3.org/WAI/news/2022-03-31/new-format-coga-patterns/

**Nota de categoría de evidencia — importante, y el propio documento lo dice explícitamente**:
COGA se autodefine como **"guía suplementaria" a WCAG 2.2, no de conformidad obligatoria**. Cubre
explícitamente TDAH, autismo, dislexia, discalculia, dispraxia, deterioro cognitivo leve. Es
**consenso de un grupo de trabajo del W3C con investigación de usuarios citada en su
introducción** (personas basadas en investigación de usuarios reales), pero no un ensayo
controlado por patrón individual — cada patrón concreto es "práctica recomendada informada por
investigación", no "resultado experimental aislado".

Patrones relevantes con traducción directa a requisito (todos con target de usuario explícito
en el propio documento):
- **"Avoid Data Loss and Timeouts" (§4.5.9)** — objetivo: memoria/función ejecutiva. → Refuerza
  RF-14: si un ejercicio tiene temporizador, debe persistir progreso y avisar antes de expirar.
- **"Let Users Control When Content Moves or Changes" (§4.9.1)** — objetivo explícito: TDAH,
  déficit de atención. → Fundamenta directamente la parte de RF-14 sobre "animación no
  solicitada": autoplay de vídeo con checkpoint (RF-9), carrusels de progreso, o animaciones de
  celebración deben iniciarse solo por acción del usuario o ser pausables.
- **"Use White Spacing" (§4.4.10)** y **"Avoid Too Much Content" (§4.6.3)** — objetivo: dislexia,
  memoria, sobrecarga de atención. → Fundamenta la parte de RF-14 sobre "densidad visual alta":
  quiz de opción múltiple no debe mostrar más de ~5-7 opciones simultáneas sin agrupar/paginar;
  `Glossary` no debe listar todos los términos a la vez sin filtro/búsqueda.
- **"Use a Consistent Visual Design" (§4.2.3)** — objetivo: deterioro cognitivo, discapacidad de
  aprendizaje. → El sistema de theming (RF-16) debe garantizar que el mismo tipo de componente
  (p. ej. todos los `QuizItem`) mantenga la misma disposición de controles entre variantes.
- **"Design Forms to Prevent Mistakes" (§4.5.4)** y **"Make it Easy to Undo Form Errors"
  (§4.5.5)** — objetivo: función ejecutiva, atención. → Relevante para ejercicios de
  arrastrar/emparejar (RF-3): debe poder deshacerse una asignación errónea sin penalización
  antes de "enviar" la respuesta.

### 5.5 Lo que NO tiene evidencia sólida específica (decirlo explícitamente, no inventar)

- No se encontró una guía con el mismo nivel de especificidad de la BDA (tipografía exacta,
  caracteres por línea) dedicada específicamente a **TDAH** o **autismo** por separado — la
  literatura de mayor autoridad (COGA) los trata como parte del paraguas más amplio de
  discapacidad cognitiva, con patrones compartidos (control de tiempo, densidad, animación,
  consistencia) en vez de reglas tipográficas propias por condición. **Conclusión honesta**: no
  está claro que existan reglas de fuente/tamaño específicas para TDAH o autismo con el mismo
  respaldo que las de dislexia; lo que hay es una superposición fuerte con los principios
  generales de COGA (menos distracción, más previsibilidad, control del usuario sobre el
  movimiento). Lo que faltaría para cerrar esto: estudios controlados que aíslen TDAH/autismo de
  dislexia y midan comprensión/tiempo de tarea con variaciones tipográficas específicas — no se
  encontraron en esta búsqueda.
- La eficacia de fuentes "para dislexia" marcadas comercialmente (tipo OpenDyslexic) es
  contestada en la literatura — no se investigó en profundidad en este encargo porque no estaba
  en las fuentes pedidas (BDA no las menciona como requisito, solo recomienda sans-serif
  genéricas), así que no se afirma nada sobre ellas más allá de que la BDA no las exige.

### Recomendación (Pregunta 5)

Adoptar como **contrato mínimo no negociable** del núcleo (ya reflejado en RF-12/13/14, pero
con criterios concretos ahora trazables a fuente):
1. Cumplir WCAG 2.2 AA completo (incluye 2.4.7, 2.4.11, 1.4.3, 1.4.11, 2.2.1, 2.2.2) y tratar
   2.3.3 (AAA) como si fuera AA obligatorio dado que ya está en RF-13.
2. Ningún componente con temporizador sin opción de desactivar/extender (fundamento: WCAG 2.2.1 +
   COGA §4.5.9).
3. Ninguna animación/autoplay iniciada sin acción del usuario, y toda animación respeta
   `prefers-reduced-motion` (fundamento: WCAG 2.3.3 + COGA §4.9.1).
4. Límite de densidad visual por defecto en componentes de opción (máx. ~5-7 opciones visibles
   sin agrupar) (fundamento: COGA §4.4.10/§4.6.3).
5. Tema neutro con sans-serif, tamaño de fuente relativo y ajustable, sin depender de rojo/verde
   puro para estado, sin cursiva/subrayado como único énfasis (fundamento: BDA style guide,
   reforzado por WCAG 1.4.1 no-color-alone que ya está implícito en RF-12).
Documentar en el propio Storybook, junto a cada componente, qué criterio WCAG/COGA/BDA concreto
cumple — no como afirmación genérica de "accesible", sino trazado a la fuente, dado que design.md
§9 identifica explícitamente el riesgo de "accesibilidad de intención buena pero sin evidencia".

---

## Pregunta 6 — Estándares/librerías de e-learning: vocabulario e interoperabilidad de referencia

### H5P

- Qué es: framework open-source de contenido interactivo embebible, con >50 tipos de contenido
  ("content types"), arquitectura modular de "libraries" con dependencias entre sí.
  https://h5p.org/content-types-and-applications,
  https://h5p.org/documentation/installation/content-type-accessibility
- Vocabulario de referencia relevante para nuestro §4.1: `Flashcards`, `Dialog Cards`,
  `Drag and Drop`, `Drag the Words`, `Fill in the Blanks`, `Mark the Words`, `Find the Hotspot`,
  `Image Pairing`/`Image Sequencing`, `Multiple Choice`, `True/False Question`,
  `Single Choice Set`, `Essay` (respuesta abierta con verificación asistida), `Quiz (Question
  Set)`, `Timeline`, `Interactive Video` (relevante directamente para RF-9, checkpoint sobre
  vídeo). Esto valida casi 1:1 el inventario de RF-1 a RF-9: H5P ya tiene un tipo equivalente a
  cada uno salvo `Rubric` explícito y ejercicio de código.
- Interoperabilidad real: H5P se integra vía LTI con Canvas, Brightspace, Blackboard y "muchos
  VLE que soportan LTI" — es decir, su interoperabilidad de facto **depende de LTI**, no es un
  estándar de intercambio independiente. Fuente:
  https://h5p.org/content-types-and-applications, https://docs.moodle.org/502/en/H5P_content_types_format
  (Moodle importa directamente algunos tipos de pregunta H5P como formato nativo).
- Conclusión: **útil como referencia de nombres/comportamientos de ejercicio** (validación
  cruzada de nuestro inventario §4.1), no aporta un mecanismo de interoperabilidad propio más
  allá de apoyarse en LTI.

### Open edX XBlocks

- Qué es: arquitectura de componentes para Open edX — cada bloque de curso (vídeo, problema,
  secuencia) es un XBlock que mantiene estado, se renderiza vía "views" y procesa acciones vía
  "handlers". https://openedx.org/faq/what-is-an-xblock-in-the-open-edx-platform/,
  https://docs.openedx.org/projects/xblock/en/latest/index.html,
  https://github.com/openedx/XBlock
- Vocabulario de referencia: no define un vocabulario de *tipos de pregunta* per se (eso lo
  cubre más bien QTI/H5P); define un **patrón arquitectónico de composición de componentes
  educativos con estado + vista + acción** — relevante como inspiración de diseño de API para
  nuestros propios componentes con estado (aunque no para el vocabulario de ejercicios).
- Interoperabilidad: **acoplada a la plataforma Open edX**, no es un estándar independiente
  transportable a cualquier LMS (a diferencia de LTI/QTI/SCORM/xAPI). No aporta interoperabilidad
  cross-plataforma real para nuestro caso.
- Conclusión: útil solo como **referencia de patrón arquitectónico** (separar estado/vista/acción
  por componente), no como vocabulario de ejercicios ni como interoperabilidad a adoptar.

### IMS QTI (Question & Test Interoperability), ahora bajo 1EdTech

- Qué es: modelo de datos XML para representar preguntas (`qti-assessment-item`) y tests
  (`qti-assessment-test`), con versiones 1.2, 2.x, 3.0.
  https://www.imsglobal.org/spec/qti/v3p0/oview,
  https://www.imsglobal.org/spec/qti/v3p0/info/, https://en.wikipedia.org/wiki/QTI
- **Vocabulario de tipos de interacción/pregunta** (QTI 3.0, lista confirmada del information
  model): `choiceInteraction` (opción múltiple simple/múltiple — cubre RF-4 multi-respuesta y V/F
  como caso particular), `orderInteraction` (ordenar secuencia — cubre parte de RF-3),
  `associateInteraction` / `matchInteraction` (emparejar — cubre RF-3 matching),
  `gapMatchInteraction` (rellenar huecos arrastrando opciones — cubre RF-4 hueco),
  `inlineChoiceInteraction` (dropdown embebido en texto), `textEntryInteraction` /
  `extendedTextInteraction` (respuesta corta/larga — cubre RF-4 abierta corta),
  `hotTextInteraction`, `hotspotInteraction` / `graphicOrderInteraction` /
  `graphicAssociateInteraction` / `graphicGapMatchInteraction` / `selectPointInteraction` /
  `positionObjectInteraction` (interacciones sobre imagen), `sliderInteraction`,
  `mediaInteraction`, `drawingInteraction`, `uploadInteraction`, `customInteraction` /
  `PCI` (Portable Custom Interaction / Technology-Enhanced Item, para tipos no estándar —
  relevante como precedente de cómo extender un vocabulario cerrado sin romperlo).
- Esto es, con diferencia, **el vocabulario más completo y más directamente comparable a
  nuestro §4.1** de todos los estándares revisados: prácticamente cada RF-3/RF-4 tiene un
  equivalente nombrado en QTI, con 20+ años de uso en bancos de preguntas reales.
- Interoperabilidad real: QTI exige un binding XML para certificación e interoperabilidad entre
  "herramientas de autoría, bancos de ítems, sistemas de entrega de test". Es el estándar de
  interoperabilidad real más consolidado para *evaluación específicamente* (a diferencia de LTI,
  que es para *lanzar herramientas*, o SCORM/xAPI, que son para *trackear finalización/progreso*).
- Conclusión: **adoptar su vocabulario de nombres de interacción como referencia de naming para
  nuestras variantes de quiz (RF-4) y ejercicios de emparejar/ordenar (RF-3)**, sin implementar
  el binding XML (no aporta valor a una librería de componentes React copy-paste, solo a
  sistemas de intercambio de bancos de preguntas entre LMS).

### IMS/1EdTech LTI (Learning Tools Interoperability)

- Qué es: estándar para que un LMS lance una herramienta externa de forma segura y con contexto
  de usuario/curso compartido. Versión actual 1.3 (OAuth2 + OpenID Connect + JWT), con
  "LTI Advantage" añadiendo grading/deep linking/names&roles.
  https://www.1edtech.org/standards/lti, https://en.wikipedia.org/wiki/Learning_Tools_Interoperability,
  https://standards.1edtech.org/lti/guides/implementation_guide/implementation-guide
- Vocabulario de ejercicios: **ninguno** — LTI no define tipos de pregunta, define cómo se
  autentica y lanza una herramienta y cómo se devuelve una nota.
- Interoperabilidad real: alta, y es la vía por la que H5P (y muchos otros) logran interoperar
  con LMS reales (Canvas, Moodle, Blackboard, Brightspace). **Relevante solo si algún día la
  librería —o el adaptador SkillNet— necesitara lanzarse embebida dentro de un LMS de terceros**;
  no aporta nada al vocabulario de componentes en sí.
- Conclusión: fuera del alcance útil de esta investigación salvo como nota: si en el futuro
  SkillNet (u otro consumidor) necesitara integrarse como herramienta LTI dentro de un LMS
  externo, LTI 1.3 sería el estándar a implementar — pero eso es una decisión de producto futura,
  no algo que condicione el diseño de los componentes del núcleo.

### xAPI (Experience API / Tin Can)

- Qué es: sucesor conceptual de SCORM, formato de "statements" (`actor-verb-object`, ej.
  "Ana completó la Lección 3") que se envían a un Learning Record Store (LRS), pudiendo trackear
  experiencias dentro y fuera del LMS (offline, móvil, simulaciones).
  https://www.teachfloor.com/elearning-glossary/xapi,
  https://elmlearning.com/blog/scorm-vs-tin-can-xapi-vs-aicc-whats-the-difference/
- Vocabulario de ejercicios: no define tipos de pregunta; define un **vocabulario de eventos de
  aprendizaje** (verbos como "completed", "answered", "attempted", "mastered"). Esto es
  **relevante como referencia de nombres de eventos** para el diseño de callbacks/telemetría de
  nuestros componentes (p. ej. `onMastered`, `onAttempted` podrían alinearse conceptualmente con
  verbos xAPI, facilitando que un consumidor futuro traduzca nuestros eventos a xAPI si quiere
  mandar datos a un LRS) — pero no es una dependencia a integrar en el núcleo, que
  explícitamente no gestiona persistencia/backend (§2 "Fuera de alcance").
- Conclusión: **vocabulario de eventos como inspiración de naming de callbacks**, no como
  interoperabilidad a implementar (la propia spec del proyecto excluye backend/persistencia).

### SCORM

- Qué es: estándar de empaquetado + API runtime (`LMSInitialize`, `LMSGetValue`, `LMSSetValue`,
  `LMSCommit`, `LMSFinish`) para que un LMS trackee finalización/puntuación de un paquete de
  contenido. Versiones 1.2 y 2004 con modelos de datos algo distintos.
  https://scorm.com/scorm-explained/technical-scorm/run-time/,
  https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
- Vocabulario de ejercicios: ninguno propio — SCORM trackea *resultado* (completado/puntuación),
  no define tipos de interacción.
  "SCORM tracks courses, xAPI tracks experiences" (resumen de la comparación en la fuente citada
  arriba) sigue siendo la síntesis más precisa encontrada.
- Interoperabilidad real: sigue siendo, según las fuentes consultadas, "la especificación más
  usada globalmente para e-learning", pero está limitado a contenido empaquetado dentro de un
  LMS (no offline, no multi-dispositivo nativo como xAPI).
- Conclusión: **sin relevancia para el vocabulario de componentes** de esta librería (no
  gestionamos empaquetado ni tracking de LMS); mencionarlo solo como estándar legado que un
  consumidor podría necesitar en su propia capa de integración, fuera del núcleo.

### Recomendación (Pregunta 6)

1. **Adoptar el vocabulario de nombres de interacción de IMS QTI 3.0** como referencia principal
   para nombrar/diseñar las variantes de RF-3 (matching/sort/categorize) y RF-4 (quiz
   multi-respuesta/V-F/hueco/abierta corta) — es, con diferencia, el estándar con mayor
   granularidad y trayectoria (20+ años) en exactamente ese vocabulario.
2. **Usar el catálogo de content types de H5P como checklist de validación cruzada** del
   inventario §4.1 — si H5P ya resolvió un patrón de interacción equivalente, es señal de que el
   diseño de ese componente tiene precedente de uso real a gran escala; no adoptar H5P como
   dependencia ni formato de intercambio.
3. **No implementar LTI, SCORM ni el binding XML de QTI en el núcleo** — ninguno aporta valor a
   una librería de componentes React copy-paste sin backend; son estándares de *integración con
   LMS*, y la librería explícitamente no gestiona backend/persistencia (`requirements.md` §2).
   Si el adaptador SkillNet (o un consumidor futuro) necesitara embeberse en un LMS de terceros o
   reportar progreso a un LRS, LTI 1.3 y xAPI serían los estándares candidatos — pero eso vive
   fuera del núcleo, como decisión de ese consumidor.
4. **Tomar prestado el vocabulario de verbos de xAPI únicamente como inspiración de naming de
   callbacks/eventos** de los componentes (ej. `onAttempted`, `onMastered`), sin implementar xAPI
   en sí.
5. **Descartar Open edX XBlocks y SCORM como fuente de vocabulario de ejercicios** — no aportan
   nada a §4.1 (XBlocks es patrón arquitectónico de plataforma, SCORM es tracking de
   finalización), aunque el patrón "estado + vista + acción" de XBlock puede inspirar cómo se
   estructura internamente un componente con estado propio (nota de diseño, no de vocabulario).
