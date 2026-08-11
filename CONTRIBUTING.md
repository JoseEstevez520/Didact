# Contribuir a Didact

Este repositorio es hoy (Fase 1-3 del `ROADMAP.md`) un **scaffold documental**: contiene la
investigación que fundamenta el diseño, los validadores científicos (datos machine-readable) y
la estructura de paquetes del monorepo, pero todavía no la implementación de los componentes
educativos (eso es la Fase 4).

## Antes de proponer un cambio

1. Lee `ROADMAP.md` para entender en qué fase está el proyecto y qué se espera de cada una.
2. Lee `specs/education-components/requirements.md`, `design.md` y `research.md` — son la fuente
   de verdad de qué se construye y por qué. No se acepta un componente o una decisión de diseño
   que contradiga `requirements.md` §0 (propósito general, modelo shadcn) sin abrir antes una
   discusión que actualice el spec.
3. Cualquier acoplamiento a SkillNet (tokens de `design-system.md`, el catálogo generativo v2,
   idioma, supuestos de producto) va en `adapters/skillnet/`, nunca en `packages/*`. La pregunta
   de guarda es siempre: "¿esto tiene sentido para alguien que nunca ha oído hablar de SkillNet?".

## Estructura del monorepo

- `packages/core` — capa 3 (componentes educativos), capa 2 (theming) y su relación con la capa 1
  (primitivos accesibles).
- `packages/spaced-repetition` — algoritmos de repetición espaciada tras una interfaz agnóstica.
- `packages/registry` — el `registry.json` que describe el catálogo de componentes distribuible
  vía el mecanismo estilo shadcn/ui.
- `packages/validators` — los validadores científicos: datos de accesibilidad, evidencia
  pedagógica, esquema declarativo de componentes y control de deriva de dependencias.
- `adapters/skillnet` — documentación de la frontera con SkillNet (sin código; el código del
  adaptador vive en el repo de SkillNet).
- `apps/docs` — plan de documentación viva (Storybook), pendiente de Fase 3.
- `research/` — artefactos de investigación (informes crudos + bibliografía).

## Convenciones

- Cada paquete es `"private": true`, versión `0.0.0` hasta que exista un mecanismo de publicación
  real (ver `packages/registry/README.md`).
- No se añaden dependencias externas sin fijar versión exacta y documentar el motivo (RNF-5,
  ver `packages/validators/drift/`).
- No se exige Tailwind en el núcleo (ver `research.md` P3): la base de theming son CSS custom
  properties.
- Commits y PRs en español o inglés, indistintamente, pero consistentes dentro de un mismo PR.
- No se incluyen archivos de configuración de asistentes de IA en el repo (`.gitignore` los
  excluye explícitamente).
