# Design — Librería de Componentes de Educación

> Responde al **cómo**, a partir de `requirements.md`. Varias secciones quedan marcadas
> **[PENDIENTE — fase de investigación]**: no se cierran aquí porque `requirements.md` §6 exige
> evidencia antes de decidir. Las decisiones de `requirements.md` §0 (dueño del producto) SÍ
> están cerradas y este documento no las reabre — solo verifica su viabilidad técnica.

## 0. Marco: núcleo vs adaptador

Todo este documento distingue dos cosas que **no viven en el mismo sitio ni con el mismo
ciclo de vida**:

- **Núcleo**: la librería en sí. Agnóstica de consumidor. Vive en su propio repo (§7).
- **Adaptador SkillNet**: código que vive en `repo/` (SkillNet) y que consume el núcleo, lo
  tematiza con `design-system.md` y, opcionalmente, registra componentes en el catálogo
  generativo v2. Es un consumidor, no una parte de la librería.

Cualquier sección de abajo etiquetada "(adaptador)" describe algo que se implementa en `repo/`,
no en este proyecto.

## 1. Restricciones heredadas

### 1.1 Del núcleo (siempre, cualquier proyecto)

| Restricción | Fuente |
|---|---|
| Modelo de distribución: registry + CLI que copia código fuente (estilo shadcn/ui), no dependencia npm versionada como vía primaria | `requirements.md` §0.2, RF-15 |
| React como framework objetivo (a confirmar si algo más queda fuera, §6) | `requirements.md` §2 |
| Tema visual neutro por defecto, restyleable vía tokens/CSS custom properties | `requirements.md` RF-16 |
| Accesible por defecto (teclado, ARIA, `prefers-reduced-motion`) | `requirements.md` §4.2 |
| Cualquier dependencia externa no copiada (p. ej. capa de primitivos) fijada con versión exacta + test de deriva | `requirements.md` RNF-5 |

### 1.2 Del adaptador SkillNet (solo si se integra ahí)

| Restricción | Fuente |
|---|---|
| Tokens CSS de `design-system.md` (colores, radios, sombras, tipografía, motion) | `repo/docs/design/design-system.md` |
| Sin `rounded-2xl/3xl`, sin gradientes, sin `shadow-lg/xl`, sin spinners genéricos | `design-system.md` |
| Catálogo generativo v2 = sin reactividad (`Mutation`/`Query`/`$state`) salvo condiciones de `openui-adoption.md` §6 | `repo/docs/design/openui-adoption.md` |
| El navegador en v2 nunca recibe texto crudo del modelo, solo re-serialización canónica validada | `openui-adoption.md` §4 |
| La clave de respuesta (`answer_key`) nunca se sirve al cliente | `openui-adoption.md`, `snml-spec.md` |
| Código y comentarios en inglés (convención del repo SkillNet) | `repo/CLAUDE.md` |

Nada de 1.2 se aplica al núcleo. Un componente del núcleo no "sabe" que SkillNet existe.

## 2. Arquitectura propuesta (núcleo, 3 capas)

```
┌─────────────────────────────────────────────┐
│ 3. Education molecules                       │  Flashcard, MatchingExercise, QuizItem*,
│    (componentes con significado pedagógico)  │  SpacedRepetitionDeck, Glossary, Hint,
│                                               │  Timeline, Rubric, MasteryBadge…
├─────────────────────────────────────────────┤
│ 2. Styled layer                              │  Tailwind + variantes (cva o similar) sobre
│    (tema neutro, restyleable)                │  los primitivos. Un solo lugar de theming.
├─────────────────────────────────────────────┤
│ 1. Accessible primitives                     │  Comportamiento accesible sin estilo propio
│    (headless)                                │  (foco, teclado, ARIA). Candidata: Radix UI
│                                               │  (la misma base que usa shadcn/ui) [a verificar]
└─────────────────────────────────────────────┘
```

