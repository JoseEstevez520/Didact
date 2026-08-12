# Roadmap — Didact Education Components

> Plan de ejecución de una biblioteca educativa independiente, distribuida mediante el registry
> copy-paste de Didact y utilizable por cualquier producto React. SkillNet es un consumidor
> opcional: no define la arquitectura ni bloquea el avance del núcleo.

## Norte del producto

Didact no aspira a ser una colección de quizzes sueltos. El objetivo es cubrir el ciclo completo
de un curso online: presentar, practicar, explicar, evaluar, dar feedback, representar progreso y
componer experiencias más complejas.

El primer hito amplio de este roadmap es de **42 tipos educativos diferenciados**: 34 capacidades
ya implementadas y 8 pendientes. Es un hito de cobertura, no el techo de la biblioteca. La cifra no
se infla contando primitives UI, aliases, recipes de asignatura o cambios cosméticos como componentes
distintos.

La calidad del catálogo se medirá como:

> cobertura útil × coherencia del contrato × accesibilidad × evidencia × capacidad de composición

Por tanto, tener más componentes sí aumenta el valor cuando cubren necesidades diferentes; tener
muchos componentes con APIs incompatibles, inaccesibles o sin propósito educativo no crea una
buena biblioteca.

## Estado actual (2026-08-11)

| Fase | Estado |
|---|---|
| 0 — Especificación y plan | ✅ terminada |
| 1 — Investigación | ✅ terminada — `specs/education-components/research.md` |
| 2 — Decisiones de diseño | ✅ terminada — `design.md` y `research/decisions.md` |
| 3 — Scaffold del proyecto | ✅ terminada — monorepo, Storybook, pruebas y registry |
| 3.5 — Fundamentos visuales | ✅ terminada — `@didact/ui`, tokens y normas de interfaz |
| 4 — Primera oleada | ✅ terminada — 16 tipos educativos públicos |
| 5 — Contrato del catálogo | ✅ terminada — `@didact/schema`, `@didact/events`, `@didact/catalog` |
| 6 — Registry publicable | ✅ terminada — build, theme, imports locales y catálogo navegable |
| 6.5 — Arquitectura de catálogo y Storybook | ✅ terminada — navegación canónica y reglas contra duplicados |
| 6.6 — Facetas, colecciones y kits | ✅ terminada — seis colecciones y seis kits generados |
| 7 — Práctica activa y aprendizaje generativo | ⏸ pausada — 5 de 10; se evita concentrar más variantes similares |
| 8 — Evaluación textual y numérica | ⏸ pausada — 2 de 7; backlog útil, no siguiente prioridad |
| 9 — Interacciones gráficas accesibles | ⏸ pausada — 1 de 5; continuará sobre motores compartidos |
| **10 — Fundamentos de experiencia** | **✅ terminada — cinco fundamentos disponibles; `CodeExercise` cierra artefactos y ejecución** |
| **10.5 — Herramientas de dominio** | **✅ primera oleada — ecuaciones, evidencia y medición disponibles** |
| 11–13 | ⏳ pendientes |

## Principios de alcance

La expansión y la navegación del catálogo siguen
[`docs/catalog-architecture.md`](docs/catalog-architecture.md): una sola ubicación canónica por
componente, casos de asignatura como recipes y nuevas oleadas que amplían modelos de representación
y acciones del alumno en lugar de repetir interacciones existentes.

- QTI aporta vocabulario y modelos de interacción; no obliga a que el núcleo use XML.
- H5P `semantics.json` inspira el esquema declarativo de autoría; no se adopta su runtime.
- xAPI aporta un contrato de reporting; los statements pertenecen a un adaptador opcional.
- La evidencia pedagógica orienta el orden y el diseño, no se usa para hacer promesas universales.
- El feedback debe explicar qué ocurrió, por qué y qué hacer después. Elogios, puntos o badges no
  se presentan como aprendizaje.
- Ninguna actividad dependerá exclusivamente de arrastrar. Las operaciones de drag tendrán una
  alternativa equivalente mediante teclado y controles explícitos.
- El contenido, la persistencia, el LMS y la analítica del consumidor no se mezclan con la UI.
- Las dependencias se incorporan por capacidad y de forma localizada, no por número de componentes.

