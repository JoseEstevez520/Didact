# research/ — índice de artefactos de investigación

Este directorio contiene los artefactos crudos de la **Fase 1 (deep research)** del
`ROADMAP.md`, cuyo resultado sintetizado y con recomendaciones explícitas vive en
`../specs/education-components/research.md`.

## Cómo se relacionan las piezas

1. **`../ROADMAP.md`** — fija que la Fase 1 debía responder, con evidencia citada, a las 8
   preguntas abiertas de `../specs/education-components/requirements.md` §6.
2. **`../specs/education-components/research.md`** — el informe consolidado, con una sección por
   pregunta, evidencia citada y una recomendación explícita. Es la **fuente de verdad** para
   cualquier decisión de diseño posterior (Fase 2 en adelante) — nada en `packages/validators/`
   ni en el resto del monorepo debería contradecirlo sin actualizarlo primero.
3. **`reports/`** — los 4 informes crudos que alimentaron esa síntesis, producidos por 4 agentes
   en paralelo: A (preguntas 1-3, stack técnico), B (preguntas 4-6, pedagogía/estándares), C
   (preguntas 7-8, adaptador SkillNet), D (lote complementario de fuentes aportadas por el dueño
   del producto, base de la §9 de `research.md`). Se conservan como material de trazabilidad —
   para verificar una afirmación de `research.md` contra su fuente original sin tener que
   re-investigar.
4. **`sources/bibliography.md`** — bibliografía completa de las URLs citadas en `research.md`,
   agrupada por tema, con una línea por fuente explicando por qué importa y su estado de
   verificación.
5. **`decisions.md`** — registro fechado de **decisiones de producto posteriores** a la Fase 1
   que anulan una recomendación puntual de `research.md` con conocimiento de causa (no la
   contradicen por descuido). Hoy documenta dos: adoptar Tailwind v4 pese a que P3 concluyó que no
   es técnicamente obligatorio (D1), y un alcance amplio por oleadas de complejidad en vez del
   framing de "fuera de v1" para las interacciones gráficas/numéricas de §9.2 (D2).

## Estándar de honestidad

Heredado de `openui-adoption.md` §1 y aplicado en `research.md`: donde la evidencia no es
concluyente, se dice explícitamente ("no verificado", "no está claro, y esto es lo que faltaría
medir"). Una respuesta inventada no es un resultado válido de investigación; un "no lo sé"
fundamentado sí lo es. Los informes de `reports/` y la bibliografía de `sources/` mantienen el
mismo estándar.
