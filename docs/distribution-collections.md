# Facetas, colecciones y kits descargables

**Estado:** implementado y verificado
**Ámbito:** descubrimiento e instalación del catálogo público de Didact
**Relacionado:** `docs/catalog-architecture.md`, `packages/catalog`, `packages/registry`, `ROADMAP.md`

## Decisión

Didact ofrecerá tres formas complementarias de consumir la biblioteca:

1. **Componente individual:** para quien sabe exactamente qué necesita.
2. **Colección:** para descubrir componentes relacionados con una materia, capacidad o contexto.
3. **Kit descargable:** para instalar de una vez una selección mantenida y sus dependencias.

Una colección o un kit referencia componentes existentes; no crea copias ni incrementa el recuento
de tipos educativos. Un componente conserva una única identidad, manifest, implementación y entrada
canónica de Storybook aunque participe en varias colecciones.

## Problema que resuelve

La jerarquía de Storybook debe ser estable y legible, por lo que cada componente aparece allí una
sola vez. Sin embargo, las necesidades de descubrimiento son multidimensionales:

- un docente puede buscar «matemáticas»;
- una empresa puede buscar «compliance» o «onboarding»;
- un diseñador instruccional puede buscar «práctica» o «evaluación»;
- un desarrollador puede buscar «drag and drop», «streaming» o «QTI».

Duplicar el componente en cada carpeta fragmentaría la documentación. Las facetas y colecciones
permiten esas vistas cruzadas sin duplicar código ni contratos.

## Modelo conceptual

| Concepto | Responsabilidad | Ejemplo |
| --- | --- | --- |
| Componente | Unidad pública instalable y versionada | `numeric-question` |
| Faceta | Metadato estructurado para búsqueda y filtrado | `subject: mathematics` |
| Tag | Palabra libre para rasgos específicos no cubiertos por facetas | `tolerance` |
| Colección | Selección editorial para explorar un campo o caso de uso | Mathematics & Data |
| Kit | Colección instalable con dependencias resueltas | `math-foundations` |
| Recipe | Ejemplo de composición y contenido para un curso | Introducción a funciones lineales |

Las colecciones y los kits no son necesariamente equivalentes. Una colección puede ser amplia y
permitir selección manual; un kit debe ser deliberadamente pequeño, coherente y mantenible.

## Facetas estructuradas

Los manifests admiten `tags`, pero los tags libres no bastan como taxonomía estable. Se conservan
para búsqueda secundaria y se complementan con facetas tipadas obligatorias.

### Facetas iniciales

```ts
interface ComponentFacets {
  subjects: readonly SubjectFacet[];
  representations: readonly RepresentationFacet[];
  learnerActions: readonly LearnerActionFacet[];
  purposes: readonly LearningPurposeFacet[];
  contexts?: readonly LearningContextFacet[];
}
```

Vocabulario inicial:

```text
subjects
  general, language, mathematics, science, data,
  business, creative, technical, humanities

representations
  text, numeric, symbolic, data-series, spatial, image,
  temporal, audio, video, procedural, system, network, artifact

learnerActions
  inspect, select, respond, write, order, relate, manipulate,
  construct, calculate, experiment, interpret, explain, create,
  execute, decide, collaborate

purposes
  present, explore, practice, retrieve, assess, scaffold,
  reflect, create, simulate, collaborate, orchestrate

contexts
  self-paced, classroom, corporate, compliance,
  onboarding, instructor-led, technical-training
```

Los valores son uniones cerradas y versionadas en `@didact/schema`. Añadir valores
es compatible; renombrarlos requiere migración o alias explícito.

### Reglas de asignación

- `subjects` indica una relación directa y habitual, no cualquier uso imaginable.
- `representations` describe el modelo de conocimiento que el componente entiende.
- `learnerActions` describe acciones significativas, no eventos de UI como `click`.
- `purposes` expresa intención pedagógica y puede solaparse con las familias existentes; durante la
  implementación se decidirá si se deriva de `families` o necesita información adicional.
