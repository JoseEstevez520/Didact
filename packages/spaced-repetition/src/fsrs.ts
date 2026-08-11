/**
 * FSRS — modo avanzado de repetición espaciada de Didact (opcional, no el default).
 *
 * Fuente: `specs/education-components/research.md` Pregunta 4 y §9.3.
 *
 * FSRS (Free Spaced Repetition Scheduler) modela cada tarjeta con Dificultad/Estabilidad/
 * Recuperabilidad (DSR) y 19 pesos por defecto; es el scheduler por defecto de Anki desde 2023 y
 * supera a SM-2 en los benchmarks del propio proyecto (evidencia "alta" en la tabla de
 * research.md, frente a "media" de SM-2). El coste es mayor: 100-250 líneas si se reimplementa el
 * scheduler con pesos por defecto (sin el optimizador de ML, evitable para un MVP), o adoptar la
 * librería ya publicada.
 *
 * research.md deja DOS vías abiertas explícitamente (no cerradas en Fase 1, a decidir cuando se
 * implemente este módulo):
 *
 *   (a) Reimplementar solo el scheduler de FSRS con los pesos por defecto (sin optimizador),
 *       copiado como código propio — coherente con el modelo shadcn (RF-15), pero es trabajo de
 *       verificación numérica no trivial (19 pesos, fórmulas de estabilidad/dificultad).
 *       Referencias: https://github.com/open-spaced-repetition/fsrs4anki ,
 *       https://borretti.me/article/implementing-fsrs-in-100-lines
 *
 *   (b) Adoptar `ts-fsrs` (MIT, TypeScript nativo, sin dependencias runtime pesadas, no persiste
 *       nada — mismo contrato que RF-2 exige) como DEPENDENCIA EXTERNA FIJADA con versión exacta
 *       + test de deriva, bajo el mismo patrón que ya exige RNF-5 para Radix UI (ver
 *       `@didact/validators/drift`). Referencia: https://github.com/open-spaced-repetition/ts-fsrs
 *       Nota de research.md: `ts-fsrs` es un paquete multi-módulo publicado en npm, no un fichero
 *       trivial de copiar — de ahí que se trate como dependencia fijada y no como copy-paste.
 *
 * Ninguna de las dos vías está decidida en Fase 1. Este fichero fija el contrato de tipos para
 * que, sea cual sea la vía elegida en Fase 4, el resto de la librería (y sus consumidores) no
 * necesiten saber cuál es — exactamente el propósito de la interfaz agnóstica de `types.ts`.
 *
 * ESTADO: stub documentado. Sin implementación (Fase 4 del ROADMAP).
 */

import type {
  ReviewGrade,
  ReviewResult,
  ReviewState,
  SpacedRepetitionScheduler,
} from "./types";

/**
 * Forma interna del estado FSRS (research.md P4, tabla de algoritmos): Estabilidad, Dificultad,
 * número de repeticiones, número de lapsos (fallos) y la fecha de la última revisión.
 */
export interface FSRSState extends ReviewState {
  /** Estabilidad de la memoria (S). */
  stability: number;
  /** Dificultad de la tarjeta (D). */
  difficulty: number;
  /** Repeticiones totales. */
  reps: number;
  /** Lapsos (fallos) totales. */
  lapses: number;
  /** Fecha de la última revisión, para calcular el intervalo transcurrido en `schedule`. */
  lastReviewedAt: Date | null;
}

/**
 * Scheduler FSRS. Implementación pendiente (Fase 4) — la elección entre reimplementar el
 * scheduler a mano (vía a) o adoptar `ts-fsrs` como dependencia fijada (vía b) se toma en ese
 * momento, no en este scaffold.
 */
export const fsrsScheduler: SpacedRepetitionScheduler = {
  createInitialState(): FSRSState {
    return {
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      lastReviewedAt: null,
    };
  },

  schedule(_state: ReviewState, _grade: ReviewGrade, _now?: Date): ReviewResult {
    throw new Error(
      "@didact/spaced-repetition/fsrs: implementacion pendiente (Fase 4 del ROADMAP). " +
        "Ver research.md P4 y las dos vias documentadas en este fichero (scheduler propio vs. ts-fsrs fijado).",
    );
  },
};
