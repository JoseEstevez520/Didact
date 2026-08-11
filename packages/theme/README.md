# @didact/theme

Tema neutro por defecto de Didact (**RF-16**): capa 2 ("styled layer") de la arquitectura de 3
capas de `specs/education-components/design.md` §2, consumida por `@didact/core` y por
`apps/docs`. Ningún componente del núcleo debe hardcodear un color/tamaño propio ni el de un
consumidor concreto (SkillNet incluido) — todo pasa por las variables de este paquete.

## Por qué existe como paquete separado

`design.md` §2 dibuja la capa 2 como "un solo lugar de theming" entre los primitivos accesibles
(capa 1) y los componentes educativos (capa 3). Extraerla a un paquete propio (en vez de vivir
dentro de `@didact/core`) permite que `apps/docs` la consuma para renderizar el catálogo con el
mismo tema exacto que verá cualquier proyecto que copie un componente, sin depender de que
`@didact/core` ya tenga implementación real.

## Decisión de producto: Tailwind v4 sí, pese a research.md P3

`specs/education-components/research.md` Pregunta 3 concluyó, con evidencia, que el mecanismo de
distribución de shadcn/ui **no exige** Tailwind (el campo `tailwind` de `registry-item.json` está
deprecated a favor de `cssVars.theme`) — esa conclusión técnica sigue siendo cierta y no se
reescribe. Lo que cambia es una **decisión de producto posterior** (Jose, 2026-08-11, ver
`../../research/decisions.md` D1): Didact adopta **Tailwind v4** (CSS-first: `@theme`, colores
OKLCH) como su capa de estilo real, por consistencia visual y como referencia de estilo alineada
con shadcn/ui — no porque el mecanismo de registry lo exigiera.

`src/tokens.css` expone el tema en **dos niveles** precisamente para no perder la ventaja que P3
identificó:

1. **CSS custom properties planas** (`:root { --didact-* }`) — el nivel que cualquier consumidor
   sobreescribe para restylear, funcione o no con Tailwind (si alguien copia un componente a un
   proyecto sin Tailwind, las variables siguen funcionando).
2. **Un bloque `@theme`** que remapea esas variables a tokens de diseño de Tailwind v4
   (`bg-didact-accent`, `rounded-didact-md`, etc.), para que los componentes de `@didact/core`
   puedan escribirse con utilidades de Tailwind sin fijar valores — Tailwind sigue leyendo la
   variable CSS de (1).

## Contenido de `src/tokens.css`

- Paleta neutra base (fondo, texto, bordes, acento).
- **Tokens de estado** (success/warning/danger) explícitamente documentados como "nunca se usan
  solos" — todo componente que los consuma debe emparejarlos con icono/texto, nunca depender solo
  del color (British Dyslexia Association Style Guide 2023 + WCAG 1.4.1 Use of Color).
- Anillo de foco visible (WCAG 2.4.7).
- Tipografía **sans-serif por defecto**, tamaños relativos (nunca `px` fijo), límite de ~60-70
  caracteres por línea (BDA Style Guide 2023).
- Duración de motion centralizada y anulada bajo `prefers-reduced-motion` (WCAG 2.3.3 + RF-13).

**Caveat honesto (mismo estándar que `research.md`):** los valores OKLCH concretos son un punto de
partida razonable trazado a los *criterios* de `research.md` P5 (contraste ≥4.5:1 texto, ≥3:1
bordes/iconos), pero **no están auditados con una herramienta real** (axe, Pa11y, etc.) todavía.
No dar el contraste por cumplido solo porque la fórmula lo sugiere — verificarlo en Fase 4 antes
de congelar la paleta.

## Dependencias

`tailwindcss` como devDependency, versión fijada (RNF-5) — ver `research/decisions.md` para el
caveat de que esta versión es una referencia a fecha de esta actualización, no verificada en vivo
contra `registry.npmjs.org` (a diferencia del resto de `research.md`, que sí lo hizo).

## Estado

Scaffold (Fase 1-3). Paleta y escalas de referencia, no auditadas ni congeladas — ajustables sin
romper el contrato de *nombres* de variable, que es lo que consumirán los componentes reales de
`@didact/core` en Fase 4.