- `contexts` se usa solo cuando el componente tiene un encaje distintivo; no se marcará todo como
  `self-paced` o `classroom` por defecto.
- propiedades como edad, nivel, dificultad o idioma pertenecen normalmente al contenido configurado,
  no al componente.
- los tags libres no usarán prefijos que dupliquen una faceta estructurada.

Ejemplo real del contrato:

```ts
{
  id: "didact.numeric-question",
  facets: {
    subjects: ["mathematics", "science", "data"],
    representations: ["numeric"],
    learnerActions: ["calculate", "respond"],
    purposes: ["practice", "assess"]
  },
  tags: ["units", "tolerance", "range"]
}
```

## Contrato de colección

Las colecciones viven en `@didact/catalog`, separadas de `ComponentManifest` para no mezclar la
identidad de un componente con decisiones editoriales que cambian con más frecuencia.

Contrato implementado (resumido):

```ts
interface CatalogCollection {
  id: string;
  version: string;
  slug: string;
  title: string;
  description: string;
  kind: "foundation" | "subject" | "context" | "experience";
  status: "draft" | "available" | "deprecated";
  facets?: Partial<ComponentFacets>;
  items: readonly CollectionItem[];
  tags?: readonly string[];
  kit?: {
    name: string;
    includeRoles: readonly CollectionItem["role"][];
  };
}

interface CollectionItem {
  manifestId: string;
  typeId?: string;
  role: "required" | "recommended" | "optional";
  reason: string;
}
```

`manifestId` referencia una identidad estable del catálogo, nunca una ruta de archivo. `typeId`
permite seleccionar un tipo concreto cuando un manifest agrupa una familia. La validación impedirá
referencias inexistentes, slugs repetidos y colecciones disponibles que dependan de tipos draft.

## Colecciones iniciales

### Learning Essentials

Patrones generales para cursos online: preguntas, pistas, práctica, feedback y progreso. Es la puerta
de entrada para quien no necesita herramientas de una disciplina concreta.

### Mathematics & Data

Comenzará con `NumericQuestion`, `WorkedExample` y `CompletionProblem`. Incorporará
`FunctionExplorer`, `DataExplorer` y herramientas simbólicas cuando estén disponibles.

### Language Learning

Incluye `WordBank`, respuestas construidas, glosario, autoexplicación y práctica de recuperación.

### Visual & Spatial

Comienza con `Hotspot` y crecerá con diagramas, anotación, geometría y respuestas gráficas.

### Corporate Training

Incluye `PracticeSet`, `Rubric`, progreso y recuperación. `BranchingScenario` y los entrenadores de
procedimientos serán sus futuras piezas principales.

Las futuras colecciones `Creative Learning`, `Animation` y `Technical Training` se publicarán solo
cuando tengan componentes distintivos disponibles; no se crearán como carpetas vacías para inflar
la oferta.

## Kits descargables

Un kit es un item del registry generado desde una colección o desde un subconjunto explícito de ella.
Declara los items individuales mediante `registryDependencies`; no vuelve a empaquetar sus archivos.

Ejemplos de nombres reservados:

```text
learning-essentials
math-foundations
language-learning
visual-spatial
corporate-training
technical-training
animation-starter
```

Los seis kits se generan ya como artefactos `registry:block` sin archivos propios. Mientras no
exista un host o namespace estable, pueden inspeccionarse en `packages/registry/public/r/`. Cuando
el namespace público esté configurado, la experiencia será:

```sh
# Componente individual
shadcn add @didact/numeric-question

# Kit curado
shadcn add @didact/math-foundations
```

Los nombres de kit ya son estables en el registry local. Los comandos con `@didact/*` requieren
todavía publicar y configurar el namespace en el `components.json` del consumidor.

### Reglas de los kits

- Un kit instala componentes y dependencias; no crea una segunda implementación.
- Cada dependencia aparece una sola vez aunque varios componentes la compartan.
- `didact-theme` se resuelve mediante la dependencia común del registry.
- Los items requeridos siempre se incluyen; los opcionales se muestran en catálogo pero no se
  instalan automáticamente salvo decisión explícita del kit.
