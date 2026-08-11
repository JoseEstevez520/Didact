# Requirements — Librería de Componentes de Educación

> Spec-Driven Development (SDD). Este documento fija el **qué** y el **por qué** antes de
> diseñar (`design.md`) o planificar tareas (`../../ROADMAP.md`). No prescribe implementación.

## 0. Decisiones del dueño del producto (2026-08-11)

Registradas aquí porque acotan todo lo que sigue — no son conclusiones de investigación, son
dirección de producto:

1. **Es una librería de propósito general, no un módulo de SkillNet.** Debe poder usarse "en
   cualquier proyecto", no solo en `repo/` (SkillNet). SkillNet es el **primer consumidor real**
   (donde nació la necesidad y donde se probará primero), pero no es el criterio de diseño.
   Cualquier acoplamiento a decisiones específicas de SkillNet (tokens de
   `design-system.md`, el catálogo generativo v2) se trata como **adaptador opcional**, nunca
   como parte del núcleo.
2. **Estilo y modelo de distribución de referencia: shadcn/ui.** No como paquete npm
   versionado, sino como **registry + CLI que copia el código fuente del componente al
   proyecto consumidor** ("copy-paste ownership"). Motivo explícito: evita exactamente el
   riesgo que SkillNet ya vivió con `@openuidev/react-lang` 0.2.x
   (`repo/docs/design/openui-adoption.md` §1, §3) — una dependencia externa que rompe en cada
   versión menor. Con el modelo shadcn, el consumidor es dueño del código desde el momento en
   que lo copia; no hay upgrade que le rompa nada sin que él lo decida.

Estas dos decisiones se verifican con evidencia en la fase de investigación (¿el mecanismo de
"registry" de shadcn permite de verdad construir una registry propia, no oficial? ¿la capa de
primitivos en la que se apoya shadcn —Radix UI— funciona bien en React 19?) pero **la dirección
no está abierta a debate** salvo que la investigación encuentre un impedimento técnico real.

## 1. Contexto y problema

Construyendo contenido en SkillNet (`../../repo`, plataforma de formación para pymes que
convierte documentos internos en cursos) se topó un hueco general de la industria, no solo de
ese proyecto:

1. **No hay un vocabulario de componentes de e-learning comúnmente aceptado**, al nivel en que
   sí existe para UI genérica (shadcn/ui, Radix, MUI…). Cada plataforma de formación reinventa
   flashcards, ejercicios de emparejar, quizzes, repetición espaciada, etc.
2. **No hay una base "famosa" que sirva de referencia de estilo y arquitectura** para construir
   ese vocabulario con buena accesibilidad y buena ergonomía de desarrollo — de ahí la decisión
   §0.2 de usar shadcn/ui como referencia de forma (headless + Tailwind + copy-paste), no de
   contenido (los componentes de shadcn son genéricos, no educativos).

SkillNet, en concreto, tiene además:
- v1 (estático): lecciones en Markdown + ejercicios fijos.
- v2 (dinámico): catálogo cerrado de bloques (`apps/skillnet-web/src/components/courses/kit/`)
  para generación de UI por agente, sin reactividad (`openui-adoption.md`).

Esto es contexto de origen y un caso de prueba real, no la definición del producto.

## 2. Alcance

### Dentro de alcance (núcleo)

- Un **vocabulario de componentes educativos** (flashcards, ejercicios de emparejar/arrastrar,
  variantes de quiz, repetición espaciada, glosario, hints, progreso/mastery, timeline, rúbrica,
  etc.) reutilizable en cualquier proyecto React.
- Un **modelo de distribución estilo shadcn**: registry (catálogo descriptivo, JSON o
  equivalente) + mecanismo para copiar el código fuente al proyecto consumidor, sin dependencia
  npm versionada como forma primaria de consumo.
- Un **tema visual neutro por defecto**, no el de SkillNet ni el de ningún consumidor concreto,
  con theming vía tokens/CSS custom properties para que cada proyecto lo adapte a su marca
  (igual que un componente de shadcn adopta el tema de quien lo copia).
- Accesibilidad de primera clase, incluida neurodiversidad (ver §4.2), independiente de quién
  consuma la librería.
- Documentación viva (Storybook o equivalente) que sirva tanto de catálogo navegable como de
  registry para el mecanismo de copia.

### Adaptador SkillNet (opcional, fuera del núcleo)

- Mapeo del tema neutro del núcleo a los tokens de `../../repo/docs/design/design-system.md`.
- Registro de los componentes que sean estáticamente seguros como bloques del catálogo
  generativo v2 de SkillNet (`apps/skillnet-web/src/components/courses/kit/`), sujeto a las
  reglas de `openui-adoption.md` — esto vive documentado como **integración de un consumidor
  concreto**, no como requisito de la librería.

### Fuera de alcance (por ahora)