## Taxonomía y catálogo objetivo

### Base implementada — 15 tipos

| Área | Tipos disponibles |
|---|---|
| Tarjetas de estudio | `Flashcard` |
| Asociación y secuencia | `MatchingExercise`, `SortExercise`, `CategorizeExercise` |
| Preguntas | `SingleChoiceQuiz`, `MultiSelectQuiz`, `TrueFalseQuiz`, `FillInTheBlankQuiz`, `ShortAnswerQuiz` |
| Consulta y andamiaje | `Glossary`/`Term`, `Hint`/`Reveal` |
| Seguimiento y valoración | `ProgressIndicator`/`ProgressOverview`, `MasteryBadge`, `Rubric` |
| Presentación estructurada | `Timeline`/Steps |

Los tipos de soporte —progreso, badges, timeline, glosario— no se describen por sí solos como
técnicas que mejoran el aprendizaje.

### Primera ampliación implementada — 5 tipos

`PracticeSet`, `RetrievalPracticeSession`, `SelfExplanationPrompt`, `WorkedExample` y
`CompletionProblem` elevan el catálogo público a 20 tipos. No son aliases: cubren orquestación de
práctica, recuperación espaciada, autoexplicación, ejemplos resueltos y retirada progresiva de
andamiaje.

### Diversificación implementada — 3 tipos

`NumericQuestion`, `WordBank` y `Hotspot` amplían el catálogo a 23 tipos y a dominios cuantitativos,
lingüísticos y espaciales. El criterio para las siguientes oleadas es que cada lote cubra modos de
respuesta materialmente distintos, evitando acumular formularios textuales con pequeñas variantes.

`InteractiveMedia` eleva el catálogo a 24 tipos con una plataforma temporal común para audio y
vídeo. `SpacedRepetitionDeck` se retiró del catálogo: duplicaba la superficie de `Flashcard` y
mezclaba presentación con planificación. La recuperación activa vive en `RetrievalPracticeSession`;
la planificación entre sesiones permanece como motor headless en `@didact/spaced-repetition`.

`DataExplorer` y `BranchingScenario` amplían el catálogo a 26 tipos con dos fundamentos distintos:
datos/coordenadas y decisiones/procedimientos. `FunctionExplorer` y `ProcedureTrainer` permanecen
como recipes para no duplicar contratos.

`SimulationLab` eleva el catálogo a 27 tipos. Movimiento, física, finanzas e inventario son recipes
del mismo runtime mientras compartan parámetros, acciones, reloj, observables y snapshots.

`CodeExercise` eleva el catálogo a 28 tipos y cierra la quinta base de experiencia. JavaScript y SQL
comparten archivos, ejecución y evaluación, pero el sandbox y el grader son puertos del consumidor.
Los artefactos no ejecutables ya caben en el schema; no se publica un workspace genérico hasta
demostrar una segunda interfaz de creación materialmente distinta.

`LabelDiagram`, `ConceptMap` y `DrawingResponse` elevan el catálogo a 31 tipos con tres acciones
distintas: asignar nombres a posiciones, construir relaciones conceptuales y producir trazos libres.
Comparten coordenadas normalizadas y alternativas accesibles, pero no se fusionan porque sus
respuestas, operaciones y criterios de evaluación son materialmente diferentes.

`EquationWorkbench`, `EvidenceAnnotation` y `MeasurementLab` elevan el catálogo a 34 tipos con tres
acciones nuevas: transformar símbolos, justificar afirmaciones con evidencia y leer instrumentos
con escala, unidad y precisión. Su criterio de admisión y sus fronteras viven en
[`specs/education-components/domain-tools-foundation.md`](specs/education-components/domain-tools-foundation.md).

### Expansión restante — 8 tipos

| Oleada | Nuevos tipos | Total acumulado |
|---|---:|---:|
| Práctica activa y aprendizaje generativo (resto) | 3 | 37 |
| Evaluación textual y numérica (resto) | 3 | 40 |
| Interacciones gráficas (resto) | 2 | 42 |

## Definición de terminado por tipo educativo

