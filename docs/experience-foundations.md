# Fundamentos de experiencia y criterio de prioridad

**Estado:** decisión de producto vigente
**Ámbito:** expansión posterior a las interacciones educativas básicas
**Relacionado:** `docs/catalog-architecture.md`, `ROADMAP.md`, `research/sources/bibliography.md`

## Corrección de rumbo

Didact no elegirá una plataforma porque un caso concreto resulte atractivo. `AnimationLab` apareció
como siguiente candidato después de hablar de formación en animación, pero ese ejemplo no constituye
por sí solo evidencia de prioridad.

La unidad de planificación será una **capacidad reutilizable demostrada por experiencias reales**:

```text
contratos comunes
  └─ fundamento o motor especializado
       ├─ experiencia educativa pública
       │    └─ recipes de varios dominios
       └─ segunda experiencia contrastante
```

- Un motor no es un componente educativo ni incrementa el catálogo por sí mismo.
- Una experiencia pública añade objetivo, acción del alumno, feedback y accesibilidad.
- Un caso de asignatura o sector es normalmente un recipe declarativo.
- Una base no se considera general hasta funcionar en **dos casos suficientemente distintos**.
- Si los dos casos necesitan contratos incompatibles, se mantienen motores distintos; no se fuerza
  una abstracción universal.

## Qué dicen las referencias externas

Estas referencias son señales, no una medición completa del mercado:

- Los datos publicados por H5P sobre contenido alojado en H5P.com situaban `Course Presentation`
  (13,84 %), `Interactive Video` (12,31 %) y `Question Set` (9,82 %) por encima de las restantes
  familias; `Branching Scenario` representaba 1 %. Es un proxy de uso dentro de H5P en 2022, no una
  cuota universal ni una medición actual de todos los LMS.
- El catálogo oficial de H5P incluye composición, vídeo interactivo, escenarios ramificados,
  actividades visuales, lenguaje y evaluación. Esto respalda mantener una cartera heterogénea.
- Moodle separa actividades de evaluación, colaboración, comunicación y contenido interactivo;
  una biblioteca educativa general no debe confundir “actividad” con “tipo de pregunta”.
- Open edX diferencia problemas básicos de herramientas avanzadas: respuesta abierta, evaluación
  entre pares, código con grader externo, drag sobre imagen y herramientas especializadas. También
  muestra que los casos avanzados necesitan límites de ejecución e integración diferentes.
- QTI aporta interacciones normalizadas y una vía PCI para interacciones tecnológicamente avanzadas;
  no ofrece un único modelo que convierta simulación, vídeo, código y escenarios en la misma cosa.
- La evidencia de simulaciones es prometedora pero condicionada. El meta-análisis de Sitzmann
  encontró mejores resultados medios frente a grupos de comparación, junto con sesgo de publicación
  y moderadores importantes; las simulaciones funcionaron mejor como suplemento, con acceso repetido
  y participación activa. Por tanto, “es una simulación” no es una garantía pedagógica.
- El meta-análisis de feedback de Wisniewski, Zierer y Hattie encontró un efecto medio heterogéneo y
  dependiente del contenido informativo. Cada plataforma debe cerrar el bucle acción → consecuencia
  → explicación, no limitarse a ofrecer manipulación vistosa.

Fuentes principales:

- [H5P: distribución de sus tipos de contenido](https://h5p.org/blog/status-update-february-2023)
- [H5P: catálogo y tutoriales de autoría](https://h5p.org/node/2465)
- [H5P: contrato declarativo semantics.json](https://h5p.org/semantics)
- [Moodle: actividades incluidas](https://docs.moodle.org/500/en/activities)
- [Open edX: tipos de problema y herramientas](https://docs.openedx.org/en/latest/educators/references/course_development/exercise_tools/guide_problem_types.html)
- [1EdTech: QTI 3 Implementation Guide](https://www.imsglobal.org/spec/qti/v3p0/impl)
- [Sitzmann: meta-análisis de simulation games](https://onlinelibrary.wiley.com/doi/10.1111/j.1744-6570.2011.01190.x)
- [Wisniewski, Zierer y Hattie: meta-análisis de feedback](https://www.frontiersin.org/articles/10.3389/fpsyg.2019.03087/full)

## Matriz de decisión

Cada fundamento se puntúa de 1 a 5. Los pesos evitan que la facilidad técnica o una petición aislada
dominen la decisión:

| Criterio | Peso | Pregunta |
| --- | ---: | --- |
| Alcance de uso | 25 % | ¿Aparece en cursos y herramientas consolidadas? |
| Reutilización transversal | 25 % | ¿Sirve a materias y sectores realmente diferentes? |
| Acción educativa nueva | 20 % | ¿Permite hacer algo que el catálogo actual no permite? |
| Encaje con Didact/SkillNet | 15 % | ¿Admite autoría declarativa y composición dinámica? |
| Viabilidad y accesibilidad | 15 % | ¿Puede entregarse de forma segura, accesible y mantenible? |

Puntuación inicial de planificación; debe revisarse con telemetría y conversaciones con usuarios:

| Fundamento | Alcance | Reuso | Acción nueva | Encaje | Viabilidad | Total / 5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Timeline de medios y checkpoints | 5 | 5 | 4 | 5 | 4 | **4,65** |
| Coordenadas, funciones y series | 4 | 5 | 5 | 4 | 4 | **4,45** |
| Grafo de estados y decisiones | 3 | 5 | 5 | 5 | 4 | **4,25** |
| Runtime de sistemas y simulación | 3 | 5 | 5 | 4 | 2 | **3,95** |
| Workspace de artefactos y ejecución | 3 | 4 | 5 | 4 | 2 | **3,70** |
| Expresiones simbólicas manipulables | 3 | 4 | 5 | 3 | 3 | **3,65** |

El total ordena investigación, no obliga a construir toda una fila antes de contrastarla con otra.
También se mantiene diversidad: una oleada no entrega tres experiencias basadas en el mismo motor.

## Cartera de fundamentos

### A. Timeline de medios y checkpoints

**Base:** reloj de medios, cues, transcript, selección temporal y composición de interacciones hijas.
**Experiencias:** `InteractiveMedia`, después `InteractiveVideo` y `InteractiveAudio` como variantes
del medio, no como contratos educativos duplicados.
**Pruebas contrastantes:** vídeo de procedimiento corporativo y audio de comprensión lingüística.

No será un reproductor propio. La reproducción pertenece al elemento o proveedor; Didact coordina
tiempo educativo, actividades, transcript, respuesta, feedback y accesibilidad.

### B. Coordenadas, funciones y series

**Base:** escalas, ejes, viewport, series, puntos manipulables, tabla equivalente y navegación por
teclado.
**Experiencias:** `DataExplorer` y `FunctionExplorer` solo se separan si sus modelos de autoría y
respuesta lo justifican.
**Pruebas contrastantes:** función matemática y serie empresarial o científica.

La tabla accesible no es un fallback decorativo: debe permitir inspeccionar o editar la misma
información cuando el gesto gráfico no sea utilizable.

**Decisión de entrega:** se publica un único `DataExplorer` experimental. La función matemática y
la serie empresarial/científica son recipes contrastantes del mismo contrato. `FunctionExplorer`
solo se separará si aparece una diferencia real de authoring, respuesta o evaluación (por ejemplo,
una fuente simbólica y restricciones algebraicas que no puedan modelarse como datos y parámetros).
El gate completo y la frontera engine/experiencia/recipe/consumidor están en
`specs/education-components/data-coordinate-foundation.md`.

### C. Grafo de estados y decisiones

**Base:** nodos, transiciones, variables, condiciones, historial y consecuencias.
**Experiencias:** `BranchingScenario` y `ProcedureTrainer`.
**Pruebas contrastantes:** conversación comercial y procedimiento de seguridad.

El grafo es serializable. `inkjs` puede ser un adaptador opcional, nunca el contrato público ni una
dependencia obligatoria.

### D. Runtime de sistemas y simulación

**Base:** estado, parámetros, acciones, reloj opcional, observables, reset, snapshots y reglas.
**Experiencia:** `SimulationLab`. `AnimationLab`, un laboratorio de física o un modelo financiero
son recipes o especializaciones hasta que una diferencia contractual demuestre lo contrario.
**Pruebas contrastantes obligatorias:** un sistema temporal visual y un sistema no basado en
keyframes, por ejemplo crecimiento financiero o dinámica de inventario.

El runtime no evalúa por defecto. Una capa educativa añade predicción, objetivo, comparación,
intentos y feedback. No se estabilizará después de probarlo únicamente con animación.

### E. Workspace de artefactos y ejecución

**Base:** editor o lienzo, archivos/artefactos, preview, ejecución aislada y protocolo de evaluación.
**Experiencias:** `CodeExercise` primero; dibujo, circuitos u otros builders requieren motores de
dominio propios aunque compartan el shell.
**Pruebas contrastantes:** ejecución de código y artefacto no ejecutable antes de generalizar el
workspace.

El sandbox, grader y almacenamiento son puertos inyectables. No se ejecuta contenido no confiable
en el proceso principal.

## Orden adoptado

1. **Interactive Media foundation**: alta señal de uso y reutiliza interacciones ya existentes.
2. **Data & Coordinate foundation**: abre matemáticas, ciencia, datos, economía y empresa.
3. **Decision & Procedure foundation**: implementada como `BranchingScenario`; conversación y procedimiento comparten el grafo.
4. **System Simulation foundation**: implementada como `SimulationLab`, validada con movimiento e inventario.
5. **Artifact & Execution foundation**: implementada como `CodeExercise`, con ejecución y evaluación
   inyectadas y un schema que también admite artefactos no ejecutables.

**Fuera del horizonte:** colaboración, peer review y coautoría. SkillNet sirve cursos individuales;
estas capacidades exigirían identidad, permisos y persistencia multiusuario y pertenecen a otro
producto si aparece una demanda real futura.

No se terminarán necesariamente en una cadena rígida. Se puede hacer un spike pequeño de la fila
siguiente para comprobar que una base no se está sobreajustando.

## Gate antes de implementar una experiencia

Toda propuesta debe incluir:

1. matriz puntuada y fuentes utilizadas;
2. comparación con catálogo, H5P, QTI y al menos un LMS/plataforma consolidada;
3. frontera explícita entre motor, experiencia, recipe y responsabilidad del consumidor;
4. dos recipes contrastantes y explicación de qué comparten;
5. authoring, state/response, result, feedback y eventos serializables;
6. alternativa accesible que opere sobre el mismo estado;
7. estrategia de seguridad para medios, código o contenido no confiable;
8. criterio para abandonar o dividir la abstracción si el segundo caso no encaja.

## Siguiente decisión concreta

La **Interactive Media foundation** está implementada y disponible como experimental después de
validarse con vídeo de procedimiento y audio de comprensión. La **Data & Coordinate foundation**
entra igualmente como experimental después de demostrar un contrato común con una función
matemática y una serie científica o empresarial. Sus gates viven en
`specs/education-components/interactive-media-foundation.md` y
`specs/education-components/data-coordinate-foundation.md`. La base de **decisiones y procedimientos**
también está implementada y documentada en `specs/education-components/decision-procedure-foundation.md`.
La base de **sistemas y simulación** está implementada y documentada en
`specs/education-components/system-simulation-foundation.md`. La base de **artefactos y ejecución**
queda implementada con `CodeExercise` y documentada en
`specs/education-components/artifact-execution-foundation.md`; `AnimationLab` continúa como recipe,
no como export automático.