- Reactividad tipo `Mutation`/`Query`/`$state` en cualquier variante generativa (ver
  `openui-adoption.md` §6 para las condiciones si algún día se activa — no es una decisión de
  esta librería).
- Primitivos de UI genérica ya cubiertos por shadcn/ui mismo (Button, Input, Dialog…). Esta
  librería es de **componentes pedagógicos**; para lo genérico, el consumidor usa shadcn/ui
  directamente y esta librería se apoya en los mismos primitivos cuando tenga sentido (a
  confirmar en investigación).
- Autoría de contenido pedagógico (bancos de preguntas, currícula).
- Backend / persistencia de progreso. Los componentes son de presentación e interacción.

## 3. Interesados

- **Jose (product owner).** Decide alcance, estilo de referencia (§0) y prioridad.
- **Agentes implementadores** (fase de ejecución, otra sesión). Consumen este spec y
  `../../ROADMAP.md` como contrato de trabajo.
- **Cualquier proyecto consumidor**, empezando por SkillNet pero sin limitarse a él — incluye
  potenciales usuarios open source si la librería se publica como registry pública.
- **Alumnos finales** de los proyectos que la consuman, incluyendo perfiles neurodivergentes.

## 4. Requisitos funcionales

Formato EARS. IDs estables para referenciar desde `design.md` y desde las tareas del roadmap.

### 4.1 Vocabulario de componentes (núcleo, agnóstico de consumidor)

- **RF-1**: EL SISTEMA DEBERÁ proveer un componente `Flashcard` (frente/dorso, volteo, marcar
  como "sabido"/"repasar").
- **RF-2**: EL SISTEMA DEBERÁ proveer un componente de **repetición espaciada** que ordene un
  mazo de `Flashcard`s según un algoritmo de revisión (SM-2 o equivalente), desacoplado del
  almacenamiento (recibe/devuelve estado, no lo persiste — cada proyecto consumidor decide dónde
  guardarlo).
- **RF-3**: EL SISTEMA DEBERÁ proveer componentes de **ejercicio de emparejar/arrastrar**
  (matching, ordenar secuencia, clasificar en categorías) con soporte de teclado, no solo
  drag-and-drop de ratón.
- **RF-4**: EL SISTEMA DEBERÁ proveer variantes de quiz más allá de opción múltiple única:
  multi-respuesta, verdadero/falso, rellenar hueco, respuesta abierta corta con verificación
  asistida.
- **RF-5**: EL SISTEMA DEBERÁ proveer un componente `Glossary`/`Term` con tooltip o popover que
  no requiera navegación fuera del contenido.
- **RF-6**: EL SISTEMA DEBERÁ proveer un componente `Hint`/`Reveal` (pista progresiva,
  mostrar/ocultar solución) que no filtre la respuesta correcta en el DOM hasta que el usuario
  la solicite explícitamente.
- **RF-7**: EL SISTEMA DEBERÁ proveer indicadores de **progreso/mastery** (por lección, por
  skill) con un tema visual neutro, restyleable.
- **RF-8**: EL SISTEMA DEBERÁ proveer un componente `Timeline`/`Steps` para procesos
  secuenciales (protocolos, procedimientos paso a paso).
- **RF-9**: EL SISTEMA DEBERÁ proveer un componente de **checkpoint sobre vídeo** (pausa en un
  timestamp y plantea una pregunta), agnóstico del reproductor concreto en la medida de lo
  posible (a confirmar en investigación, ver §6).
- **RF-10**: EL SISTEMA DEBERÁ proveer un componente `Rubric`/autoevaluación (checklist de
  criterios con niveles, sin nota automática si el criterio es subjetivo).
- **RF-11**: EL SISTEMA PODRÁ proveer un componente de **ejercicio de código** (editor con
  resaltado + comprobación) — prioridad baja hasta validar interés real.

*(Lista de alcance, no la priorización final — eso lo fija `design.md` tras investigación.)*

### 4.2 Accesibilidad y neurodiversidad (núcleo)

- **RF-12**: CUANDO un componente tenga estado interactivo, EL SISTEMA DEBERÁ exponerlo vía
  ARIA de forma operable con teclado y lector de pantalla, sin depender solo de color.
- **RF-13**: EL SISTEMA DEBERÁ respetar `prefers-reduced-motion` en toda animación.
- **RF-14**: EL SISTEMA DEBERÁ evitar patrones que penalicen a usuarios neurodivergentes
  identificados en investigación (límites de tiempo no configurables, densidad visual alta,
  animación no solicitada) — criterios concretos a definir tras §6.

### 4.3 Distribución y theming (núcleo)

- **RF-15**: EL SISTEMA DEBERÁ distribuirse mediante un mecanismo tipo registry + CLI que copie
  el código fuente del componente al proyecto consumidor, siguiendo el modelo de shadcn/ui
  (§0.2), no como dependencia npm versionada como vía primaria.
