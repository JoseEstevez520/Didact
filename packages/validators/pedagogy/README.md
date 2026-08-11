# @didact/validators/pedagogy

Datos machine-readable sobre la base pedagógica y la interoperabilidad de reporting de los
componentes del núcleo, derivados de `specs/education-components/research.md` §6 (Pregunta 6) y
§9.1-9.2.

## `evidence.json` — fuerza de evidencia por requisito

`research.md` §9.1 introduce una dimensión que el spec original no tenía: **no todos los
componentes del inventario tienen el mismo respaldo de investigación educativa**. Fuentes:

- **Dunlosky et al. 2013**: de 10 técnicas de estudio evaluadas, solo *practice testing* y
  *distributed practice* tienen utilidad **alta**; *highlighting*/*rereading*, **baja**. Esto da a
  **RF-2** (repetición espaciada = distributed practice) y **RF-4** (quiz usado como practice
  testing) el respaldo más fuerte del inventario. **RF-5** (Glossary como consulta pasiva) no lo
  tiene por analogía con las técnicas de baja utilidad — de ahí que `research.md` recomiende que
  fuerce recuperación activa en vez de ser solo consulta.
- **RF-9/RF-10/RF-11 quedan explícitamente "no evaluadas"** por estas fuentes — no es que carezcan
  de valor, es que no hay evidencia de esta investigación que se pronuncie sobre ellas.
- Candidatos **fuera del inventario actual** (Fiorella & Mayer: `SelfExplanation`, `ConceptMap`;
  Sitzmann: escenario ramificado/simulación) quedan registrados como propuesta v2, no como RF
  existente — ver el bloque `candidatosFueraDeInventario` del JSON.

## El requisito de "slot de feedback informativo" (Hattie)

**Wisniewski, Zierer & Hattie 2019** (435 estudios, https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full,
leído completo): el feedback **informativo** (explica por qué y qué estrategia usar) tiene un
tamaño de efecto d=0.99, frente a d=0.24 del feedback de refuerzo/elogio/puntos — una diferencia de
categoría, no de grado.

**Consecuencia para el diseño (aún no reflejada en `requirements.md`/`design.md` — es un hallazgo
que Fase 2 debe decidir si incorpora):** `RF-4` (variantes de quiz) y `RF-6` (Hint/Reveal) deben
soportar un **slot de feedback informativo** — un lugar explícito en la API del componente para
explicar el porqué de una respuesta correcta/incorrecta y qué estrategia habría llevado a
acertarla — no limitarse a un estado visual de acierto/error. `evidence.json` marca esto con
`informativeFeedbackRequired: true` en las entradas de RF-4 y RF-6.

## `qti-mapping.json` — vocabulario de interacciones

Documenta a qué interacción de **IMS QTI 3.0** corresponde cada variante de RF-3/RF-4, siguiendo
la recomendación de `research.md` P6 de adoptar el vocabulario de QTI como referencia de naming
(no de implementación — no se adopta el binding XML de QTI en el núcleo). Incluye
`gapsFueraDeV1`: la familia de interacciones **gráficas/sobre imagen** (`hotspot`, `hot-text`,
`graphic-order`, `graphic-associate`, `graphic-gap-match`, `position-object`, `select-point`,
`drawing`) y de **respuesta numérica/slider**, que QTI sí define y que `requirements.md` §4.1 no
cubre hoy — un hallazgo de alcance (§9.2), no de nomenclatura. Cada entrada de este bloque lleva
`"gap": true`.

## `xapi-mapping.json` — vocabulario de eventos de reporting

Documenta a qué `interactionType` de **xAPI** (10 tipos cerrados) correspondería cada RF, útil
solo como inspiración de naming de callbacks (`onAttempted`, `onMastered`) — el núcleo no
implementa xAPI/LRS. `performance`, `likert` y `numeric` quedan marcados `"sinMapeo": true`: no
hay RF equivalente en el inventario actual, coincidiendo con el mismo hueco de interacciones
numéricas/slider que detecta el mapeo de QTI.

## Estado

Datos completos según lo documentado en `research.md`. Sin validador ejecutable todavía — la
intención es que un lint de Fase 4 compruebe que cada entrada de registry (RF-3/RF-4) declara su
mapeo QTI/xAPI, no que se limite a documentación de referencia.
