# apps/docs — documentación viva de Didact (plan, Fase 3)

Este directorio contendrá la documentación navegable de la librería (Storybook o equivalente),
exigida por **RF-17**: cada componente debe tener una historia con sus estados (vacío, error,
carga, correcto/incorrecto) y pasar comprobación de a11y automatizada.

## Rol dentro del monorepo

`design.md` §8 (Calidad y herramientas) le asigna dos funciones que no compiten entre sí:

1. **Catálogo navegable** para cualquier persona que quiera ver qué ofrece Didact antes de
   copiarlo (equivalente al sitio de shadcn/ui).
2. **Superficie de validación de a11y en CI**: cada historia corre un addon de accesibilidad
   automatizado, no solo se documenta "es accesible" de forma genérica — coherente con el riesgo
   que `design.md` §9 señala ("accesibilidad de buena intención sin evidencia") y con el enfoque
   de `packages/validators/` de trazar cada criterio a una fuente concreta.

## Plan (no implementado todavía)

- **Herramienta:** Storybook (o equivalente que soporte un addon de a11y maduro), sobre el tema
  neutro por defecto de `packages/core` — nunca el tema de SkillNet ni el de ningún consumidor
  concreto.
- **Una historia por componente y por estado relevante**: vacío, error, cargando,
  correcto/incorrecto — no solo el estado feliz.
- **Cada historia documenta, por componente, qué criterio WCAG concreto cumple** (referenciando
  `packages/validators/a11y/wcag-criteria.json`), no una afirmación genérica de accesibilidad.
- **Relación con la registry:** las historias deben ser consistentes con lo que describe
  `packages/registry/registry.json` — la registry es la fuente de verdad de qué se distribuye, el
  sitio de docs es la forma de explorarlo antes de copiarlo.

## Estado

Sin implementar. Depende del scaffold de build/tsconfig de la raíz (ya presente) y de que
`packages/core` tenga al menos un componente real que documentar — por eso este plan es Fase 3
del `ROADMAP.md` pero su contenido real llega con la primera oleada de componentes de Fase 4.