- **RF-16**: EL SISTEMA DEBERÁ exponer su theming vía tokens/CSS custom properties, con un tema
  por defecto neutro y documentado; ningún componente debe hardcodear la paleta de un consumidor
  concreto (SkillNet incluido).
- **RF-17**: CADA componente DEBERÁ tener una historia de Storybook (o equivalente) con sus
  estados (vacío, error, carga, correcto/incorrecto) y pasar comprobación de a11y automatizada.

### 4.4 Adaptador SkillNet (fuera del núcleo, opcional)

- **RF-18**: EL ADAPTADOR SkillNet DEBERÁ mapear el tema neutro del núcleo a los tokens de
  `design-system.md` sin modificar los componentes del núcleo.
- **RF-19**: CADA componente candidato al catálogo generativo v2 de SkillNet DEBERÁ declararse
  sin capacidad de mutación no autorizada, para poder registrarse en
  `apps/skillnet-web/src/components/courses/kit/` sin reabrir `openui-adoption.md`.

## 5. Requisitos no funcionales

- **RNF-1 (bundle):** los componentes deben ser tree-shakeable / copiables de forma
  independiente; consumir uno no debe arrastrar el resto.
- **RNF-2 (i18n):** ningún texto fijo embebido sin punto de extensión para traducción — el
  núcleo no asume un framework de i18n concreto (SkillNet usa `react-intl`; otro consumidor
  puede usar otro).
- **RNF-3 (seguridad):** ningún componente ejecuta HTML/markdown sin sanitizar proveniente de
  contenido no confiable.
- **RNF-4 (rendimiento):** los componentes que puedan usarse en contextos de streaming (como el
  catálogo generativo de SkillNet) no deben asumir que todas sus props llegan completas de una
  vez — esto es un requisito del núcleo aunque nazca de un caso de adaptador, porque hace al
  componente más robusto en general.
- **RNF-5 (mantenimiento y dependencias):** cualquier dependencia externa que no sea copiada
  (p. ej. la capa de primitivos si se apoya en Radix UI) debe fijarse con versión exacta y un
  test de deriva — mismo estándar que ya exige `openui-adoption.md` para `@openuidev`. El propio
  modelo de distribución (§0.2, RF-15) minimiza este riesgo para los componentes en sí, no para
  sus dependencias internas de comportamiento.

## 6. Preguntas abiertas para la fase de investigación

1. ¿El mecanismo de "registry" de shadcn/ui (CLI `shadcn add <url>`, `registry.json`) permite
   construir una **registry propia y privada/independiente**, no oficial de shadcn, con
   componentes distintos? ¿Qué implica en la práctica (hosting del JSON, esquema exacto,
   límites conocidos)?
2. ¿Qué base de primitivos accesibles conviene (Radix UI —la que usa shadcn—, React Aria/
   Ariakit, Base UI)? ¿Funciona bien en React 19 con evidencia ejecutada, no solo anunciada?
3. ¿La librería debe exigir Tailwind CSS como peer dependency (como shadcn) o debe poder
   consumirse sin Tailwind en el proyecto destino? Esto condiciona qué tan "cualquier proyecto"
   es realista.
4. ¿Qué algoritmo de repetición espaciada es razonable sin dependencia pesada (SM-2 vs
   alternativas), y cómo se diseña su API para que sea agnóstica de dónde se persiste el estado?
5. ¿Qué patrones de accesibilidad para neurodiversidad tienen evidencia real (no intuición):
   fuentes, densidad, control de tiempo, animación — con qué guías (WCAG 2.2, CAST/UDL, guías de
   dislexia/TDAH/autismo con respaldo)?
6. ¿Qué librerías/estándares de e-learning existentes aportan vocabulario o interoperabilidad a
   considerar (H5P content types, Open edX XBlocks, IMS QTI/LTI, xAPI/SCORM), aunque no se
   adopten como dependencia?
7. Específico del adaptador SkillNet: ¿qué componentes del inventario §4.1 son expresables sin
   reactividad dentro de las 7 reglas de `openui-adoption.md` §5.2, y cuáles quedan aparcados?
8. Específico del adaptador SkillNet: ¿hay reproductor de vídeo ya elegido en `skillnet-web` que
   soporte checkpoints (RF-9), o es una capacidad a evaluar desde cero?

## 7. Criterios de aceptación de este documento

- Cada requisito funcional tiene un ID estable referenciable desde tareas.
- La distinción núcleo / adaptador SkillNet es explícita en cada requisito, no implícita.
- Las preguntas de investigación (§6) son concretas y bastan para dar un brief a un agente de
  investigación sin contexto adicional.
- No contiene decisiones de arquitectura más allá de las ya fijadas en §0 por el dueño del
  producto (eso vive en `design.md`).
