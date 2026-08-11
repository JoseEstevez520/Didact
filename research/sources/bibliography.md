# Bibliografía — Didact (Fase 1, investigación)

Fuentes citadas en `specs/education-components/research.md`, agrupadas por tema, más las fuentes
originales aportadas por el dueño del producto (lote D) cuando `research.md` las referencia a
través de un espejo accesible. Cada línea indica **por qué importa** la fuente y su **estado de
verificación** tal como consta en `research.md` (accesible / no verificado / no accesible con
motivo). Fecha de investigación: 2026-08-11.

---

## 1. Taxonomía y esquemas (QTI 3.0, H5P semantics + repos, xAPI)

- **IMS QTI 3.0 — overview**: https://www.imsglobal.org/spec/qti/v3p0/oview — Estándar de mayor
  granularidad de vocabulario de interacciones de pregunta/test (research.md P6); base de
  `qti-mapping.json`. Accesible.
- **IMS QTI 3.0 — implementation guide (21 interacciones)**: https://www.imsglobal.org/spec/qti/v3p0/impl —
  Enumeración completa de las 21 interacciones (no ~19 como se asumía inicialmente), incluida la
  familia gráfica/sobre-imagen fuera del inventario actual (research.md §9.2). Accesible.
- **H5P — content types and applications**: https://h5p.org/content-types-and-applications —
  Más de 50 content types embebibles, equivalente 1:1 de casi todo RF-1..RF-9; usado como
  checklist de validación cruzada del inventario, no como dependencia. Accesible.
- **H5P — semantics.json**: https://h5p.org/semantics — Esquema declarativo dual
  (documenta + valida en runtime) adoptado como patrón para `packages/validators/schema/`.
  Accesible.
- **xAPI Spec (ADL)**: https://github.com/adlnet/xAPI-Spec — Vocabulario cerrado de 10
  `interactionType`; usado solo como inspiración de naming de callbacks, base de
  `xapi-mapping.json`. Accesible.
- **Open edX XBlock — documentación**: https://docs.openedx.org/projects/xblock/en/latest/index.html —
  Patrón arquitectónico (estado + vista + acción) acoplado a la plataforma; no aporta vocabulario
  de ejercicios ni interoperabilidad cross-plataforma. Descartado como fuente de vocabulario.
  Accesible.
- **1EdTech — estándar LTI**: https://www.1edtech.org/standards/lti — Lanza herramientas externas
  dentro de un LMS; ningún vocabulario de ejercicios propio. Relevante solo si un consumidor
  necesitara embeberse en un LMS de terceros; fuera del núcleo. Accesible.
- **SCORM — run-time técnico**: https://scorm.com/scorm-explained/technical-scorm/run-time/ —
  Empaquetado + tracking de finalización, sin vocabulario de ejercicios. Legado, fuera de alcance
  del núcleo. Accesible.

## 2. Evidencia pedagógica (Dunlosky, Wisniewski/Hattie, Fiorella & Mayer, Sitzmann)