Un tipo no entra en el catálogo público hasta tener:

1. propósito y límites documentados, sin exagerar la evidencia;
2. contrato declarativo de autoría, respuesta, resultado y feedback;
3. API React controlada y no controlada cuando corresponda;
4. estados vacío, parcial/streaming, deshabilitado, error y completado;
5. navegación por teclado, semántica accesible y prueba automatizada de a11y;
6. feedback informativo y sin revelar corrección antes de la acción del estudiante;
7. internacionalización de todos los textos de interfaz;
8. pruebas de comportamiento, stories representativas y estilos basados solo en tokens;
9. `ComponentManifest`, mapping semántico y registry item;
10. documentación de composición y ejemplo real en un curso.

---

## Fases 0–4 — Fundamentos y primera oleada

**Estado: terminadas.** Se conservan como historial de ejecución.

- Fase 0 produjo `requirements.md`, `design.md` y el roadmap inicial.
- Fase 1 investigó registry, primitives, styling, repetición espaciada, accesibilidad, estándares y
  encaje con SkillNet.
- Fase 2 cerró las decisiones de arquitectura y declaró el alcance amplio por oleadas.
- Fase 3 demostró build, Storybook, tests y copia mediante registry.
- Fase 3.5 creó `@didact/ui`, `@didact/theme` y las normas visuales compartidas.
- Fase 4 implementó y verificó los 16 tipos de la tabla anterior.

---

## Fase 5 — Contrato del catálogo y esquema declarativo

**Estado: terminada.**

**Entrada:** las 16 capacidades actuales y los mapas pedagógicos existentes.

**Entregables:**

- taxonomía formal que distinga `primitive`, `interaction`, `display`, `composite`, `headless` y
  `adapter`;
- `@didact/schema` con un `ComponentManifest` versionado y esquemas de autoría inspirados en H5P;
- contratos comunes de `response`, `result`, intentos, scoring y feedback;
- `@didact/events`, sin dependencia de React, con los eventos `started`, `attempted`, `answered`,
  `feedbackViewed`, `completed` y `mastered`;
- campos de manifest para propósito pedagógico, evidencia, accesibilidad, persistencia,
  dependencias opcionales y mappings QTI/xAPI;
- migraciones de esquema y validación de contenido parcial;
- manifests de los 16 tipos existentes;
- corrección de mappings ambiguos: `FillInTheBlank` escrito → `textEntryInteraction`,
  `WordBank` → `gapMatchInteraction`, `ShortAnswer` → `extendedTextInteraction`, e
  `InlineChoice` como interacción propia.

**Criterio de salida:** todo el catálogo actual puede describirse, validarse y descubrirse con el
mismo contrato sin importar sus detalles React. Los contratos se prueban además contra los diseños
de `PracticeSet`, `RetrievalPracticeSession`, `SelfExplanationPrompt`, `WorkedExample` y
`CompletionProblem` antes de congelarlos.

### Resultado

- `@didact/schema` implementa taxonomía, manifest, autoría recursiva, contenido
  completo/streaming, respuesta, resultado, feedback, versionado y validación estructurada.
- `@didact/events` implementa los seis eventos neutrales, inmutables y JSON-safe.
- `@didact/catalog` nació con 10 manifests disponibles para los 16 tipos iniciales y cinco
  contratos de diseño que ya se han promovido como implementaciones disponibles en la Fase 7.
- `specs/education-components/catalog-taxonomy.md` fija el criterio de admisión y separa UI,
  lógica headless, componentes educativos, composiciones y adaptadores.

---

## Fase 6 — Registry publicable y consumo externo

**Estado: terminada.**

**Entrada:** contrato estable de la Fase 5. Puede empezar en paralelo en los problemas ya aislados,
pero debe terminar antes de multiplicar el catálogo.

**Entregables:**

- reescritura correcta de imports `@didact/*` a rutas locales al copiar;
- instalación completa del theme y propagación del token `radius`;
- `tsconfig.json` funcional para `apps/docs`;
- catálogo navegable con filtros por propósito, formato, accesibilidad y mapping;
- política de versiones y actualización para componentes copiados;
- fixture de un consumidor React limpio, fuera del contexto del monorepo.

