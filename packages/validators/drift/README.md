# @didact/validators/drift

Control de deriva de dependencias externas no copiadas — RNF-5 de `requirements.md`.

## Por qué existe

El modelo de distribución de Didact (RF-15, estilo shadcn/ui) protege al consumidor de romperse
por una actualización de dependencia **para el código que copia**. Pero no todos los componentes
son 100% copy-paste: la capa 1 de la arquitectura (`design.md` §2, "accessible primitives",
candidata Radix UI) es una dependencia real, no código que se copie junto al componente. `design.md`
§9 lo dice explícitamente: *"el modelo copy-paste protege a los componentes, no a sus dependencias
internas de comportamiento"*.

**RNF-5** exige que cualquier dependencia en esa situación se fije con **versión exacta** (no
rango `^`/`~`) y lleve un **test de deriva** — el mismo estándar que `openui-adoption.md` ya exigía
para `@openuidev/react-lang`, cuyo incumplimiento (una dependencia externa que rompía en cada
versión menor) es precisamente el problema que motivó adoptar el modelo shadcn en primer lugar
(`requirements.md` §0.2).

## El caveat Radix/React 19 (research.md P2)

`research.md` Pregunta 2 documenta, con `peerDependencies.react` consultado en vivo contra
`registry.npmjs.org`, que **hoy** la versión `latest` de Radix UI (`@radix-ui/react-dialog`
1.1.23) declara su peer de React 19 anclado a `19.0.0-rc.1`, no a `^19.0.0` — con `npm` (no
pnpm/yarn) esto exige `--legacy-peer-deps`/`--force` para instalar en un proyecto con React 19
estable. La propia documentación de shadcn/ui lo confirma
(https://ui.shadcn.com/docs/react-19), y Radix ya tiene el fix en una v1.2.0 **en RC**, no
promovida a `latest` a fecha de la investigación (2026-08-11).

**Consecuencia práctica para este validador:** si Radix UI (u otra dependencia de la capa 1) se
adopta como dependencia fijada, `pinned-deps.json` debe registrar no solo la versión exacta sino
el **motivo** (aquí: fricción de peer-dependency conocida, no bloqueo funcional), para que quien
actualice la fije con conocimiento de causa y no como una actualización rutinaria. Lo mismo
aplicaría a `ts-fsrs` si se elige como dependencia fijada para el modo avanzado de repetición
espaciada (ver `@didact/spaced-repetition/src/fsrs.ts`), o a `dnd-kit` si se adopta para mitigar
el incumplimiento de WCAG 2.5.7 en RF-3 (`research.md` §9.3 — compatibilidad con React 19 **no
confirmada** en documentación oficial, solo en fuente secundaria).

## `pinned-deps.json`

Placeholder con la estructura `{dependency, exactVersion, reason}` y un ejemplo **comentado**, no
una dependencia real instalada — no hay dependencias externas todavía en este scaffold (Fase
1-3). Se puebla en Fase 4 a medida que `packages/core` adopte primitivos reales.

## Estado

Sin test de deriva ejecutable todavía. La intención (Fase 4) es un test en CI que compare la
versión instalada de cada dependencia listada aquí contra `exactVersion` y falle si difieren,
obligando a una actualización deliberada (revisar changelog, no solo `npm update`).