Esto es deliberadamente el mismo patrón de capas que usa shadcn/ui (primitivos headless +
Tailwind + composición de variantes), aplicado a vocabulario educativo en vez de genérico. La
capa 3 es donde está el valor real de este proyecto — las capas 1 y 2 existen para no
reinventar accesibilidad desde cero (ver el coste de hacerlo a mano en
`openui-adoption.md` §1: 1500+ líneas de test para blindar un parser propio).

**[PENDIENTE — fase de investigación, requirements.md §6.2]**: confirmar que Radix UI (o la
alternativa que gane la comparación) funciona bien en React 19 con evidencia ejecutada.

## 3. Modelo de distribución: registry estilo shadcn/ui

**Decidido en `requirements.md` §0.2**; esta sección detalla la forma, sujeta a verificación
técnica de §6.1.

- Cada componente se describe en una entrada de registry (nombre, archivos, dependencias de
  otros componentes de la propia librería, dependencias externas si las hay).
- Un CLI (el propio de shadcn si su mecanismo de registry de terceros lo permite — pregunta
  §6.1 — o uno propio si no) copia el código fuente al proyecto consumidor.
- El consumidor queda con el componente como código propio: puede modificarlo, no depende de
  una versión publicada para seguir funcionando.
- Consecuencia directa: no hay "una sola versión desplegada en producción" de cada componente,
  hay tantas copias como proyectos lo adoptaron. La librería central es la fuente de verdad para
  *nuevas* copias y para quien quiera actualizar la suya, no un runtime compartido.

**[PENDIENTE — fase de investigación, requirements.md §6.1, §6.3]**: mecanismo exacto de
registry de terceros, y si exigir Tailwind como peer dependency es aceptable dado el objetivo de
"cualquier proyecto".

## 4. Adaptador SkillNet (fuera del núcleo)

### 4.1 Uso directo (cursos v1, estáticos)

Import normal de React en `skillnet-web`, con el tema de `design-system.md` aplicado sobre el
tema neutro del núcleo (RF-18). Sin restricciones adicionales del núcleo.

### 4.2 Bloque del catálogo generativo (cursos v2)

Un componente del núcleo entra al catálogo de SkillNet
(`apps/skillnet-web/src/components/courses/kit/`) solo si:

1. Se puede describir con un esquema `zod` + `defineComponent`, igual que los 10 bloques
   actuales (`kit/schemas.ts`, `kit/library.tsx`).
2. Cumple las 7 reglas de contrato de `openui-adoption.md` §5.2 y no requiere `Mutation`/`Query`.
3. Pasa `assertStaticOnly` y no dispara `useTriggerAction`.
4. Tiene un mirror en `src/render/kit.py` (Python) para el test de deriva
   (`test_render_prompt_artifact.py`).
5. No hace que el DAG de bloques supere `MAX_RENDERED_NODES = 64` con anidamiento razonable.

Esto es trabajo del adaptador, vive en `repo/`, y no condiciona el diseño de los componentes del
núcleo salvo en que estos deben poder describirse de forma estática cuando sea razonable (RNF-4).

## 5. Inventario de componentes candidatos (núcleo — prioridad final tras investigación)

| Componente | Requisito | ¿Expresable sin reactividad para el adaptador SkillNet? (borrador) | Prioridad (borrador) |
|---|---|---|---|
| `Flashcard` | RF-1 | Probable sí | Alta |
| `SpacedRepetitionDeck` | RF-2 | Probable no (estado entre sesiones) | Media |
| `MatchingExercise` / `SortExercise` / `CategorizeExercise` | RF-3 | A confirmar | Alta |
| Variantes de quiz (multi-respuesta, V/F, hueco, abierta corta) | RF-4 | Sí, mismo patrón que el `QuizItem` actual de SkillNet | Alta |
| `Glossary` / `Term` | RF-5 | Sí | Media |
| `Hint` / `Reveal` | RF-6 | Sí, con cuidado de no filtrar la respuesta en el DOM | Alta |
| Indicadores de progreso/mastery | RF-7 | Sí | Media |
| `Timeline` / `Steps` | RF-8 | Sí | Media |
| Checkpoint sobre vídeo | RF-9 | A confirmar (depende del reproductor) | Baja |
| `Rubric` / autoevaluación | RF-10 | Sí | Baja |
| Ejercicio de código | RF-11 | Probable no (necesita ejecución) | Baja |

