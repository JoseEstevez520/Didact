# @didact/spaced-repetition

Algoritmos de repetición espaciada para el componente `SpacedRepetitionDeck` (RF-2 de
`requirements.md`), tras una **interfaz agnóstica de persistencia**: el scheduler nunca guarda
nada, solo recibe y devuelve estado — el proyecto consumidor decide dónde vive (localStorage,
base de datos propia, etc.).

## Contrato (`src/types.ts`)

```ts
type ReviewState = Record<string, unknown>; // opaco: SM2State | FSRSState | LeitnerState
type ReviewGrade = "again" | "hard" | "good" | "easy";
interface ReviewResult { state: ReviewState; dueAt: Date; }
interface SpacedRepetitionScheduler {
  createInitialState(): ReviewState;
  schedule(state: ReviewState, grade: ReviewGrade, now?: Date): ReviewResult; // pura, sin efectos
  preview?(state: ReviewState, now?: Date): Record<ReviewGrade, ReviewResult>;
}
```

Interfaz tomada literalmente de `specs/education-components/research.md` Pregunta 4, derivada de
cómo `ts-fsrs` ya resuelve el mismo problema de diseño.

## Algoritmos

### SM-2 (`src/sm2.ts`) — por defecto

~40-60 líneas de aritmética pura, cero dependencias, 35+ años en producción (SuperMemo, y Anki
hasta 2023). Evidencia "media" según la tabla de `research.md` P4 — suficiente para ser el
default por su simplicidad y coste cero, no por ser el algoritmo más preciso disponible.
Fórmulas verificadas contra la especificación original de SuperMemo y Wikipedia (citadas en el
fichero). Stub documentado; implementación aritmética completa pendiente de Fase 4.

### FSRS (`src/fsrs.ts`) — modo avanzado

Modela cada tarjeta con Dificultad/Estabilidad/Recuperabilidad y 19 pesos; scheduler por defecto
de Anki desde 2023, evidencia "alta" (supera a SM-2 en benchmarks del propio proyecto FSRS).
`research.md` deja dos vías abiertas para cuando se implemente (ninguna decidida en Fase 1):

1. Reimplementar solo el scheduler con pesos por defecto (100-250 líneas, sin el optimizador de
   ML, que es caro y evitable para un MVP), copiado como código propio.
2. Adoptar `ts-fsrs` (MIT, TypeScript nativo) como **dependencia externa fijada con versión
   exacta + test de deriva** (mismo patrón RNF-5 que la capa de primitivos de `@didact/core`),
   aceptando su coste de mantenimiento a cambio de mejor evidencia. `ts-fsrs` es un paquete
   multi-módulo publicado en npm, no un fichero trivial de copiar — de ahí que se trate como
   dependencia fijada y no como copy-paste puro.

### Leitner — no incluido como algoritmo principal

`research.md` lo descarta como algoritmo por defecto (demasiado burdo: 1 entero, una caja) y lo
reserva como posible "modo simple" opcional, no implementado en este scaffold.

## Lo no negociable

Sea cual sea el algoritmo activo, siempre se expone tras la interfaz agnóstica de arriba — cambiar
de algoritmo no debe romper a los consumidores que ya integraron `SpacedRepetitionDeck`.

## Estado

Scaffold (Fase 1-3 del `ROADMAP.md`). Ambos schedulers son stubs que documentan el contrato y
las fórmulas/decisiones de referencia; lanzan si se invocan. Implementación real en Fase 4.
