# Arquitectura del catálogo y de Storybook

**Estado:** fuente de verdad del producto  
**Ámbito:** Didact como biblioteca pública y SkillNet como consumidor, nunca como límite del catálogo  
**Relacionado:** `ROADMAP.md`, `specs/education-components/catalog-taxonomy.md`, `apps/docs/README.md`

La estrategia de descubrimiento y descargas agrupadas se define en
[`docs/distribution-collections.md`](distribution-collections.md).
La selección y validación de motores reutilizables se define en
[`docs/experience-foundations.md`](experience-foundations.md).

## Visión

Didact debe servir tanto a quien necesita una pregunta o una tarjeta sencilla como a quien construye
una clase de matemáticas, un laboratorio de animación, una simulación corporativa o una práctica de
código. SkillNet es el primer caso de uso exigente: genera cursos e interfaces desde datos
declarativos. No obstante, los contratos, nombres y componentes de Didact deben seguir siendo útiles
fuera de SkillNet.

El objetivo no es maximizar el número de exports. Es ampliar de forma deliberada los tipos de
conocimiento que pueden representarse y las acciones que puede realizar el alumno.

## Modelo de crecimiento

Cada experiencia se entiende en cinco niveles:

1. **Propósito educativo:** presentar, explorar, practicar, recordar, evaluar, crear, reflexionar,
   simular o colaborar.
2. **Representación:** texto, números, símbolos, datos, espacio, imagen, tiempo, audio, procedimientos,
   sistemas, redes o artefactos.
3. **Acción del alumno:** inspeccionar, seleccionar, escribir, ordenar, relacionar, manipular,
   construir, experimentar, interpretar, explicar, crear o ejecutar.
4. **Herramienta reutilizable:** el componente o motor que combina representación, interacción,
   feedback y accesibilidad.
5. **Caso concreto:** la configuración utilizada en una asignatura, sector o curso.

Una asignatura no es la unidad arquitectónica superior. Una misma herramienta puede servir a varias:
un plano cartesiano puede representar funciones matemáticas, movimiento, oferta y demanda o una curva
de dosis. El caso concreto debe ser normalmente una configuración, recipe o story, no un componente
duplicado.

## Capas del producto

| Capa | Qué contiene | Ejemplos |
| --- | --- | --- |
| Fundamentos | Primitivas visuales sin intención pedagógica completa | Button, Card, Input |
| Patrones educativos | Interacciones generales aplicables a muchos cursos | preguntas, práctica, feedback, progreso |
| Dominios de representación | Herramientas con un modelo de conocimiento específico | gráficas, símbolos, diagramas, audio, tiempo |
| Plataformas de experiencia | Composites manipulativos que reúnen motores y patrones | AnimationLab, SimulationLab, CodeExercise |
| Recipes de curso | Ejemplos configurados para un contexto real | compliance, animación, álgebra, onboarding |
| Infraestructura | Lógica y adaptadores no presentados como widgets | scoring, eventos, QTI, xAPI, persistencia |

La estrategia es en forma de T: una base común sólida y, sobre ella, experiencias verticales
concretas. No se intenta abstraer todo antes de validar un caso real ni se crean widgets aislados sin
un contrato compartido.

## Navegación canónica de Storybook

Storybook refleja las capas del producto, no la estructura accidental de archivos:

```text
00 Start here
  Catalog
  Architecture

01 Foundations
  Actions
  Forms
  Layout
  Feedback

02 Learning patterns
  Content & scaffolding
  Questions & assessment
  Practice & memory
  Generative learning
  Relationships & ordering
  Progress & mastery
  Orchestration

03 Representation domains
  Language & writing
  Mathematics & data
  Visual & spatial
  Time, audio & animation
  Symbols & structures

04 Experience platforms
  Scenarios & simulation
  Code & technical practice
  Creative tools

05 Course recipes
  Corporate learning
  Creative learning
  Technical learning
  Science & data
```

Las secciones vacías representan dirección de producto; no se rellenan con componentes genéricos
solo para aparentar cobertura.

### Una sola ubicación por componente

Cada componente público tiene una única entrada canónica en el árbol. Sus aplicaciones secundarias
se encuentran mediante búsqueda, tags y el explorador del catálogo.

- `NumericQuestion` vive en `Mathematics & data`, aunque también pueda usarse en ciencia.
- `Hotspot` vive en `Visual & spatial`, aunque pueda formar parte de una evaluación.
- una gráfica de física y una gráfica de economía son recipes de `FunctionExplorer`, no dos exports;
- un escenario de ventas y uno de compliance son recipes de `BranchingScenario`.

Un archivo de stories no debe esconder varios componentes públicos. Cada componente tiene su propio
`Meta`, su propia entrada y sus estados debajo.