- **Dunlosky et al. 2013** (fuente original, SAGE/*Psychological Science in the Public Interest*):
  reporta 403/acceso restringido en el momento de la investigación. **No accesible directamente**
  — reconstruido vía fuente secundaria de la Association for Psychological Science y vía PubMed:
  https://pubmed.ncbi.nlm.nih.gov/26173288/. De 10 técnicas de estudio, solo *practice testing* y
  *distributed practice* tienen utilidad **alta** — base de que RF-2/RF-4 tengan el respaldo más
  fuerte del inventario (`evidence.json`).
- **Wisniewski, Zierer & Hattie 2019** (Frontiers in Psychology):
  https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full — Meta-análisis de 435
  estudios; feedback informativo d=0.99 vs. refuerzo/elogio/puntos d=0.24. Base del requisito de
  "slot de feedback informativo" propuesto para RF-4/RF-6. **Accesible, leído completo**
  (open-access).
- **Fiorella & Mayer 2016** (fuente original, Springer/*Educational Psychology Review*):
  reporta acceso con login en el momento de la investigación. **No accesible directamente** —
  vía espejo accesible de ERIC: https://eric.ed.gov/?id=EJ1120458. 8 estrategias generativas de
  aprendizaje; base de los candidatos fuera de inventario `SelfExplanation` y `ConceptMap`
  (propuesta v2, no implementar ya).
- **Sitzmann 2011** (fuente original, Wiley/*Personnel Psychology*): reporta 402/acceso
  restringido en el momento de la investigación. **No accesible directamente, verificado solo vía
  resumen del abstract** — https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x.
  Simulation games con efecto positivo pero moderado (d 0.22-0.52) y sesgo de publicación
  declarado por la propia fuente; pesa contra sobrepriorizar un componente de escenario/simulación.

## 3. Librerías (dnd-kit, ts-fsrs, ink/inkjs, Sandpack, shadcn/ui, primitivos de UI)

- **dnd-kit**: https://github.com/clauderic/dnd-kit — Teclado + ARIA + live regions de serie;
  mitigación directa del incumplimiento de WCAG 2.5.7 en RF-3. Compatibilidad con React 19 **no
  confirmada** en documentación oficial (solo fuente secundaria) — candidato a dependencia fijada
  (RNF-5), no a copia. Accesible.
- **ts-fsrs**: https://github.com/open-spaced-repetition/ts-fsrs — Implementación TS nativa del
  scheduler FSRS completo, MIT, sin persistencia propia (mismo contrato que RF-2 exige). Paquete
  multi-módulo publicado en npm, no un fichero trivial de copiar — tercera opción para RF-2 como
  dependencia fijada. Accesible.
- **FSRS4Anki**: https://github.com/open-spaced-repetition/fsrs4anki — Referencia del modelo DSR
  (Difficulty/Stability/Retrievability) y los 19 pesos por defecto de FSRS. Accesible.
- **"Implementing FSRS in 100 lines" (Borretti)**: https://borretti.me/article/implementing-fsrs-in-100-lines —
  Evidencia de que el *scheduler* de FSRS (sin el optimizador de pesos) es tratable en un volumen
  de código razonable para un MVP. Accesible.
- **SM-2 — especificación original (SuperMemo)**: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2 —
  Fórmulas exactas del algoritmo por defecto de repetición espaciada (EF inicial 2.5, suelo 1.3).
  Accesible.
- **SM-2 — Wikipedia**: https://en.wikipedia.org/wiki/SM-2_(algorithm) — Verificación cruzada de
  las fórmulas de la especificación original. Accesible.
- **Ink**: https://github.com/inkle/ink — Lenguaje de guiones ramificados compilable a JSON;
  justifica un componente nuevo "escenario ramificado" fuera del inventario actual, prioridad
  media-baja (ver evidencia de Sitzmann). Accesible.
- **inkjs**: https://github.com/y-lohse/inkjs — Runtime en JavaScript/TypeScript de Ink, relevante
  para integrarlo en un proyecto React sin dependencia de un runtime nativo. Accesible.
- **Sandpack**: https://sandpack.codesandbox.io/ — Resuelve la ejecución (editor + runtime en
  navegador) de RF-11, no la comprobación. Licencia Apache-2.0 (no MIT) — exige atribución si se
  redistribuye código copiado, relevante para el modelo copy-paste (RNF-5). Accesible.
- **shadcn/ui — registry (overview)**: https://ui.shadcn.com/docs/registry — Confirma que el
  mecanismo de registry de terceros funciona con cualquier framework, no solo React. Accesible.
- **shadcn/ui — construir una registry propia**: https://ui.shadcn.com/docs/registry/getting-started —
  Guía dedicada a registries no oficiales; base de la decisión de RF-15. Accesible.
- **shadcn/ui — esquema `registry.json`**: https://ui.shadcn.com/docs/registry/registry-json —
  Esquema raíz adoptado literalmente en `packages/registry/registry.json`. Accesible.
- **shadcn/ui — esquema `registry-item.json`**: https://ui.shadcn.com/docs/registry/registry-item-json —
  Confirma que el campo `tailwind` está deprecated a favor de `cssVars.theme` — base de la
  decisión de no exigir Tailwind (research.md P3). Accesible.
- **shadcn/ui — namespaces de registry**: https://ui.shadcn.com/docs/registry/namespace — Modelo
  de instalación descentralizado sin autoridad central. Accesible.
- **shadcn/ui — autenticación de registry**: https://ui.shadcn.com/docs/registry/authentication —
  Autenticación nativa vía cabeceras HTTP + variables de entorno; sin OAuth/OIDC. Accesible.
- **shadcn/ui — changelog CLI v4 (2026-03)**: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4 —
  Documenta `shadcn diff` para la registry oficial; **no confirma explícitamente** que funcione
  igual con registries namespaced de terceros — marcado "no verificado" en `research.md`.
  Accesible (el contenido, no la garantía que se buscaba en él).
- **shadcn/ui — React 19**: https://ui.shadcn.com/docs/react-19 — Confirma la fricción de
  peer-dependency de Radix UI/React Aria con React 19 estable. Accesible.
- **shadcn/ui — Tailwind v4**: https://ui.shadcn.com/docs/tailwind-v4 — Muestra que incluso dentro
  de shadcn/ui, Tailwind no es una versión congelada (migración v3→v4 con `@theme`/OKLCH).
  Accesible.
- **Radix UI — releases**: https://www.radix-ui.com/primitives/docs/overview/releases — Confirma
  "Full React 19 compatibility" (PR #2952) y arreglos específicos de React 19 tan recientes como
  julio de 2026. Accesible.
- **MUI — actualización a React 19 (Base UI)**: https://mui.com/blog/react-19-update/ — Evidencia
  de que el mismo equipo que mantiene Base UI ya migró MUI a React 19; base de "vigilar Base UI"
  como alternativa a Radix a 3-6 meses. Accesible.

## 4. Accesibilidad (WCAG 2.2 §2.5.7 Dragging Movements, EN 301 549)

- **WCAG 2.2 — texto completo**: https://www.w3.org/TR/WCAG22/ — Fuente normativa del contrato
  mínimo de accesibilidad del núcleo (`wcag-criteria.json`). Accesible.
- **WCAG 2.2 — Understanding Dragging Movements (2.5.7)**: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html —
  Base del matiz "teclado ≠ single-pointer-sin-arrastre" documentado en `packages/validators/a11y/README.md`.
  Accesible.
- **W3C WAI-COGA — Making Content Usable**: https://www.w3.org/TR/coga-usable/ — Guía
  suplementaria a WCAG con patrones específicos para TDAH/autismo/dislexia/discalculia
  (temporizadores, densidad visual, consistencia visual). Accesible.
- **CAST — UDL Guidelines**: https://udlguidelines.cast.org/ — Marco de neurociencia (3 redes:
  afectiva/reconocimiento/estratégica) usado como framework de investigación, no checklist.
  Accesible.
- **EN 301 549** (estándar europeo armonizado, índice ETSI): reportado como no accesible
  directamente en el momento de la investigación (403) — verificado vía fuentes secundarias
  (Deque/WCAG.com, no citadas con URL directa en `research.md`). **No verificado**: la versión de
  EN 301 549 vigente referenciaría WCAG 2.1, anterior a 2.2, por lo que el criterio 2.5.7 podría no
  estar aún incorporado literalmente — confirmar contra el texto oficial antes de usarlo como
  argumento legal preciso ante un cliente.

---

## Nota metodológica

Este listado prioriza las URLs citadas explícitamente en `research.md`; el detalle completo de
cada hallazgo (incluida la metodología de verificación, p. ej. consulta en vivo de
`peerDependencies` contra `registry.npmjs.org`) vive en `research.md` y en los informes crudos de
`../reports/`. Donde una fuente original no fue accesible directamente, se documenta el motivo
reportado (403/402/login) y la vía secundaria usada — mismo estándar de honestidad que
`research.md` hereda de `openui-adoption.md` §1.