**Criterio de salida:** un proyecto vacío puede instalar, compilar, personalizar y ejecutar una
actividad desde el registry sin resolver manualmente imports ni depender del monorepo.

### Resultado

- El build genera 28 artefactos públicos y reescribe los imports internos a rutas locales del
  consumidor, validando recursivamente sus dependencias.
- `didact-theme` instala los tokens light/dark y la escala de radios derivada de `--radius`.
- El catálogo Storybook dispone de búsqueda y filtros por propósito, formato técnico,
  accesibilidad de teclado y fidelidad QTI.
- La política de actualizaciones copy-paste y versiones mayores está documentada y el formato se
  valida con el CLI oficial de shadcn.

---

## Fase 6.6 — Facetas, colecciones y kits descargables

**Estado: terminada.** Las nuevas plataformas nacen ya con clasificación, descubrimiento y
distribución agrupada coherentes.

**Fuente de verdad:** [`docs/distribution-collections.md`](docs/distribution-collections.md).

**Entregables:**

1. `ComponentFacets` tipado en `@didact/schema`: materias, representaciones, acciones del alumno,
   propósitos y contextos;
2. migración de los manifests disponibles desde tags implícitos hacia facetas explícitas;
3. contrato `CatalogCollection` y validación de referencias en `@didact/catalog`;
4. colecciones iniciales `Learning Essentials`, `Mathematics & Data`, `Language Learning`,
   `Visual & Spatial` y `Corporate Training`;
5. filtros por facetas y páginas de colección en el explorador de Storybook;
6. generación de kits del registry mediante `registryDependencies`, sin duplicar archivos;
7. materialización de un componente individual y un kit en el consumer fixture, y aceptación del
   kit sin archivos por la CLI oficial.

**Criterio de salida:** todos los manifests disponibles tienen facetas válidas, las colecciones no
referencian tipos draft, cada kit expone su cierre de dependencias y el consumer fixture materializa
componente y kit sin imports `@didact/*` residuales. La instalación desde URL pertenece al gate de
publicación porque requiere un host estable.

### Resultado

- `@didact/schema` define y valida las cinco dimensiones de facetas y el contrato de colección.
- Los 18 manifests disponibles están clasificados sin sustituir los tags libres.
- `@didact/catalog` publica cinco colecciones editoriales con roles y razones por componente.
- Storybook combina colección, materia, representación, acción, propósito, contexto, familia,
  rol técnico, teclado y fidelidad QTI sin duplicar entradas canónicas.
- El registry genera `learning-essentials`, `math-foundations`, `language-learning`,
  `visual-spatial` y `corporate-training` como bloques sin archivos propios.
- Tests, build, cierre recursivo de dependencias, consumer fixture y validación del kit con
  `shadcn view` están en verde.

---

## Fase 7 — Práctica activa y aprendizaje generativo

**Estado: pausada — primer lote terminado (5 de 10).** Se conserva lo implementado, pero los cinco
tipos restantes no se priorizan hasta ampliar otros campos del catálogo.

**Objetivo:** convertir las interacciones aisladas en experiencias reales de estudio y práctica.

**Orden previsto:**

1. ✅ `PracticeSet` / `QuestionSet` — navegación, intentos, entrega, revisión y resumen;
2. ✅ `RetrievalPracticeSession` — recuperación activa con scheduler y almacenamiento inyectables;
3. ✅ `SelfExplanationPrompt`;
4. ✅ `WorkedExample`;
5. ✅ `CompletionProblem` — retirada progresiva de pasos;
6. `ElaborativeQuestion`;
7. `InterleavedPracticeSet`;
8. `TeachBackPrompt`;
9. ✅ `ConceptMap`;
10. `SummarizationPrompt` guiado.

**Criterio de salida:** los diez tipos cumplen la definición de terminado y pueden componerse con
los quizzes existentes. La sumarización se documenta con cautela: su utilidad depende mucho del
diseño y de la guía, no de añadir un textarea.

---

## Fase 8 — Cobertura de evaluación textual y numérica

