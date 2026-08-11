/**
 * Interfaz agnóstica de repetición espaciada.
 *
 * Fuente: `specs/education-components/research.md` Pregunta 4 ("¿Qué algoritmo de repetición
 * espaciada es razonable sin dependencia pesada, y cómo se diseña su API para que sea agnóstica
 * de dónde se persiste el estado?"). La interfaz de abajo es la propuesta EXACTA de research.md,
 * derivada de cómo `ts-fsrs` ya resuelve el mismo problema.
 *
 * Contrato clave (RF-2 de `requirements.md`): el scheduler NUNCA persiste nada. Recibe el estado
 * actual, devuelve el estado siguiente; el proyecto consumidor decide dónde vive ese estado
 * (localStorage, base de datos propia, etc.). Esto es lo que permite que SkillNet u otro
 * consumidor lo integren sin que la librería imponga un modelo de almacenamiento.
 */

/**
 * Estado de revisión de una tarjeta. Deliberadamente opaco a nivel de tipo: cada algoritmo define
 * su propia forma interna (SM2State: n/EF/I; FSRSState: S/D/reps/lapses/fechas; LeitnerState: caja
 * entera) sin que el consumidor necesite conocerla — solo debe guardarla y devolverla tal cual.
 */
export type ReviewState = Record<string, unknown>;

/**
 * Calificación que el usuario da a su propio recuerdo tras ver la respuesta. Vocabulario tomado
 * de FSRS/Anki (research.md P4), reutilizable también para un scheduler SM-2 mapeando
 * "again"/"hard" a fallo (q<3) y "good"/"easy" a acierto (q>=3).
 */
export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * Resultado de programar una revisión: el nuevo estado opaco a persistir y la fecha en la que la
 * tarjeta vuelve a estar due. `SpacedRepetitionDeck` (capa por encima, en `@didact/core`, RF-2)
 * usa `dueAt` para decidir qué tarjeta mostrar a continuación.
 */
export interface ReviewResult {
  state: ReviewState;
  dueAt: Date;
}

/**
 * Contrato que implementa cada algoritmo (SM-2, FSRS, y opcionalmente Leitner como "modo simple").
 * `schedule` es una función pura: mismo (state, grade, now) siempre produce el mismo resultado,
 * sin efectos secundarios ni I/O — condición necesaria para que sea agnóstica de persistencia.
 */
export interface SpacedRepetitionScheduler {
  /** Crea el estado inicial de una tarjeta nueva (primera vez que se ve). */
  createInitialState(): ReviewState;

  /** Calcula el siguiente estado y la próxima fecha de revisión dada una calificación. Pura. */
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult;

  /**
   * Opcional: adelanta el resultado de cada calificación posible sin aplicarla, útil para mostrar
   * al usuario "si dices 'good' volverá en 4 días" antes de que decida.
   */
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
