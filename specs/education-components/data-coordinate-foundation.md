# Data & Coordinate foundation

**Estado:** disponible como contrato experimental
**Experiencia pública inicial:** `DataExplorer`
**Verticales de validación:** función matemática y serie temporal empresarial/científica

## Decisión

Didact publica una única experiencia experimental, `DataExplorer`, sobre un fundamento de datos y
coordenadas. No publica todavía `FunctionExplorer`: una función y una serie temporal comparten ejes,
escalas, viewport, selección, inspección, tabla equivalente, estado y eventos. Crear dos exports ahora
duplicaría el contrato sin aportar una acción educativa distinta.

La decisión se revisará cuando exista evidencia de que las funciones necesitan authoring, respuesta o
feedback incompatibles con una serie. Son señales para separar: expresiones simbólicas como fuente de
verdad, restricciones algebraicas, análisis de dominio/rango o evaluación matemática que no pueda
expresarse como anotaciones, parámetros y puntos sobre el mismo modelo.

## Gate de producto

| Criterio | Evidencia de esta entrega |
| --- | --- |
| Alcance | Gráficas y tablas aparecen en matemáticas, ciencia, estadística, economía y formación empresarial. |
| Reutilización | Los dos fixtures usan dominios, escalas y tareas distintos sin cambiar el contrato. |
| Acción nueva | El alumno inspecciona, compara y manipula datos en un sistema de coordenadas; no responde a otro formulario textual. |
| Encaje | Definición, estado, respuesta, resultado y eventos son serializables y aptos para interfaces generadas. |
| Accesibilidad | Gráfica y tabla operan sobre el mismo estado; teclado y lector de pantalla no reciben una copia desactualizada. |

Comparación de alcance:

- QTI 3.0 no define una interacción de exploración de datos equivalente. El mapping es `none`; una
  futura integración avanzada podría usar PCI sin convertir PCI en la API de Didact.
- H5P ofrece representaciones de chart y actividades de respuesta, pero representar una gráfica no
  equivale a una experiencia que coordine inspección, manipulación y feedback.
- Los LMS pueden alojar el componente, persistir su estado y registrar eventos. El fundamento no
  asume que el LMS tenga un motor de coordenadas propio.
- El catálogo actual cubre respuesta numérica y hotspots, pero no escalas de datos, series ni una
  vista tabular sincronizada.

## Frontera arquitectónica

| Capa | Responsabilidad | No debe hacer |
| --- | --- | --- |
| Engine | Escalas, ejes, proyección entre datos y viewport, series, navegación por puntos y operaciones deterministas. | Formular objetivos, calificar o persistir. |
| Experiencia `DataExplorer` | Objetivo, tarea, estado controlado/no controlado, selección/manipulación, feedback, resultado y eventos. | Poseer analítica, identidad, almacenamiento o decisiones de negocio. |
| Recipe | Datos, ejes, anotaciones, parámetros, consignas y criterios propios de un dominio. | Introducir componentes React o lógica no serializable en el contrato. |
| Consumidor | Cargar activos/datos, decidir persistencia y reporting, localizar texto y conectar adaptadores xAPI/LMS. | Reimplementar escalas o mantener un segundo estado para la tabla accesible. |

El engine es infraestructura y no incrementa el número de componentes educativos. Los recipes tampoco
son tipos públicos adicionales.

## Contrato educativo

El authoring declara un objetivo, ejes, series y una tarea. Según el modo, el alumno puede inspeccionar
puntos, seleccionar un punto o intervalo y manipular valores o parámetros permitidos. La respuesta
serializable contiene esas selecciones y cambios; el resultado describe progreso o comprobación sin
confundir exploración con dominio. Los eventos representan acciones significativas (`point-focused`,
`selection-changed`, `value-changed`, `submitted`, `reset`) y no movimientos de puntero de alta frecuencia.

El feedback debe explicar la relación observada o la consecuencia de una manipulación. Resaltar en
verde/rojo, elogiar o mostrar puntos sin explicación no cierra el bucle educativo.

## Dos verticales contrastantes

### Función matemática

El recipe presenta una función parametrizada, por ejemplo una recta, y pide explorar cómo cambia su
gráfica al modificar pendiente e intercepto. Los puntos y la tabla se derivan del mismo dataset
serializado. El feedback conecta el cambio realizado con su efecto sobre la curva.

### Serie empresarial o científica

El recipe presenta observaciones fechadas, por ejemplo ingresos mensuales o temperatura, y pide
identificar un intervalo y justificar una tendencia. Usa una escala temporal, datos discretos y
anotaciones; no necesita parámetros algebraicos.

Ambas verticales comparten viewport, ejes, series, selección, foco, tabla, respuesta y eventos. Esa
intersección justifica `DataExplorer`; sus diferencias pertenecen al recipe.

## Accesibilidad: una sola fuente de verdad

La tabla no es una descripción secundaria ni un fallback de solo lectura. Gráfica y tabla proyectan el
mismo estado de datos, foco, selección y edición:

- mover el foco con teclado actualiza la fila activa;
- seleccionar o editar una fila actualiza la marca gráfica;
- los puntos tienen nombres derivados de serie, valores y unidades;
- el orden de teclado es predecible y no obliga a recorrer cada píxel;
- forma, texto o patrón acompañan al color;
- zoom y pan tienen controles operables sin gestos complejos;
- cambios y feedback se anuncian de forma dosificada.

Si una operación gráfica no tiene equivalente tabular o mediante controles simples, no entra en el
contrato experimental.

## Criterio de salida experimental

- validadores completos y streaming rechazan ids duplicados, dominios inválidos y referencias rotas;
- ambos fixtures pasan por el mismo contrato público;
- stories y tests prueban mouse, teclado, tabla y estado controlado;
- el registry instala la experiencia y su schema sin imports internos rotos;
- telemetría o integraciones reales determinan si se estabiliza o se divide.