**Estado: pausada — 2 de 7 tipos.** El backlog se conserva para compatibilidad y cursos básicos,
pero no se implementa seguido como una cadena de controles parecidos. Sus tipos se intercalarán con
oleadas que abran nuevas representaciones.

**Tipos:**

1. ✅ `NumericQuestion`, con tolerancias, rangos y unidades;
2. `SliderQuestion`;
3. `LikertScale`;
4. `SurveyMatrix`;
5. `InlineChoice`;
6. ✅ `WordBank` / `GapMatch`;
7. `HotText` / Mark the words.

**Reglas clave:** una encuesta no tiene una respuesta “correcta”; el scoring numérico se mantiene
headless; y las variantes de teclado/lector de pantalla son parte del contrato, no mejoras tardías.

**Criterio de salida:** quedan cubiertas las principales interacciones textuales y numéricas que
hoy faltan frente a los vocabularios QTI/xAPI, sin afirmar todavía compatibilidad de importación o
exportación.

---

## Fase 9 — Interacciones gráficas accesibles

**Estado: en curso — 3 de 5 tipos.** Los tipos restantes se construirán sobre motores espaciales
compartidos para evitar cinco implementaciones incompatibles de coordenadas y arrastre.

**Tipos:**

1. ✅ `Hotspot` / `SelectPoint`;
2. ✅ `LabelDiagram`;
3. `GraphicOrder`;
4. `GraphicAssociation`;
5. ✅ `DrawingResponse`.

**Infraestructura compartida:** coordenadas resistentes al responsive, descripción larga,
movimiento mediante teclado, deshacer, alternativa sin arrastre y feedback que no dependa solo del
color o de la posición.

`dnd-kit` puede incorporarse aquí como motor localizado. No garantiza accesibilidad por sí solo:
cada acción de arrastre debe poder resolverse también mediante controles simples.

**Criterio de salida:** ninguna actividad depende exclusivamente de dragging y todas conservan una
representación de respuesta estable al cambiar el tamaño de la imagen.

### Resultado parcial de la fase gráfica

- `LabelDiagram`, `ConceptMap` y `DrawingResponse` cubren asignación espacial, construcción de redes
  y respuesta vectorial sin duplicar un único patrón.
- Anatomía/maquinaria, ciclo científico/proceso corporativo y geometría/anotación prueban amplitud.
- La frontera compartida vive en
  [`specs/education-components/spatial-construction-foundation.md`](specs/education-components/spatial-construction-foundation.md).
- `GraphicOrder` y `GraphicAssociation` permanecen pendientes y deben demostrar que no son simples
  recipes de `SortExercise`, `MatchingExercise` o `LabelDiagram`.

---

## Fase 10 — Fundamentos de experiencia

**Estado: terminada — cinco fundamentos validados y publicados.**

**Fuente de verdad:** [`docs/experience-foundations.md`](docs/experience-foundations.md).

Esta fase lleva Didact más allá de formularios sin escoger un sector por intuición. La unidad de
planificación es un motor especializado demostrado por dos casos contrastantes, no un componente
para cada asignatura ni un mega-runtime universal.

### Orden de las líneas

1. ✅ **Medios interactivos:** reloj/cues, transcript e interacciones hijas. Validado con vídeo
   de procedimiento y audio de comprensión.
2. ✅ **Datos y coordenadas:** ejes, escalas, series, puntos manipulables y tabla equivalente.
   Validado como un único `DataExplorer` experimental con función matemática y serie científica o
   empresarial; `FunctionExplorer` queda aplazado salvo evidencia contractual para separarlo.
3. ✅ **Decisiones y procedimientos:** grafo de estados, variables, condiciones, historial y
   consecuencias. Validado como un único `BranchingScenario` con conversación comercial y seguridad;
   `ProcedureTrainer` permanece como recipe mientras no exista una divergencia contractual.
4. ✅ **Sistemas y simulación:** estado, parámetros, acciones, observables, snapshots y tiempo.
   Validado con movimiento temporal visual e inventario no basado en keyframes.
5. ✅ **Artefactos y ejecución:** workspace, preview, sandbox y grader inyectables. `CodeExercise`
   valida JavaScript y SQL; el schema demuestra además un artefacto no ejecutable sin convertirlo en
   una segunda UI prematura.

