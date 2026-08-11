/**
 * SM-2 — algoritmo de repetición espaciada por defecto de Didact.
 *
 * Fuente: `specs/education-components/research.md` Pregunta 4. Fórmulas verificadas contra:
 * - https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 (especificación original)
 * - https://en.wikipedia.org/wiki/SM-2_(algorithm)
 *
 * Por qué SM-2 es el default (research.md P4):
 * - ~40-60 líneas de aritmética pura, cero dependencias externas.
 * - 35+ años en producción (SuperMemo, Anki hasta 2023, y aún hoy como opción).
 * - Evidencia "media" en la tabla de research.md (frente a "alta" en FSRS, pero FSRS cuesta
 *   100-250 líneas y una elección de librería externa — ver `fsrs.ts`).
 *
 * Parámetros del algoritmo (verificados en las fuentes de arriba):
 * - Factor de facilidad (EF) inicial: 2.5, con suelo de 1.3 (nunca baja de ahí).
 * - Calificación de calidad de respuesta q en [0,5] en la especificación original; este módulo
 *   la deriva del vocabulario `ReviewGrade` de `types.ts` (again/hard/good/easy) para mantener
 *   una única escala de calificación en toda la librería (ver mapeo abajo).
 * - q >= 3 (acierto): se recalcula EF y crece el intervalo (I) multiplicándolo por EF.
 * - q < 3 (fallo): se reinicia el contador de repeticiones y el intervalo vuelve a 1 día.
 *
 * ESTADO: stub documentado. La implementación aritmética completa es trabajo de Fase 4 del
 * `ROADMAP.md` (primera oleada de componentes); este fichero fija el contrato de tipos y las
 * fórmulas de referencia para que esa implementación no tenga que re-investigarlas.
 */

import type {
  ReviewGrade,
  ReviewResult,
  ReviewState,
  SpacedRepetitionScheduler,
} from "./types";

/** Forma interna del estado SM-2, ver research.md P4 (tabla de algoritmos). */
export interface SM2State extends ReviewState {
  /** Número de repeticiones correctas consecutivas. */
  repetitions: number;
  /** Factor de facilidad. Inicial 2.5, suelo 1.3. */
  easinessFactor: number;
  /** Intervalo actual en días hasta la próxima revisión. */
  intervalDays: number;
}

const INITIAL_EASINESS_FACTOR = 2.5;
const MINIMUM_EASINESS_FACTOR = 1.3;

/**
 * Mapeo de `ReviewGrade` (vocabulario común de la librería) a la escala de calidad q∈[0,5] de la
 * especificación SM-2 original. "again"/"hard" caen por debajo del umbral q=3 (fallo, reinicia
 * repeticiones); "good"/"easy" lo superan (acierto, crece el intervalo).
 */
export const SM2_GRADE_TO_QUALITY: Record<ReviewGrade, number> = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};

/**
 * Scheduler SM-2. Implementación pendiente (Fase 4) — de momento lanza si se invoca, para que un
 * consumo accidental en tiempo de ejecución sea explícito en vez de devolver datos incorrectos.
 */
export const sm2Scheduler: SpacedRepetitionScheduler = {
  createInitialState(): SM2State {
    return {
      repetitions: 0,
      easinessFactor: INITIAL_EASINESS_FACTOR,
      intervalDays: 0,
    };
  },

  schedule(_state: ReviewState, _grade: ReviewGrade, _now?: Date): ReviewResult {
    throw new Error(
      "@didact/spaced-repetition/sm2: implementacion pendiente (Fase 4 del ROADMAP). " +
        "Formulas de referencia y contrato de tipos ya fijados en este fichero y en research.md P4.",
    );
  },
};

// Reexportado para dejar constancia del suelo documentado en research.md, aunque no se use aún
// en la rama de implementación (evita que quede "mágico" cuando se implemente schedule()).
export const __SM2_MINIMUM_EASINESS_FACTOR = MINIMUM_EASINESS_FACTOR;
