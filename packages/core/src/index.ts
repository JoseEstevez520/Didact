/**
 * @didact/core
 *
 * Punto de entrada de la capa 3 (education molecules) de la arquitectura de 3 capas descrita en
 * `specs/education-components/design.md` §2:
 *
 *   3. Education molecules  — Flashcard, MatchingExercise, QuizItem, SpacedRepetitionDeck,
 *                              Glossary, Hint, Timeline, Rubric, MasteryBadge…
 *   2. Styled layer         — tema neutro, restyleable vía CSS custom properties (capa 2)
 *   1. Accessible primitives — comportamiento accesible sin estilo propio (Radix UI por defecto,
 *                              ver research.md P2; Base UI vigilado como alternativa)
 *
 * IMPORTANTE: la implementación real de los componentes de esta capa es la Fase 4 del
 * `ROADMAP.md` (raíz del monorepo), posterior al scaffold de Fase 3 en el que vive este fichero.
 * Este paquete existe hoy solo para fijar el contrato de nombres/paquete y el punto de entrada
 * que consumirá el mecanismo de registry (`@didact/registry`) y el modelo de distribución estilo
 * shadcn/ui (`requirements.md` RF-15).
 *
 * Decisiones que sí están cerradas para cuando se implemente esta capa (ver research.md):
 * - Tailwind NO es obligatorio en el núcleo (research.md P3): la base de theming son CSS custom
 *   properties / clases planas; una variante Tailwind es opcional, no la base.
 * - Cualquier dependencia externa no copiada (p. ej. la capa de primitivos) se fija con versión
 *   exacta + test de deriva (RNF-5, ver `@didact/validators/drift`).
 * - Cada componente debe poder describirse con props completas o incompletas sin asumir que
 *   llegan de una vez (RNF-4, pensado para consumo en streaming).
 *
 * No se exporta nada todavía: no hay componentes reales que exportar en esta fase.
 */

export {};