La colaboración entre alumnos (`PeerReview`, coautoría, asignación de revisores) queda fuera del
horizonte de Didact/SkillNet. El producto está orientado a cursos individuales y autocontenidos;
añadir identidad, permisos, sincronización y persistencia multiusuario desviaría la arquitectura
sin resolver una necesidad del consumidor principal.

### Regla de dos verticales

Un fundamento no se congela después de un solo ejemplo. Debe demostrar dos casos de dominios
distintos que compartan authoring, estado y operaciones significativas. Si el segundo caso exige un
contrato artificial o pierde accesibilidad, la base se divide antes de publicarse.

Esto cambia el papel de los candidatos anteriores:

- ✅ `InteractiveMedia` es una experiencia available/experimental;
- `DataExplorer`/`FunctionExplorer` validan coordenadas y series;
- `BranchingScenario`/`ProcedureTrainer` validan el grafo de decisiones;
- `SimulationLab` es la experiencia general de sistemas;
- `AnimationLab` pasa a recipe o especialización provisional hasta demostrar una diferencia
  contractual real;
- `CodeExercise` utiliza el workspace, pero ejecución y evaluación permanecen desacopladas.

### Dependencias y estándares

`inkjs`, Sandpack, proveedores de medios y runtimes gráficos son adaptadores opt-in detrás de
contratos propios. QTI se usa como vocabulario y PCI como posible vía de interoperabilidad para
interacciones avanzadas; ninguno de estos modelos se convierte en la API universal de Didact.

### Criterio de salida por línea

- matriz de prioridad y comparación con catálogo/H5P/QTI/LMS;
- frontera motor/experiencia/recipe/consumidor documentada;
- dos fixtures declarativos contrastantes;
- authoring, state/response, result, feedback y eventos serializables;
- alternativa accesible sobre el mismo estado;
- API controlada, streaming, tests, stories y registry;
- decisión explícita de estabilizar, dividir o abandonar la abstracción.

Simular, animar, ramificar o añadir vídeo no se presenta por sí solo como mejora del aprendizaje.
Cada experiencia debe provocar una acción cognitiva relevante y ofrecer feedback informativo.

### Resultado de la primera línea

- `@didact/schema` publica `InteractiveMediaDefinition`, estado runtime y validación
  complete/streaming.
- Dos fixtures contrastantes demuestran vídeo corporativo y audio lingüístico con actividades hijas
  referenciadas por manifest.
- `@didact/core/InteractiveMedia` ofrece player nativo sustituible, estado controlado/no controlado,
  checkpoints temporales y accesibles fuera de la timeline, transcript navegable y finalización.
- El catálogo publica el tipo como experimental y lo incorpora a Language Learning y Corporate
  Training.
- El registry copia componente y schema sin imports `@didact/*`; fixture limpio y CLI oficial lo
  validan.

### Resultado de la segunda línea

- `DataExplorer` mantiene datos, foco, selección y edición en una única fuente de verdad compartida
  por gráfica y tabla accesible.
- Una función matemática y una serie empresarial/científica prueban escalas y acciones distintas
  sin duplicar el componente.
- Engine, experiencia, recipes y consumidor tienen responsabilidades explícitas; engine y recipes
  no inflan el catálogo educativo.
- El tipo se publica como available/experimental y se distribuye desde Mathematics & Data y
  Corporate Training.
- La decisión y el gate completos viven en
  [`specs/education-components/data-coordinate-foundation.md`](specs/education-components/data-coordinate-foundation.md).

### Resultado de la tercera línea

- `BranchingScenario` comparte un grafo serializable entre conversaciones y procedimientos.
- Condiciones y efectos modifican variables sin ejecutar código arbitrario; el historial restaura
  snapshots al retroceder.
- Conversación comercial y seguridad validan rutas, consecuencias y desenlaces distintos.
- `ProcedureTrainer` permanece como recipe y `inkjs` como adaptador opcional.
- El gate vive en
  [`specs/education-components/decision-procedure-foundation.md`](specs/education-components/decision-procedure-foundation.md).

### Resultado de la cuarta línea