### Stories estándar

Las stories no cuentan como componentes duplicados. Documentan estados del mismo contrato. Se usan
solo cuando sean relevantes:

1. `Overview`: caso representativo y comprensible sin configuración previa.
2. `Playground`: controles útiles para explorar la API.
3. `Real example`: uso realista en un curso.
4. estados de interacción o resultado: correcto, incorrecto, parcial o enviado.
5. `Streaming` o carga progresiva.
6. `Disabled` o solo lectura.
7. `Empty`.
8. alternativa accesible cuando la interacción visual lo necesite.

No se crean stories vacías para cumplir una lista. Los estados equivalentes pueden combinarse cuando
eso haga la navegación más clara.

## Regla contra duplicados

Antes de admitir un nuevo componente se completa una comparación con el catálogo existente. Debe
aportar al menos una diferencia sustancial y justificar por qué no es una variante:

- nuevo modelo de representación;
- nueva acción significativa del alumno;
- modelo de autoría o respuesta diferente;
- validación o feedback propios del dominio;
- contrato de accesibilidad específico;
- composición estable que coordina varias interacciones.

Si solo cambia el contenido, la asignatura, el aspecto, el texto, la dificultad, la cardinalidad o el
proveedor, se implementa como configuración, variant, slot o recipe.

Aliases no incrementan el recuento. Los motores headless, adapters y primitives se publican cuando
son útiles, pero se cuentan fuera de los tipos educativos dirigidos al autor.

## Ficha obligatoria para nuevas propuestas

Toda propuesta del roadmap debe registrar:

```text
Nombre:
Problema educativo:
Representación principal:
Acción principal del alumno:
Rol: interaction | display | composite | headless | adapter
Qué reutiliza:
Solapamiento con componentes existentes:
Por qué no es una variante:
Modelo de autoría, respuesta y resultado:
Feedback y evaluación:
Contrato de accesibilidad:
Mappings QTI/xAPI:
Dependencias opcionales:
Recipes iniciales:
```

## Estrategia de expansión

Las oleadas nuevas deben ampliar cobertura, no producir tres variantes del mismo patrón. Como regla
de planificación, una oleada no incorpora dos componentes con la misma combinación de representación
y acción principal, salvo que exista una diferencia de contrato demostrable.

La próxima expansión se organiza como una cartera de fundamentos contrastados:

1. **Medios interactivos:** timeline de medios, cues, transcript e interacciones hijas.
2. **Matemáticas y datos:** plano cartesiano, escalas, series y tabla equivalente.
3. **Decisiones y procedimientos:** grafo de estado, condiciones y consecuencias.
4. **Sistemas y simulación:** parámetros, acciones, observables y tiempo opcional.
5. **Creación técnica:** workspace, ejecución segura y feedback para artefactos.
6. **Colaboración:** submissions y revisión con identidad/persistencia inyectadas.

`AnimationLab` deja de ser el piloto predeterminado. Es un posible caso de validación del fundamento
de simulación, que debe contrastarse con un dominio no basado en keyframes antes de estabilizarse.

Cada plataforma debe entregar un contrato declarativo generable por IA, una API controlada, soporte
de datos parciales, feedback, eventos, una alternativa accesible, tests y al menos un recipe completo.

## Relación con SkillNet

SkillNet consume Didact como ensamblador de experiencias. Selecciona un componente compatible con el
objetivo, produce su configuración declarativa y compone una lección. No debe generar JSX arbitrario
ni convertir presets de SkillNet en contratos públicos de Didact.

La compatibilidad con generación dinámica exige que los componentes:

- acepten datos serializables y versionados;
- sean deterministas ante la misma configuración;
- toleren streaming y datos parciales sin romperse;
- separen respuesta, evaluación, feedback y persistencia;
- no revelen soluciones antes de la acción prevista;
- emitan eventos estables sin asumir backend;
- permitan traducción y tematización;
- definan límites seguros para código, medios o contenido no confiable.

## Gobierno de la fuente de verdad

- Este documento gobierna la estructura y crecimiento del catálogo.
- `docs/distribution-collections.md` gobierna facetas, colecciones y kits descargables.
- `docs/experience-foundations.md` gobierna la prioridad y validación de motores y experiencias.
- `specs/education-components/catalog-taxonomy.md` gobierna el contrato de admisión.
- `ROADMAP.md` decide el orden y estado de implementación.
- `@didact/catalog` contiene los manifests ejecutables.
- Storybook demuestra los componentes disponibles; no inventa disponibilidad.
- El registry distribuye lo que el catálogo marca como disponible.

Un cambio de familia, nombre público o ubicación canónica debe actualizar estas fuentes en el mismo
cambio para evitar que documentación, catálogo y distribución diverjan.