La columna "expresable sin reactividad" es específica del adaptador SkillNet; para el núcleo,
la prioridad se basa solo en utilidad general (§requirements.md §4.1), no en esa columna.

## 6. Theming (núcleo)

Sin paleta ni escala de espaciado propia impuesta a los consumidores. El núcleo define **su
propio tema neutro por defecto** (para poder mostrarse en el registry/Storybook sin depender de
ningún consumidor) expuesto vía CSS custom properties, y cualquier proyecto —SkillNet incluido—
lo sobreescribe con las suyas. SkillNet, como adaptador, mapea `design-system.md` sobre esas
variables (RF-18); esto no es distinto de cómo cualquier proyecto adopta un tema de shadcn/ui.

## 7. Ubicación del proyecto — **decidido**

Repo independiente (donde vive hoy, `Anfaia/library`), publicado como registry propia,
consumida por CLI desde cualquier proyecto — no como paquete dentro de `repo/packages/`.

Esto ya no es una decisión abierta: se deriva directamente de `requirements.md` §0.1 ("debe
poder usarse en cualquier proyecto") y §0.2 (modelo shadcn, que es intrínsecamente
multi-proyecto: una registry no tiene sentido si solo la consume un repo). SkillNet consume esta
librería igual que consumiría cualquier registry de shadcn de terceros: copiando componentes,
sin publicar ni depender de una versión de npm.

Lo que sigue pendiente de investigación es solo el **mecanismo exacto** (§6.1 de
`requirements.md`), no la forma general.

## 8. Calidad y herramientas (núcleo)

- **Storybook** (o equivalente): una historia por componente y por estado relevante (vacío,
  error, correcto/incorrecto, cargando). Addon de a11y en CI.
- **Tests**: comportamiento (Testing Library o equivalente), no solo snapshots.
- **Registry como documentación viva**: cada entrada de la registry debe ser suficiente para
  entender qué copia el CLI sin leer el código fuente primero.
- **Test de deriva** (solo en el adaptador SkillNet, para componentes que entren al catálogo
  v2): mismo patrón que `catalog-drift.test.ts` en `repo/`.

## 9. Riesgos

- **El mecanismo de registry de terceros de shadcn no soporta lo que necesitamos** (§6.1) —
  mitigar teniendo un CLI/registry propio mínimo como plan B, no solo asumir que el de shadcn
  sirve tal cual.
- **Elegir una dependencia de base (capa 1) que rompa como `@openuidev` 0.2.x** — mitigar con
  versión exacta + test de deriva si se adopta algo externo (RNF-5). El modelo copy-paste
  protege a los *componentes*, no a sus dependencias internas de comportamiento (p. ej. Radix
  sigue siendo una dependencia real si no se copia también).
- **Diseñar para SkillNet sin darse cuenta** (acoplar tokens, idioma o supuestos de SkillNet en
  el núcleo) — mitigar revisando cada PR del núcleo contra la pregunta "¿esto tiene sentido para
  alguien que nunca ha oído hablar de SkillNet?".
- **Accesibilidad de intención buena pero sin evidencia** — mitigar no diseñando RF-12–14 sin
  las fuentes concretas que pide `requirements.md` §6.5.
- **(Adaptador) Sobrepasar `MAX_RENDERED_NODES`** al anidar ejercicios compuestos dentro del
  catálogo v2 de SkillNet — verificar por componente antes de registrarlo, no afecta al núcleo.

## 10. Métricas de éxito (borrador)

- Nº de componentes con historia + test + revisión a11y, sobre el total priorizado en §5.
- Nº de proyectos consumidores reales (no solo SkillNet) que copian al menos un componente —
  señal de que "cualquier proyecto" no es solo aspiracional.
- (Adaptador) Nº de componentes registrados en el catálogo v2 de SkillNet sin romper
  `test_render_prompt_artifact.py`.
