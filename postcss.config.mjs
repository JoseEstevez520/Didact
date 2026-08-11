/**
 * Config de PostCSS de referencia a nivel de monorepo, para Tailwind v4 (CSS-first: `@theme`,
 * colores OKLCH — ver https://ui.shadcn.com/docs/tailwind-v4, citado en
 * `specs/education-components/research.md` P3).
 *
 * Decisión de producto (2026-08-11, ver `research/decisions.md` D1): Didact adopta Tailwind como
 * capa de estilo, aunque `research.md` P3 documentó que el mecanismo de registry de shadcn/ui no
 * lo exige técnicamente. Jose elige usarlo de todos modos por consistencia visual y como
 * referencia de estilo estilo shadcn/ui.
 *
 * Tailwind v4 simplifica el pipeline de PostCSS a un solo plugin (`@tailwindcss/postcss`); ya no
 * hace falta `autoprefixer` ni `postcss-import` por separado.
 *
 * Este fichero es la referencia compartida del monorepo. Cada app/paquete que compile CSS real
 * (p. ej. `apps/docs` en Fase 3, o `packages/core` cuando tenga componentes reales en Fase 4)
 * puede extenderlo o copiarlo según su propio bundler — no hay build real todavía que lo consuma
 * (scaffold, Fase 1-3).
 */
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