- Un kit no incluirá todos los componentes de una materia por defecto. Debe permitir un comienzo útil
  sin imponer peso o dependencias innecesarias.
- Los cambios breaking siguen la política de majors del registry. Un kit publicado no apuntará en
  silencio a un major incompatible.
- La generación debe fallar si una referencia no está disponible, si aparece un ciclo o si el cierre
  de dependencias contiene imports locales sin resolver.

## Experiencia de descubrimiento

El explorador del catálogo ofrece:

- búsqueda textual;
- filtros combinables por materia, representación, acción, propósito y contexto;
- vista por colecciones;
- distinción visible entre componente, colección y kit; los recipes se añadirán cuando exista su
  primer contrato ejecutable;
- estado `available`/`planned` sin mezclar componentes no publicados con descargas reales;
- nombre estable del kit; el comando público se mostrará cuando exista un host estable;
- listado previo de qué instalará un kit y qué dependencias externas añade.

Storybook mantiene una entrada canónica por componente. Las vistas por materia se construyen en el
explorador desde metadatos; no se duplican stories.

## Arquitectura de implementación

```text
@didact/schema
  ComponentFacets + CatalogCollection + validadores

@didact/catalog
  manifests + facetas + definiciones de colecciones

apps/docs
  filtros + páginas de colección + comandos de instalación

@didact/registry
  items individuales + kits generados con registryDependencies
```

El schema oficial de shadcn sigue gobernando los artefactos descargables. Los metadatos educativos
no se añaden como campos arbitrarios a `registry-item.json`; pertenecen al catálogo. Los kits usan
`registry:block` sin archivos y con `registryDependencies`. El build, el schema y `shadcn view`
confirman que el CLI oficial acepta ese formato.

## Secuencia implementada

1. ✅ Añadir vocabularios y `ComponentFacets` a `@didact/schema` con validación y tests.
2. ✅ Migrar los manifests actuales desde tags implícitos hacia facetas explícitas sin eliminar tags
   útiles.
3. ✅ Añadir `CatalogCollection`, validación de referencias y las seis colecciones disponibles.
4. ✅ Extender el explorador de Storybook con filtros y páginas de colección.
5. ✅ Generar seis kits del registry y validar su cierre de dependencias.
6. ✅ Materializar un componente y `math-foundations` en el consumer fixture; validar además el kit
   con `shadcn view`.
7. ⏳ Publicar el host/namespace antes de documentar `@didact/*` como comando ejecutable.

Esta secuencia se completa antes de la oleada de fundamentos de experiencia, de modo que las nuevas
plataformas nazcan ya clasificadas y puedan incorporarse a colecciones y kits sin otra migración.

## Definición de terminado

- Facetas tipadas y validadas en todos los manifests disponibles.
- Colecciones con IDs únicos y referencias comprobadas.
- Ninguna colección duplica manifiestos o archivos.
- El explorador puede combinar al menos dos facetas.
- Cada kit muestra exactamente qué instala.
- Build del registry, tests de catálogo y consumer fixture en verde.
- Materialización completa de un componente individual y un kit en el consumer fixture, y
  aceptación del kit por la CLI oficial. La instalación desde URL queda como gate de publicación,
  porque requiere un host estable.
- Documentación clara de versión, actualización, desinstalación manual y propiedad del código copiado.

## Fuente de verdad

- Este documento gobierna descubrimiento, colecciones y descargas agrupadas.
- `docs/catalog-architecture.md` gobierna la arquitectura general y la navegación canónica.
- `@didact/schema` es el contrato ejecutable.
- `@didact/catalog` es la fuente de metadatos y colecciones disponibles.
- `packages/registry/registry.json` seguirá siendo la fuente de items descargables.
- Los artefactos de `packages/registry/public/r/` serán resultados generados y verificables.
