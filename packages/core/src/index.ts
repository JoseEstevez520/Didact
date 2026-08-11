/**
 * @didact/core
 *
 * Punto de entrada de la capa 3 (education molecules) de la arquitectura de 3 capas descrita en
 * `specs/education-components/design.md` §2:
 *
 *   3. Education molecules  — Flashcard, MatchingExercise, QuizItem, SpacedRepetitionDeck,
 *                              Glossary, Hint, Timeline, Rubric, MasteryBadge, ejercicio de
 *                              código (RF-11, Sandpack), interacciones gráficas/numéricas de
 *                              QTI (research.md §9.2) — alcance amplio por oleadas de
 *                              complejidad, ver README.md de este paquete y research/decisions.md
 *   2. Styled layer         — Tailwind v4 + `cva` (class-variance-authority) sobre los tokens de
 *                              `@didact/theme` (CSS custom properties + bloque `@theme`)
 *   1. Accessible primitives — comportamiento accesible sin estilo propio (Radix UI por defecto,
 *                              ver research.md P2; Base UI vigilado como alternativa)
 *
 * IMPORTANTE: la implementación real de los componentes de esta capa es la Fase 4 del
 * `ROADMAP.md` (raíz del monorepo), posterior al scaffold de Fase 3 en el que vive este fichero.
 * Este paquete existe hoy solo para fijar el contrato de nombres/paquete y el punto de entrada
 * que consumirá el mecanismo de registry (`@didact/registry`) y el modelo de distribución estilo
 * shadcn/ui (`requirements.md` RF-15).
 *
 * Decisiones que sí están cerradas para cuando se implemente esta capa:
 * - Tailwind v4 SÍ es la capa de estilo del núcleo — decisión de producto de Jose (2026-08-11,
 *   ver `research/decisions.md` D1), pese a que `research.md` P3 concluyó (y sigue siendo cierto)
 *   que el mecanismo de registry de shadcn/ui no la exige técnicamente. Estilizado con Tailwind +
 *   `cva` sobre los tokens de `@didact/theme`; ver ese paquete para el detalle de los dos niveles
 *   (CSS custom properties planas + bloque `@theme`).
 * - Alcance amplio, no "v1 mínimo": las interacciones gráficas/sobre imagen y numéricas/Likert de
 *   QTI (research.md §9.2) y el ejercicio de código (RF-11, apoyado en Sandpack para la
 *   ejecución) SÍ están en alcance, como oleadas de mayor complejidad — no descartadas. Ver
 *   `research/decisions.md` D2 y `packages/validators/pedagogy/qti-mapping.json`
 *   (`scope: "planned"` en las interacciones antes marcadas como fuera de v1).
 * - Cualquier dependencia externa no copiada (p. ej. la capa de primitivos, o Tailwind/cva en sí)
 *   se fija con versión exacta + test de deriva (RNF-5, ver `@didact/validators/drift`).
 * - Cada componente debe poder describirse con props completas o incompletas sin asumir que
 *   llegan de una vez (RNF-4, pensado para consumo en streaming).
 *
 * No se exporta nada todavía: no hay componentes reales que exportar en esta fase.
 */

export {};
