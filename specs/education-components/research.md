# Research — Librería de Componentes de Educación (Fase 1)

> Entregable de la **Fase 1 (deep research)** del `ROADMAP.md`. Responde con evidencia citada a
> las 8 preguntas abiertas de `requirements.md` §6 y alimenta las secciones `[PENDIENTE]` de
> `design.md`. NO decide arquitectura (eso es Fase 2) — recopila evidencia y emite una
> recomendación explícita por pregunta.
>
> **Estándar de honestidad (heredado de `openui-adoption.md` §1):** donde la evidencia no es
> concluyente se dice con esas palabras ("no verificado" / "no está claro, y esto es lo que
> faltaría medir"). Una respuesta inventada no es válida; un "no lo sé" fundamentado sí lo es.
>
> Fecha de investigación: 2026-08-11. Las versiones de paquetes npm se consultaron en vivo contra
> `registry.npmjs.org` ese día, no de memoria.
>
> **Método:** investigación delegada a 4 agentes en paralelo (A: preguntas 1-3, stack técnico;
> B: preguntas 4-6, pedagogía/estándares; C: preguntas 7-8, adaptador SkillNet, por lectura de
> `repo/`; D: lote complementario de fuentes aportadas por el dueño del producto). Este documento
> las consolida.

---

## Resumen ejecutivo — recomendaciones por pregunta

| # | Pregunta | Recomendación (resumen) | Confianza |
|---|---|---|---|
| 1 | Registry de terceros de shadcn | **Adoptar el CLI/esquema oficial de shadcn como mecanismo primario**; no construir CLI propio (solo plan B teórico) | Alta (doc oficial) |
| 2 | Base de primitivos + React 19 | **Radix UI por defecto** (alineación con shadcn), documentando la fricción de peer-dep con React 19 estable; **vigilar Base UI** como alternativa más limpia | Media (changelog + peer-deps, sin smoke test propio) |
| 3 | ¿Tailwind obligatorio? | **No exigir Tailwind en el núcleo**; base = CSS custom properties/clases planas (`cssVars`), Tailwind como variante opcional | Alta |
| 4 | Repetición espaciada | **SM-2 por defecto** (~50 líneas, cero deps) tras interfaz agnóstica; FSRS como modo avanzado — **con una tercera opción**: `ts-fsrs` como dependencia fijada (RNF-5) | Alta (algoritmo), Media (elección) |
| 5 | A11y y neurodiversidad | **WCAG 2.2 AA completo** como contrato mínimo, trazando cada patrón a fuente (WCAG/COGA/BDA); hueco de evidencia por condición señalado | Alta (WCAG), Media (neuro-específico) |
| 6 | Estándares e-learning | **Vocabulario de QTI 3.0 como referencia de naming** + H5P como checklist de validación; no implementar QTI/LTI/SCORM/xAPI en el núcleo | Alta |
| 7 | Componentes sin reactividad (adaptador) | **8 de 11 APTOS**, 1 apto-pero-bloqueado (vídeo), 2 no aptos (SpacedRepetition, código) | Alta (evidencia de código) |
| 8 | Reproductor de vídeo (adaptador) | **No existe hoy en `skillnet-web`**; evaluar desde cero, empezar por `<video>` nativo + `<track>` | Alta (búsqueda exhaustiva) |

**Hallazgos que exceden las 8 preguntas (ver §9):** el spec no cubre hoy (a) una dimensión de
**evidencia pedagógica** que reordena la prioridad del inventario, (b) una **familia entera de
interacciones gráficas/sobre imagen** que QTI sí tiene y §4.1 no, (c) un requisito de **feedback
informativo**, y (d) el ángulo **legal** de accesibilidad (EN 301 549 / European Accessibility
Act) que convierte RF-12–17 en requisito de venta, no aspiracional.

---

## Pregunta 1 — ¿El mecanismo de registry de terceros de shadcn/ui es real y maduro?

### Evidencia

El mecanismo existe, está documentado como producto de primera clase y es reciente (CLI 3.0
ago-2025, CLI v4 mar-2026), no un hack de la comunidad:

- El registry "funciona con cualquier tipo de proyecto y framework, no limitado a React" —
  https://ui.shadcn.com/docs/registry
- Guía dedicada para construir tu **propia** registry (no la oficial) —
  https://ui.shadcn.com/docs/registry/getting-started
- Esquema raíz `registry.json` (`$schema`, `name`, `homepage`, `items`/`include`) —
  https://ui.shadcn.com/docs/registry/registry-json
- Esquema de item `registry-item.json` (`name`, `type`, `files`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, `envVars`, …; `tailwind` marcado **deprecated** a
  favor de `cssVars.theme`) — https://ui.shadcn.com/docs/registry/registry-item-json
- **Hosting:** JSON estático (`shadcn build` → `public/r/*.json`) servible desde cualquier
  servidor HTTP, o un repo GitHub con `registry.json` en la raíz.
- **Instalación:** por URL directa (`shadcn add https://.../flashcard.json`) o por **namespace**
  configurado en `components.json` (`@anfaia/flashcard`). Modelo de namespaces descentralizado,
  sin autoridad central — https://ui.shadcn.com/docs/registry/namespace
- **Autenticación** nativa vía cabeceras HTTP + env vars (Bearer token, API key). No hay
  OAuth/OIDC ni discovery automático — https://ui.shadcn.com/docs/registry/authentication

**Huecos reales verificados:**
- **No existe campo `version`** en `registry-item.json` — no hay versionado nativo de un mismo
  componente; el versionado es responsabilidad de cómo la registry organiza sus rutas.
- **`shadcn diff` contra registries de terceros: NO verificado.** La doc (changelog CLI v4) lo
  documenta para la registry oficial, no confirma explícitamente que funcione con registries
  namespaced de terceros — https://ui.shadcn.com/docs/changelog/2026-03-cli-v4

### Recomendación

**Adoptar el CLI y esquema oficiales de shadcn como mecanismo primario de distribución.** El
riesgo del `design.md` §9 ("el mecanismo de terceros no soporta lo que necesitamos") **no se
confirma** — está pensado explícitamente para este caso de uso. Construir un CLI propio queda
como plan B teórico, no como trabajo a realizar. Llevar como riesgo activo (no bloqueo): diseñar
una convención de versionado propia desde el inicio, y probar empíricamente `shadcn diff` contra
una registry de prueba antes de documentarlo como mecanismo de actualización.

---

## Pregunta 2 — ¿Qué base de primitivos accesibles conviene para React 19?

### Evidencia

Metodología: `peerDependencies.react` **publicado hoy en npm** para la versión `latest` de cada
librería (lo que de verdad determina si `npm install` funciona sin flags), más changelogs.

| Librería | Paquete | `latest` hoy | `peerDependencies.react` |
|---|---|---|---|
| Radix UI | `@radix-ui/react-dialog` | 1.1.23 | `…^18.0.0 \|\| ^19.0.0-rc.1` (restringido a RC) |
| React Aria | `react-aria-components` | 1.20.0 | idéntico (restringido a RC) |
| Ariakit | `@ariakit/react` | 0.4.37 | `^17 \|\| ^18 \|\| ^19` (limpio) |
| Base UI | `@base-ui/react` (MUI) | 1.7.0 | `^17 \|\| ^18 \|\| ^19` (limpio) |

- Radix y React Aria estables **hoy** declaran el peer de React 19 anclado a `19.0.0-rc.1`, no a
  `^19.0.0` — con `npm` (no pnpm/yarn) hace falta `--legacy-peer-deps`/`--force`. Lo confirma la
  **propia doc de shadcn** — https://ui.shadcn.com/docs/react-19 — y issues de comunidad
  (`radix-ui/primitives#2909`). Radix ya tiene el fix en una v1.2.0 **en RC** (no promovida a
  `latest` aún al 2026-08-11), así que el problema sigue vigente hoy.
- Radix confirmó "Full React 19 compatibility" (PR #2952) y sigue arreglando bugs específicos de
  React 19 tan recientes como jul-2026 — https://www.radix-ui.com/primitives/docs/overview/releases
- React Aria resolvió su compat de React 19 (release 2025-05-19). La afirmación de que "nunca
  subirán el mínimo a React 19" proviene de agregación de terceros, **sin cita textual directa —
  marcado no confirmado al 100%**.
- Base UI (`@base-ui/react`, MUI): estable (no RC), peer-deps limpios; mismo equipo que ya migró
  MUI a React 19 — https://mui.com/blog/react-19-update/

**Sin verificar:** no se ejecutó un proyecto React 19 real con cada candidato (evidencia de
changelog + peer-dep, no smoke test propio). **Antes de fijar la capa 1 en `design.md`, ejecutar
un smoke test** (foco/portal/diálogo) en React 19 estable con cada finalista.

### Recomendación

**Radix UI como capa 1 por defecto**, por alineación con shadcn/ui (máxima reutilización de
patrones/ejemplos) — el problema de peer-dep es de instalación, no funcional, y se resuelve con
`--legacy-peer-deps` (que shadcn ya documenta) o pnpm/yarn. **Documentar explícitamente esa
fricción** en `design.md` como parte del contrato con el consumidor. **Vigilar Base UI** como
alternativa más limpia a 3-6 meses (cuando tenga más adopción). Evitar React Aria salvo para un
primitivo puntual que Radix no cubra, dado que comparte la fricción sin la ventaja de alineación.
RNF-5 exige fijar versión exacta + test de deriva de todos modos.

---

## Pregunta 3 — ¿Tailwind como peer dependency obligatoria?

### Evidencia

- **shadcn/ui mismo sí exige Tailwind**, sin vía oficial alternativa; es petición recurrente no
  resuelta (`shadcn-ui/ui#2832`). Soporta Tailwind v4 (`@theme`, OKLCH) —
  https://ui.shadcn.com/docs/tailwind-v4 — lo que muestra que **incluso dentro de shadcn, Tailwind
  no es versión congelada** (ya migró v3→v4).
- **Pero el mecanismo de distribución NO obliga a Tailwind.** El esquema `registry-item.json`
  ofrece `cssVars` (variables CSS planas, agnósticas) y `css` (reglas arbitrarias); `tailwind`
  está **deprecated** a favor de `cssVars.theme` —
  https://ui.shadcn.com/docs/registry/registry-item-json. La obligatoriedad de Tailwind en
  shadcn/ui viene de cómo escribieron sus componentes, no del formato de registry.
- **Precedente probado sin Tailwind:** `shadcn-css` (repo comunitario) reescribe el patrón con
  **CSS Modules**; existe también preset de UnoCSS. El patrón de capas (headless + estilo +
  copy-paste) no depende intrínsecamente de Tailwind.

### Recomendación

**No exigir Tailwind como peer dependency del núcleo.** Es incompatible con el objetivo §0.1
("cualquier proyecto React") forzar un framework CSS que además cambia de versión mayor con
migraciones no triviales. Diseño sugerido para la capa 2 ("Styled layer") de `design.md`:
**CSS custom properties + clases planas (o CSS Modules) como base obligatoria** (que es
justamente lo que RF-16 ya pide vía tokens), y **una variante Tailwind opcional** (registry
namespaced o flag) para quien ya lo use — incluido SkillNet. Punto abierto para Fase 3 (no
bloquea): verificar si `cva` funciona igual generando clases CSS Modules que Tailwind.

---

## Pregunta 4 — Repetición espaciada: algoritmo y API agnóstica

### Evidencia

| Algoritmo | Estado/tarjeta | Líneas TS (scheduler) | Dep. externa | Calidad |
|---|---|---|---|---|
| Leitner | 1 entero (caja) | <20 | Ninguna | Baja, robusta, transparente |
| **SM-2** | `n`, `EF`, `I` | 40-60 | Ninguna | Media, 35+ años en producción |
| FSRS (scheduler, pesos por defecto) | `S`, `D`, reps, lapses, fechas | 100-250 | Ninguna* | Alta (supera a SM-2 en benchmarks del propio proyecto) |

- **SM-2**: fórmulas exactas verificadas (EF inicial 2.5, suelo 1.3; `q≥3` acierto, `q<3`
  reinicia) — https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 ,
  https://en.wikipedia.org/wiki/SM-2_(algorithm) . Aritmética pura, ~50 líneas, cero deps.
- **FSRS**: modelo DSR (Difficulty/Stability/Retrievability), 19 pesos (v4.5/v6), default de Anki
  desde 2023. El *scheduler* con pesos por defecto es tratable (~100-200 líneas); el *optimizador*
  (reentrenar pesos con ML) es caro y **evitable** para un MVP —
  https://github.com/open-spaced-repetition/fsrs4anki ,
  https://borretti.me/article/implementing-fsrs-in-100-lines
- `*ts-fsrs` (MIT, TS nativo, sin deps runtime pesadas) implementa el scheduler completo; **no
  persiste nada** (la persistencia es del consumidor — exactamente el contrato de RF-2) —
  https://github.com/open-spaced-repetition/ts-fsrs
- **Matiz del lote D:** `ts-fsrs` es un paquete **multi-módulo publicado en npm**, no un fichero
  trivial de copiar. Esto abre una **tercera opción** entre "SM-2 casero" y "copiar FSRS a mano":
  adoptarlo como **dependencia externa fijada con versión exacta + test de deriva** (patrón RNF-5,
  igual que Radix). Bundle size no medido (bundlephobia no consultado).

**API agnóstica propuesta** (derivada de cómo ya lo resuelve `ts-fsrs`):

```ts
type ReviewState = Record<string, unknown>; // opaco: SM2State | FSRSState | LeitnerState
type ReviewGrade = "again" | "hard" | "good" | "easy";
interface ReviewResult { state: ReviewState; dueAt: Date; }
interface SpacedRepetitionScheduler {
  createInitialState(): ReviewState;
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult; // pura, sin efectos
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
```

El `SpacedRepetitionDeck` (RF-2) es una capa por encima que decide qué carta mostrar según
`dueAt` y delega en el scheduler; tampoco persiste (devuelve el nuevo array, el consumidor decide
dónde vive). El algoritmo es intercambiable tras la interfaz.

### Recomendación

**SM-2 como algoritmo por defecto** (coste mínimo, cero deps, evidencia de 35+ años) tras la
interfaz agnóstica de arriba. **FSRS como "modo avanzado"** — y aquí, en vez de darlo por cerrado,
mantener abiertas dos vías: (a) reimplementar solo el scheduler de FSRS con pesos por defecto, o
(b) adoptar `ts-fsrs` como dependencia fijada (RNF-5) aceptando su coste de mantenimiento a cambio
de mejor evidencia. **No usar Leitner como principal** (demasiado burdo); resérvese como "modo
simple" opcional. Lo no negociable: exponer siempre la interfaz agnóstica para que cambiar de
algoritmo no rompa a los consumidores.

---

## Pregunta 5 — Accesibilidad y neurodiversidad: patrones con evidencia real

> Cada patrón marca su categoría de evidencia: **normativo** (WCAG, con nivel A/AA/AAA),
> **investigación informada/consenso** (COGA, CAST/UDL), o **guía de estilo práctica** (BDA).
> Las tres son evidencia real pero de distinto peso probatorio.

### 5.1 WCAG 2.2 (normativo — la evidencia más fuerte) — https://www.w3.org/TR/WCAG22/

| Criterio | Nivel | Traducción a requisito |
|---|---|---|
| 2.3.1 Three Flashes | A | Ninguna animación de feedback puede destellar >3×/s |
| 2.3.3 Animation from Interactions | AAA (tratar como base) | Toda micro-animación (flip, transición, confetti) respeta `prefers-reduced-motion` (RF-13) + toggle explícito |
| 2.2.1 Timing Adjustable | A | Todo cronómetro de ejercicio debe ser desactivable/ampliable → fundamento directo de RF-14 |
| 2.2.2 Pause, Stop, Hide | A | Contenido en movimiento >5s necesita control de pausa |
| 2.4.7 Focus Visible | AA | `:focus-visible` con contraste en todo control; nunca `outline:none` sin sustituto |
| 2.4.11 Focus Not Obscured | AA (nuevo 2.2) | Popovers de `Glossary` no pueden tapar el elemento enfocado |
| 1.4.3 Contrast (Minimum) | AA | Tema neutro (RF-16) fija tokens ≥4.5:1 por defecto |
| 1.4.11 Non-text Contrast | AA | Bordes, iconos de estado, barras de progreso ≥3:1 |
| **2.5.7 Dragging Movements** | **AA** | Ver §9.4 — afecta a RF-3; teclado ≠ "single pointer sin arrastre" |

### 5.2 CAST/UDL 3.0 (marco de investigación, no checklist) — https://udlguidelines.cast.org/

Framework de neurociencia sobre 3 redes (afectiva/reconocimiento/estratégica). **Representation**
→ conceptos en más de un formato (`Glossary`, `Hint`, respuesta abierta). **Action & Expression**
→ RF-3 debe ofrecer vía alternativa al arrastre de ratón. **Engagement** → RF-6/RF-7 dan control
al alumno sobre ritmo y dificultad.

### 5.3 British Dyslexia Association (guía de estilo práctica, respaldo institucional, sin ensayos citados punto por punto) — BDA Style Guide 2023

Sans-serif por defecto, tamaño relativo ajustable (nunca `px` fijo); ≤60-70 car./línea, sin
justificar; negrita para énfasis (no cursiva/subrayado — refuerza RF-12 "no solo color"); evitar
verde/rojo puros para éxito/error (siempre + icono/texto); estructura en viñetas/pasos (encaja con
RF-8/RF-10).

### 5.4 W3C WAI-COGA (guía suplementaria a WCAG, consenso de grupo de trabajo con investigación de usuarios) — https://www.w3.org/TR/coga-usable/

Cubre TDAH/autismo/dislexia/discalculia. Patrones con target explícito: "Avoid Data Loss and
Timeouts" (§4.5.9, refuerza RF-14); "Let Users Control When Content Moves" (§4.9.1, TDAH → autoplay
de vídeo/carruseles solo por acción del usuario); "Use White Spacing"/"Avoid Too Much Content"
(§4.4.10/§4.6.3 → máx. ~5-7 opciones visibles sin agrupar); "Use a Consistent Visual Design"
(§4.2.3 → misma disposición entre variantes de `QuizItem`).

### 5.5 Lo que NO tiene evidencia sólida específica (dicho explícitamente)

No se encontró una guía con la especificidad de la BDA dedicada por separado a **TDAH** o
**autismo**: COGA los trata bajo el paraguas cognitivo con patrones compartidos, no con reglas
tipográficas propias por condición. **No está claro** que existan reglas de fuente/tamaño
específicas para TDAH/autismo con el respaldo de las de dislexia; lo que faltaría son estudios
controlados que aíslen cada condición — no encontrados en esta búsqueda. La eficacia de fuentes
comerciales "para dislexia" (OpenDyslexic) es contestada; la BDA no las exige, así que no se
afirma nada sobre ellas.

### Recomendación

Contrato mínimo no negociable del núcleo (concreta RF-12/13/14 con trazabilidad a fuente):
1. WCAG 2.2 **AA completo** + tratar 2.3.3 (AAA) como obligatorio (ya en RF-13).
2. Ningún temporizador sin desactivar/extender (WCAG 2.2.1 + COGA §4.5.9).
3. Ninguna animación/autoplay sin acción del usuario; todas respetan `prefers-reduced-motion`
   (WCAG 2.3.3 + COGA §4.9.1).
4. Límite de densidad por defecto (~5-7 opciones sin agrupar) (COGA §4.4.10/§4.6.3).
5. Tema neutro sans-serif, fuente relativa ajustable, sin rojo/verde puro para estado, sin
   cursiva/subrayado como único énfasis (BDA + WCAG 1.4.1).

Documentar en Storybook, por componente, **qué criterio concreto cumple** (no "es accesible"
genérico), porque `design.md` §9 marca el riesgo de "accesibilidad de buena intención sin
evidencia". Ver §9.4 para el ángulo legal (EN 301 549) que hace esto requisito de venta.

---

## Pregunta 6 — Estándares/librerías de e-learning: vocabulario e interoperabilidad

### Evidencia por estándar

- **IMS QTI 3.0** (1EdTech): modelo de datos de preguntas/tests con el **vocabulario de
  interacciones más rico y directamente comparable a §4.1** — `choice`, `order`, `match`/
  `associate`, `gapMatch`, `textEntry`/`extendedText`, `inlineChoice`, etc. (enumeración completa
  de las 21 interacciones en §9.2). 20+ años de uso. Interoperabilidad real vía binding XML para
  intercambio de bancos de preguntas — https://www.imsglobal.org/spec/qti/v3p0/oview
- **H5P**: >50 content types embebibles; equivalente 1:1 de casi todo RF-1..RF-9 (Flashcards,
  Drag and Drop, Fill in the Blanks, Multiple Choice, Essay, Timeline, Interactive Video…). Su
  interoperabilidad de facto depende de LTI — https://h5p.org/content-types-and-applications
- **Open edX XBlocks**: patrón arquitectónico (estado + vista + acción) acoplado a la plataforma;
  no aporta vocabulario de ejercicios ni interoperabilidad cross-plataforma —
  https://docs.openedx.org/projects/xblock/en/latest/index.html
- **LTI 1.3**: lanza herramientas externas dentro de un LMS; **ningún vocabulario de ejercicios**.
  Relevante solo si un consumidor necesitara embeberse en un LMS de terceros —
  https://www.1edtech.org/standards/lti
- **xAPI**: statements `actor-verb-object` a un LRS; vocabulario de **eventos** (10 interaction
  types cerrados, ver §9.2), no de preguntas. Útil como inspiración de naming de callbacks
  (`onAttempted`, `onMastered`) — https://github.com/adlnet/xAPI-Spec
- **SCORM**: empaquetado + tracking de finalización; sin vocabulario de ejercicios. Legado, fuera
  de alcance del núcleo — https://scorm.com/scorm-explained/technical-scorm/run-time/

### Recomendación

1. **Adoptar el vocabulario de nombres de interacción de QTI 3.0** como referencia para nombrar
   RF-3/RF-4 (el estándar de mayor granularidad y trayectoria).
2. **H5P como checklist de validación cruzada** de §4.1 (precedente de uso a gran escala); no como
   dependencia ni formato de intercambio.
3. **No implementar LTI/SCORM/binding XML de QTI en el núcleo** (son integración con LMS, y el
   núcleo no gestiona backend — `requirements.md` §2). Si un consumidor lo necesitara: LTI 1.3 +
   xAPI, fuera del núcleo.
4. **Vocabulario de verbos xAPI solo como inspiración de naming de callbacks.**
5. **Descartar XBlocks y SCORM como fuente de vocabulario** (el patrón estado/vista/acción de
   XBlock puede inspirar la estructura interna de componentes con estado — nota de diseño).

---

## Pregunta 7 — ¿Qué componentes del inventario §4.1 son expresables sin reactividad? (adaptador SkillNet)

> **Nota metodológica clave:** `openui-adoption.md` cita "las 7 reglas de §5.2" pero **no las
> enumera**; la §5.2 pertenece a `docs/design/v2-dynamic-courses.md`, y la enumeración
> autoritativa y ejecutable vive en el docstring de `repo/apps/skillnet-api/src/render/spec.py:1-26`
> (lo que corren `test_render_kit.py` / `test_render_prompt_artifact.py`). Se usa esa como fuente
> primaria. Regla 5 (crítica): `QuizItem` nunca lleva respuesta correcta ni explicación — eso vive
> en `answer_key` y jamás viaja en el `ui_spec` (`ANSWER_KEY_KEYS`, `spec.py:75-87`). Vinculante
> además: cero `Mutation`/`Query`/`$state`, ningún `useTriggerAction()`; hoy
> `RENDER_ALLOW_REACTIVE = False`.
>
> **Patrón clave:** un bloque puede tener **estado de React puro** (`useState`/`useEffect`) sin
> violar "sin reactividad" — la prohibición es sobre la capa del dialecto OpenUI, no sobre React
> ordinario. Precedente: `QuizItemBlock` es autónomo con su propio estado y su propio POST
> (`QuizItemRenderer.tsx:16-19`). **El catálogo real tiene hoy 14 bloques, no 10** como asume el
> borrador de `design.md` §5 (`schemas.ts:167-182`).

| Componente (RF) | Veredicto | Motivo |
|---|---|---|
| **Flashcard** (RF-1) | **APTO** | Flip/marcar-sabido = estado React efímero; sin `answer_key` que proteger. Precedente: `QuizItemBlock`. |
| **SpacedRepetitionDeck** (RF-2) | **NO APTO** | Persistir estado entre sesiones exige `Query`/`Mutation`, prohibidas hoy (`RENDER_ALLOW_REACTIVE=False`). Coincide con §2 "fuera de alcance". |
| **Matching/Sort/Categorize** (RF-3) | **APTO** | Precedente en producción: `DragOrder` (`schemas.ts:150-154`) usa props literales + React interno, sin `Mutation`. El borrador decía "a confirmar" → **confirmado APTO**. |
| **Variantes de quiz** (RF-4) | **APTO** | `QuizItem` ya cubre 6 `item_type` sin `correct`/`explanation` en props (regla 5). Verificación de respuesta abierta corre server-side vía POST autónomo. |
| **Glossary/Term** (RF-5) | **APTO** | Presentación pura; sin respuesta que proteger, sin datos dinámicos. |
| **Hint/Reveal** (RF-6) | **APTO con tensión estructural** | Toggle = estado React. PERO la "reserialización canónica servida de una vez" implica que todo el `ui_spec` (incl. contenido oculto) llega de golpe: seguro para una pista pedagógica, **choca con regla 5 si envuelve la respuesta de un examen** — en ese caso debe delegar en el POST autónomo de `QuizItem`, no llevar el secreto como prop. |
| **Progreso/mastery** (RF-7) | **APTO** | Foto fija (`mastery: 0.72`) como prop literal, igual que `Chart` (`schemas.ts:118-123`). Una barra en vivo sí exigiría `Query`. |
| **Timeline/Steps** (RF-8) | **APTO** | Ya existe literalmente como `StepSequence` (`schemas.ts:103-106`) — 1:1 con RF-8, no analogía. |
| **Checkpoint sobre vídeo** (RF-9) | **APTO en principio / bloqueado por infraestructura** | Las reglas no lo impiden (mismo patrón autónomo que `QuizItem`); el bloqueo real es que **no hay reproductor de vídeo** (Pregunta 8), no la reactividad. |
| **Rubric** (RF-10) | **APTO** | Autoevaluación sin nota automática → sin `answer_key` (regla 5 no aplica); estado de selección efímero. |
| **Ejercicio de código** (RF-11) | **NO APTO** | "Comprobación" exige ejecución/red (≈`Mutation`, prohibida) fuera del modelo de `assertStaticOnly.ts`. El display sin comprobación (`CodeBlock`) sí es apto, pero no cubre RF-11 completo. |

### Discrepancias con el borrador de `design.md` §5

1. **RF-3**: "a confirmar" → **confirmado APTO** (precedente `DragOrder`).
2. **RF-8**: ya existe como `StepSequence` — no hay que crearlo, solo mapearlo.
3. **RF-6**: la cautela ("no filtrar la respuesta") es **estructural**, no solo de implementación.
4. **RF-9**: la reactividad **no** es el obstáculo; el reproductor sí (Pregunta 8).
5. Catálogo real = **14 bloques**, no 10 (más precedentes para justificar APTO).

### Recomendación

**8 de 11 APTOS** (Flashcard, Matching/Sort/Categorize, quiz, Glossary, Hint/Reveal,
progreso/mastery, Timeline, Rubric), **1 apto-pero-bloqueado** (vídeo, RF-9), **2 no aptos**
mientras `RENDER_ALLOW_REACTIVE=False` (SpacedRepetitionDeck, código). Orden de registro sugerido:
primero los de precedente 1:1 (Timeline vía `StepSequence`, Matching vía `DragOrder`, quiz vía
`QuizItem`), luego los nuevos sin fricción (Flashcard, Glossary, progreso, Rubric), y dejar
Hint/Reveal hasta documentar la frontera "nunca envuelve una respuesta de examen".

---

## Pregunta 8 — ¿Hay reproductor de vídeo en `skillnet-web` con checkpoints? (adaptador SkillNet)

### Evidencia

Búsqueda exhaustiva (Grep/Glob) sobre `repo/apps/skillnet-web/` y `skillnet-api/src` por: `video`,
`player`, `react-player`, `video.js`, `hls`, `mux`, `vimeo`, `youtube`, `<video`, `Plyr`, y eventos
`onTimeUpdate`/`currentTime`/`timeupdate`/`checkpoint`/`cue`/`seek`.

**Resultado: ninguna integración de reproductor de vídeo.** Cero coincidencias en código, cero
ficheros con "video"/"player" en el nombre, cero eventos de timestamp. La única dependencia
multimedia es `wavesurfer.js` (`^7.12.11`) — **audio**, base de `AudioExplanationBlock`/
`PronunciationExerciseBlock`. Útil como precedente: el proyecto acepta una dependencia focalizada
con versión fijada cuando el kit la necesita (coherente con RNF-5).

### Qué evaluar desde cero (no hay decisión previa)

1. **Tipo de fuente**: autoalojado (mp4/HLS) vs. terceros (YouTube/Vimeo) — **dato que no está en
   el repo** y condiciona todo lo demás.
2. **`<video>` nativo + `timeupdate`/`<track kind="chapters">`**: coste cero en dependencias,
   soporta checkpoints con eventos DOM.
3. **`react-player`**: unifica mp4/YouTube/Vimeo, pero es dep. npm adicional → RNF-5.
4. **`video.js`/`hls.js`/Mux**: solo si hay streaming adaptativo real (sin evidencia en el repo).
5. **A11y**: `<track>` WebVTT (subtítulos) desde el inicio, no "a añadir después".
6. **Encaje sin reactividad**: el checkpoint se resuelve con estado React autónomo del bloque, no
   reabre `openui-adoption.md`; es dependencia de UI ordinaria sujeta a RNF-5.

### Recomendación

**No existe hoy; evaluar desde cero.** Falta el dato de qué tipo de fuente usa/usaría SkillNet
antes de elegir. Punto de partida recomendado (no decidido aquí): probar primero `<video>` nativo
+ `<track kind="chapters">`/`timeupdate` (coste cero en deps), y subir a `react-player` u otra
librería solo si aparece un requisito concreto (p. ej. vídeos ya en YouTube/Vimeo).

---

## 9. Hallazgos complementarios (exceden las 8 preguntas de §6)

> Estos hallazgos provienen del lote D (fuentes aportadas por el dueño del producto). No responden
> a una pregunta de §6 existente — **la amplían**. Se recogen aquí para que Fase 2 decida si
> modifican `requirements.md`/`design.md`.

### 9.1 Evidencia pedagógica — reordena la prioridad del inventario (hoy con cero presencia en el spec)

- **Dunlosky et al. 2013** (SAGE, 403 — reconstruido vía APS y PubMed
  https://pubmed.ncbi.nlm.nih.gov/26173288/): de 10 técnicas, solo **practice testing** y
  **distributed practice** tienen utilidad **alta**; highlighting/rereading, **baja** (confirmado
  en fuente secundaria). → **RF-2 (distributed practice) y RF-4 usado como practice testing tienen
  el respaldo más fuerte del inventario.** RF-5 (Glossary como consulta pasiva) no lo tiene → debería
  forzar recuperación activa, no solo consulta.
- **Wisniewski, Zierer & Hattie 2019** (Frontiers, open-access, leído completo
  https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full): 435 estudios; feedback
  **informativo** d=0.99 vs. refuerzo/elogio/puntos d=0.24. → **Nuevo requisito propuesto:** RF-4 y
  RF-6 deben soportar un **slot de feedback informativo** (por qué, qué estrategia), no solo estado
  visual de acierto/error. `design.md` no lo recoge hoy.
- **Fiorella & Mayer 2016** (Springer, login — vía ERIC https://eric.ed.gov/?id=EJ1120458): 8
  estrategias generativas. Candidatos a **componentes nuevos** que no existen hoy: `SelfExplanation`
  y `ConceptMap` (mapping) — **fuera del inventario actual, propuesta v2**, no implementar ya.
- **Sitzmann 2011** (Wiley, 402 — vía resumen del abstract): simulation games con efecto positivo
  pero **moderado** (d 0.22-0.52) y **sesgo de publicación declarado**. → Pesa contra sobrepriorizar
  un componente de escenario/simulación (ver §9.3): entraría con prioridad media-baja.

**Recomendación:** añadir a `requirements.md`/`design.md` una nota de priorización basada en
evidencia (RF-2/RF-4 = evidencia fuerte; RF-9/RF-10/RF-11 = no evaluadas por estas fuentes) y el
requisito de feedback informativo en RF-4/RF-6.

### 9.2 QTI/xAPI: mapeo de interoperabilidad y una familia de interacciones que falta en §4.1

**QTI 3.0 define 21 interacciones** (no ~19) — https://www.imsglobal.org/spec/qti/v3p0/impl.
RF-3/RF-4 cubren bien las **textuales/de lista** (`choice`, `match`, `associate`, `order`,
`gap-match`, `text-entry`, `extended-text`, `inline-choice`), pero dejan **una familia entera sin
cubrir**: interacciones **gráficas/sobre imagen** (`hotspot`, `hot-text`, `graphic-order`,
`graphic-associate`, `graphic-gap-match`, `position-object`, `select-point`, `drawing`) y
**respuesta numérica/slider**. **Esto no estaba en §4.1 — es un hallazgo de alcance, no de
nomenclatura.**

**xAPI: 10 interaction types cerrados** (`true-false`, `choice`, `fill-in`, `long-fill-in`,
`matching`, `performance`, `sequencing`, `likert`, `numeric`, `other`) —
https://github.com/adlnet/xAPI-Spec. Mapeo directo desde RF-3/RF-4; **sin mapeo**: `performance`,
`likert`, `numeric` (coincide con el gap de slider/numérico de QTI).

**H5P `semantics.json`** — https://h5p.org/semantics: esquema declarativo que sirve **a la vez**
para generar el editor y validar en runtime. Patrón adoptable para nuestras entradas de registry
(RF-15/RF-17): un esquema por componente que documente + valide props, coherente con RNF-4
(streaming/props incompletas). *(Corrección de dato: el repo de drag-and-drop de H5P es
`h5p-drag-question`, no `h5p-drag-and-drop`.)*

**Recomendación:** (a) documentar en cada entrada de registry a qué interacción QTI y qué
`interactionType` xAPI corresponde cada componente RF-3/RF-4 (interoperabilidad de reporting sin
adoptar QTI entero); (b) **añadir a §4.1 una nota de alcance** declarando las interacciones
gráficas y numéricas/Likert como **fuera de v1, candidatas a v2** (hoy quedan descartadas sin
decirlo); (c) adoptar el patrón dual de `semantics.json` para el formato de entrada de registry.

### 9.3 Librerías candidatas no contempladas por el spec

- **dnd-kit** (MIT, https://github.com/clauderic/dnd-kit): teclado + ARIA + live regions de serie.
  Mitigación directa del incumplimiento WCAG 2.5.7 en RF-3. Matiz: `@dnd-kit/core` sin release en
  ~2 años; la API nueva es `@dnd-kit/react` (0.5.0). Compat React 19 **no confirmada** en doc
  oficial (solo fuente secundaria). → Adoptar como dependencia de comportamiento fijada (RNF-5).
- **ts-fsrs** (ver Pregunta 4): tercera opción para RF-2 como dependencia fijada.
- **Ink/inkjs** (MIT, https://github.com/inkle/ink , https://github.com/y-lohse/inkjs): guiones
  ramificados compilables a JSON, muy generables por LLM. Justifica un **componente nuevo
  "escenario ramificado"** fuera del inventario, **prioridad media-baja** (evidencia Sitzmann §9.1).
- **Sandpack** (**Apache-2.0**, no MIT, https://sandpack.codesandbox.io/): resuelve la **ejecución**
  de RF-11 (editor + runtime en navegador), **no la comprobación** (checker sigue siendo trabajo
  nuestro). No sube la prioridad de RF-11; reduce su coste futuro. Apache-2.0 exige atribución si se
  redistribuye código copiado — relevante para el modelo copy-paste (RNF-5).

### 9.4 Accesibilidad como requisito legal (no solo ético)

- **WCAG 2.2 §2.5.7 Dragging Movements** (AA) —
  https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html: toda función de arrastre
  debe tener alternativa de **un solo puntero sin arrastre**. **Matiz importante:** RF-3 hoy pide
  "soporte de teclado, no solo drag-and-drop" — pero **teclado ≠ single-pointer-sin-arrastre**.
  dnd-kit da teclado, no necesariamente el patrón "seleccionar origen → seleccionar destino" (dos
  clics) que 2.5.7 pide en sentido estricto. Implementar ese patrón explícitamente, no dar 2.5.7
  por cumplido solo con teclado.
- **EN 301 549** (índice ETSI 403 — vía Deque/WCAG.com): estándar europeo armonizado que referencia
  WCAG en su Cap. 9. Desde el **28-jun-2025**, exigible bajo la **European Accessibility Act**
  también a empresas privadas que venden a consumidores en la UE → accesibilidad = **requisito de
  venta legal**, no aspiracional. Refuerza RF-12–17 como primera clase. **No verificado:** la
  versión de EN 301 549 vigente referencia WCAG **2.1** según fuentes secundarias, anterior a 2.2 —
  por lo que **2.5.7 podría no estar aún incorporado literalmente**. Confirmar contra el texto de EN
  301 549 antes de usarlo como argumento legal preciso ante un cliente.

**Recomendación:** WCAG 2.2 (incl. 2.5.7) como requisito no negociable de RF-3, con el patrón de un
solo puntero además del teclado; añadir a `design.md` EN 301 549/EAA como motivación de negocio
para RF-12–17, verificando la versión exacta de WCAG que incorpora antes de afirmarlo como
cumplimiento legal.

---

## 10. Estado de las secciones `[PENDIENTE]` de `design.md` (para Fase 2)

| Sección `design.md` | Pregunta | Resultado de esta investigación |
|---|---|---|
| §2 (base de primitivos, React 19) | P2 | Radix por defecto + documentar fricción; vigilar Base UI. Falta smoke test propio antes de fijar. |
| §3 (mecanismo de registry) | P1 | CLI oficial de shadcn como primario; convención de versionado propia; `shadcn diff` a probar. |
| §3 (¿Tailwind?) | P3 | No obligatorio; base CSS custom properties, Tailwind opcional. |
| §5 (inventario + prioridad) | P4, P7, §9.1 | Prioridad debe basarse en evidencia (RF-2/RF-4 fuertes); tabla de reactividad = 8 aptos/1 bloqueado/2 no; catálogo real = 14 bloques. |

**Puntos que Fase 2 debería decidir explícitamente y que exceden lo que §6 preguntó** (todos en
§9): ¿se añade el requisito de feedback informativo a RF-4/RF-6? ¿se declara el gap de
interacciones gráficas/numéricas como fuera-de-v1 en §4.1? ¿entra `ts-fsrs`/dnd-kit como
dependencias fijadas? ¿se abre un componente "escenario ramificado" (Ink) para v2?

---

## Criterio de salida (Fase 1) — autoevaluación

- [x] Cada pregunta de §6 (1-8) tiene respuesta con **evidencia citada** (URL o fichero:línea) y
  **recomendación explícita**.
- [x] Donde la evidencia no es concluyente se dice así (P2 sin smoke test; P5 hueco neuro-específico;
  §9.1 Dunlosky no verificado línea por línea; §9.4 versión WCAG de EN 301 549 no verificada;
  compat React 19 de dnd-kit no confirmada).
- [x] Las secciones `[PENDIENTE]` de `design.md` tienen datos para resolverse en Fase 2 (§10).
- [x] Hallazgos que exceden §6 quedan separados (§9) para que Fase 2 decida si modifican el spec,
  en vez de mezclarlos con las respuestas a las preguntas existentes.
