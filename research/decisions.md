# Decisiones de producto posteriores a la Fase 1

Registro fechado de decisiones que el dueño del producto (Jose) tomó **después** de que
`specs/education-components/research.md` (Fase 1, 2026-08-11) entregara su síntesis. Estas
decisiones no reescriben la investigación — sus hallazgos y recomendaciones siguen siendo válidos
tal como están documentados — pero **anulan una recomendación concreta** por una elección de
producto explícita. Se documentan aquí para que quede claro qué es "lo que dice la evidencia" y
qué es "lo que decidió el dueño con conocimiento de esa evidencia", sin mezclar ambas cosas en el
propio `research.md`.

---

## D1 — Tailwind v4 adoptado como capa de estilo (anula la elección por defecto de P3)

**Fecha:** 2026-08-11.

**Lo que dice `research.md` (sigue siendo cierto, no se reescribe):** Pregunta 3 concluye, con
evidencia citada, que el mecanismo de registry de shadcn/ui **no exige** Tailwind (el campo
`tailwind` de `registry-item.json` está deprecated a favor de `cssVars.theme`), y recomienda no
exigirlo como peer dependency del núcleo para no comprometer el objetivo de "cualquier proyecto
React".

**Decisión de producto:** Jose elige **usar Tailwind v4 igualmente**, por consistencia visual y
como referencia de estilo alineada con shadcn/ui — no porque el mecanismo de distribución lo
obligara. Esto no contradice la investigación (que habla de lo que el mecanismo *exige*, no de lo
que el dueño *prefiere*); es una capa de decisión distinta que la Fase 1 dejó explícitamente fuera
de su alcance ("no decide arquitectura", ROADMAP.md Fase 1).

**Qué cambia en el scaffold:**
- Nuevo paquete `packages/theme` (`@didact/theme`): tema neutro (RF-16) en CSS custom properties +
  bloque `@theme` de Tailwind v4 (CSS-first, OKLCH) — capa 2 de `design.md` §2.
- `packages/core` pasa a documentar su capa de estilo como **Tailwind + `cva`** sobre los tokens
  de `@didact/theme`, en vez de "CSS custom properties / clases planas sin Tailwind".
- `postcss.config.mjs` en la raíz del monorepo, con `@tailwindcss/postcss`.
- Dependencias fijadas (RNF-5, sin instalar todavía — scaffold): `tailwindcss` 4.1.11,
  `@tailwindcss/postcss` 4.1.11, `postcss` 8.4.49, `class-variance-authority` 0.7.1.

**Caveat honesto (mismo estándar que `research.md`):** las versiones de arriba son una referencia
razonable a la fecha de esta actualización, **no verificadas en vivo contra
`registry.npmjs.org`** como sí hizo `research.md` P1/P2 para Radix/React Aria/Ariakit/Base UI.
Confirmar la versión estable real de cada paquete antes de instalar en Fase 4.

**Lo que NO cambia:** el tema neutro sigue siendo restyleable vía CSS custom properties planas
(nivel 1 de `@didact/theme`) — un consumidor sin Tailwind en su proyecto puede seguir
sobreescribiendo esas variables; lo que Tailwind aporta es una capa adicional de utilidades sobre
esas mismas variables, no un reemplazo del mecanismo de restyling.

---

## D2 — Alcance amplio y ambicioso (revierte el framing de "fuera de v1")

**Fecha:** 2026-08-11.

**Lo que dice `research.md` (sigue siendo cierto):** §9.2 identifica que la familia de
interacciones gráficas/sobre imagen y numéricas/Likert de IMS QTI 3.0 no tiene RF asignado en
`requirements.md` §4.1 — un hallazgo de alcance real, no un error de nomenclatura. La
recomendación original de la síntesis era declarar esa familia "fuera de v1, candidata a v2" en
vez de dejarla descartada sin decirlo.

**Decisión de producto:** Jose quiere cubrir **"todo lo educativo que se pueda, con buen
estilo"** — desde ejercicios de emparejar/arrastrar hasta ejercicios de código y componentes
complejos — organizado en **oleadas de complejidad**, no como un recorte de "v1 mínimo" que deja
fuera lo difícil. Esto no contradice el hallazgo de alcance de `research.md` (sigue siendo cierto
que hoy no hay RF asignado a esas interacciones); cambia qué se hace con ese hallazgo: en vez de
"descartar hasta v2", se declara **planificado**.

**Qué cambia en el scaffold:**
- `packages/validators/pedagogy/qti-mapping.json`: el bloque antes llamado `gapsFueraDeV1` pasa a
  `gapsPlanificados`; cada interacción mantiene `"gap": true` (sigue sin tener RF asignado hoy) y
  suma `"scope": "planned"` + `"phase": "oleada-avanzada"`.
- Se añade un bloque `codeExercise` para **RF-11** (ejercicio de código, apoyado en Sandpack para
  la ejecución — research.md §9.3) con el mismo `scope: "planned"`.
- `README.md` raíz y `packages/core/README.md` describen el alcance como amplio y por oleadas de
  complejidad, no como "v1 recortado".

**Lo que NO cambia:** el orden real de implementación sigue basándose en la evidencia pedagógica
de `research.md` §9.1 (RF-2/RF-4 con el respaldo más fuerte) y en la tabla de aptitud del
adaptador SkillNet (Pregunta 7) — "alcance amplio" no significa "sin prioridad"; significa que lo
más complejo entra en una oleada posterior, no que quede fuera para siempre.

---

## Cómo se relaciona esto con el resto del repo

Ver `research/README.md` para cómo encajan `research.md`, `reports/`, `sources/` y este documento.
Ninguna decisión de este fichero requiere reabrir o corregir `research.md` — ambas cosas son
ciertas a la vez: la investigación describe lo que el mecanismo/los datos permiten o recomiendan
por defecto, y este documento describe lo que el dueño del producto decidió hacer con esa
información.