- `SimulationLab` coordina un runtime determinista inyectado sin ejecutar expresiones del contenido.
- Movimiento continuo e inventario manual validan el mismo contrato de sistema.
- Los observables textuales conservan acceso al estado cuando existe una representación visual.
- `AnimationLab` y laboratorios de dominio permanecen como recipes.
- El gate vive en
  [`specs/education-components/system-simulation-foundation.md`](specs/education-components/system-simulation-foundation.md).

### Resultado de la quinta línea

- `ArtifactWorkspaceDefinition` conserva archivos, estado, solicitudes de ejecución y evaluación
  como datos serializables.
- `CodeExercise` coordina edición, salida y feedback sin ejecutar código dentro de Didact.
- JavaScript y SQL demuestran dos runtimes; un artefacto de procedimiento no ejecutable verifica que
  el schema no está acoplado al código.
- Sandpack, WebContainers, workers y graders remotos permanecen como adaptadores opt-in.
- El gate vive en
  [`specs/education-components/artifact-execution-foundation.md`](specs/education-components/artifact-execution-foundation.md).

---

## Fase 11 — Interoperabilidad opcional

**Entregables:**

- `@didact/qti`, con import/export del subconjunto QTI realmente soportado;
- `@didact/xapi`, que convierte eventos Didact en statements xAPI;
- tabla pública por tipo: compatibilidad completa, aproximada, custom o no soportada;
- fixtures contra ejemplos externos y round-trips cuando sean posibles.

**Criterio de salida:** el núcleo funciona sin estos paquetes y una integración LMS puede añadirlos
sin reinterpretar manualmente cada componente. Antes de esta fase se habla de “mapping semántico”,
no de “compatibilidad QTI/xAPI”.

---

## Fase 12 — Validación en consumidores reales

Didact no desarrolla ni mantiene un adaptador SkillNet. SkillNet y cualquier otro producto consumen
los componentes, schemas y kits públicos del registry como propietarios del código copiado.

La integración realizada en cada consumidor pertenece a su propio repositorio: composición de
cursos, persistencia, generación dinámica, theming y compatibilidad con su modelo de datos. Didact
solo recoge problemas reproducibles de su API pública y los convierte en pruebas o mejoras generales.

**Criterio de salida:** al menos un consumidor real instala un kit y varios componentes sin imports
internos, forks específicos ni condiciones que mencionen el producto consumidor dentro de Didact.

---

## Fase 13 — Medición e iteración

**Señales:** adopción por tipo, finalización, abandono, intentos, uso de pistas, revisión del
feedback, componentes copiados pero no usados y problemas de accesibilidad reportados.

**Criterio de salida:** cada ciclo produce al menos una decisión documentada de mejorar,
consolidar, dividir o retirar una capacidad usando datos reales, no solo intuición.

## Lógica headless y dependencias opcionales

No todo debe convertirse en un componente React:

| Capacidad | Lugar correcto |
|---|---|
| Scheduler SM-2/FSRS, interleaving, scoring, tolerancias | lógica headless |
| Validación, authoring schema, migrations | `@didact/schema` |
| Eventos neutrales | `@didact/events` |
| QTI XML, xAPI statements, LMS/LRS | adaptadores opcionales |
| Persistencia de intentos, mastery y archivos | consumidor/backend |
| Editor visual de cursos | producto de autoría separado |

Dependencias previstas:

- `dnd-kit`: drag-and-drop con alternativa accesible, solo en las familias que lo necesiten;
- `ts-fsrs`: únicamente si se ofrece un scheduler FSRS real junto al SM-2 existente;
- `inkjs`: adaptador de escenarios ramificados;
- Sandpack: integración opt-in de ejecución de código.

Ninguna de estas librerías es evidencia pedagógica ni debe convertirse en dependencia global.

## Fuera de alcance del núcleo

- contenido pedagógico real, bancos de preguntas y currículos;
- persistencia, autenticación, almacenamiento de archivos o un LRS;
- un authoring studio completo;
- afirmar que puntos, badges o progreso equivalen a dominio;
- prometer “adaptatividad” sin reglas, calibración y validación;
- compatibilidad QTI/xAPI antes de que los adaptadores y sus fixtures existan.
