# @didact/validators/a11y

Datos machine-readable de accesibilidad, derivados de `specs/education-components/research.md`
Pregunta 5. `wcag-criteria.json` es el contrato mínimo no negociable del núcleo: WCAG 2.2 AA
completo, tratando el criterio AAA 2.3.3 como obligatorio también.

## Por qué WCAG 2.2 (y no solo "buenas intenciones")

`design.md` §9 marca explícitamente el riesgo de "accesibilidad de buena intención sin evidencia".
`research.md` responde con evidencia jerarquizada por fuerza probatoria:

1. **WCAG 2.2** (normativo) — la evidencia más fuerte, con nivel A/AA/AAA explícito.
2. **CAST/UDL 3.0** (marco de investigación de neurociencia, no checklist).
3. **W3C WAI-COGA** (guía suplementaria a WCAG, consenso de grupo de trabajo con investigación de
   usuarios sobre TDAH/autismo/dislexia/discalculia).
4. **British Dyslexia Association** (guía de estilo práctica, respaldo institucional, sin ensayos
   citados punto por punto).

Las cuatro son evidencia real pero de distinto peso — `wcag-criteria.json` documenta solo la
categoría 1 (normativa) en detalle estructurado; las categorías 2-4 informan requisitos como
densidad visual, tipografía y control de ritmo (RF-14) mencionados en `research.md` §5.2-5.4 pero
no se han convertido aún a JSON en este scaffold.

## El caso 2.5.7 Dragging Movements

Incluido explícitamente porque `research.md` §9.4 lo señala como un matiz que es fácil pasar por
alto: RF-3 pide "soporte de teclado, no solo drag-and-drop", pero **teclado no es lo mismo que
"single pointer sin arrastre"**. `dnd-kit` da navegación por teclado de serie, pero eso no
garantiza automáticamente el patrón que 2.5.7 exige en sentido estricto: "seleccionar origen →
seleccionar destino" con un solo clic/toque cada vez, sin necesidad de mantener presionado ni
arrastrar. Ese patrón debe implementarse explícitamente en los ejercicios de emparejar/ordenar de
RF-3; no se puede dar 2.5.7 por cumplido solo porque el componente responde a teclado.

## El ángulo legal: EN 301 549 / European Accessibility Act

`research.md` §9.4 documenta que la accesibilidad deja de ser solo un compromiso ético y pasa a
ser un **requisito de venta**: EN 301 549 es el estándar europeo armonizado que referencia WCAG en
su capítulo 9, y desde el **28 de junio de 2025** es exigible bajo la European Accessibility Act
(EAA) también a empresas privadas que venden a consumidores en la UE. Esto refuerza RF-12–17 como
requisitos de primera clase, no aspiracionales.

**No verificado (dicho explícitamente, como exige el estándar de honestidad de `research.md`):**
según fuentes secundarias, la versión de EN 301 549 actualmente vigente referenciaría WCAG **2.1**,
anterior a 2.2 — por lo que el criterio 2.5.7 (introducido en 2.2) podría no estar todavía
incorporado literalmente al texto legal armonizado. Antes de usar EN 301 549 como argumento legal
preciso ante un cliente, confirmar contra el texto oficial de EN 301 549 qué versión de WCAG
referencia exactamente.

## Estado

Datos completos para la categoría normativa (WCAG). Sin validador ejecutable todavía (Fase 4): la
intención es que estos datos alimenten un lint/test de a11y automatizado por componente (RF-17),
no solo servir de documentación.
