# Taxonomía y criterio de admisión del catálogo

**Estado:** contrato inicial de la Fase 5  
**Fuente ejecutable:** `packages/schema`  
**Alcance:** componentes educativos reutilizables de Didact, independientemente de SkillNet

## Por qué existe esta taxonomía

El número de componentes no determina por sí solo si una biblioteca educativa es buena. El
catálogo debe cubrir intenciones pedagógicas distintas, compartir contratos predecibles y evitar
contar como componentes cosas que solo son variantes visuales. QTI aporta un vocabulario útil para
interacciones evaluables, H5P inspira el esquema declarativo de autoría y xAPI aporta un vocabulario
de reporting. Ninguno de esos estándares define por sí solo todo el catálogo de Didact.

La taxonomía usa dos ejes ortogonales: **rol técnico** y **familia educativa**. Un elemento tiene un
solo rol principal y una o más familias.

## Roles técnicos

| Rol | Responsabilidad | Ejemplos |
| --- | --- | --- |
| `primitive` | Pieza mínima reutilizable sin intención educativa completa | superficie de feedback, control de puntuación |
| `interaction` | Recoge una acción o respuesta significativa del estudiante | respuesta numérica, ordenación, autoexplicación |
| `display` | Presenta conocimiento o estado con semántica educativa | ejemplo resuelto, timeline, progreso |
| `composite` | Orquesta varios componentes y su estado | practice set, lección, escenario |
| `headless` | Lógica educativa sin interfaz obligatoria | scheduler de repetición, evaluador |
| `adapter` | Traduce contratos internos a un sistema o estándar externo | QTI, xAPI, LMS |

`primitive`, `headless` y `adapter` pueden publicarse y documentarse, pero no inflan el recuento de
**tipos educativos de cara al autor** salvo que resuelvan por sí mismos una intención de autoría.

## Familias educativas

| Familia | Pregunta que resuelve |
| --- | --- |
| `assessment` | ¿Qué sabe o puede hacer el estudiante? |
| `retrieval-practice` | ¿Cómo practica recuperar lo aprendido? |
| `generative-learning` | ¿Cómo explica, organiza o produce conocimiento? |
| `feedback-scaffolding` | ¿Qué ayuda informativa recibe y cuándo? |
| `knowledge-representation` | ¿Cómo se estructura o relaciona el contenido? |
| `sequence-procedure` | ¿Cómo se aprende un orden, proceso o procedimiento? |
| `progress-mastery` | ¿Cómo se representa avance, dominio o confianza? |
| `media` | ¿Cómo se aprende dentro de audio, vídeo o material visual? |
| `scenario-simulation` | ¿Cómo se practican decisiones en contexto? |
| `technical-practice` | ¿Cómo se ejecuta y comprueba una habilidad técnica? |
| `authoring` | ¿Cómo se compone o configura contenido reutilizable? |
| `interoperability` | ¿Cómo viajan contenido y actividad entre sistemas? |

Las familias no son carpetas de UI ni fases del roadmap. Por ejemplo, `PracticeSet` es un
`composite` que puede pertenecer a `retrieval-practice` y `assessment`; `SelfExplanationPrompt` es
una `interaction` de `generative-learning`.

## Criterio de admisión

Un nuevo tipo entra en el catálogo cuando cumple todos estos puntos:

1. Resuelve una intención educativa distinguible, no solo una preferencia estética.
2. Tiene un modelo de autoría estable y expresable con `AuthoringSchema`.
3. Define su respuesta y/o resultado, o declara explícitamente que es solo de presentación.
4. Proporciona feedback informativo cuando evalúa una respuesta; puntos y elogios no bastan.
5. Declara evidencia con su fuerza y limitaciones, incluso como `not-evaluated`; ausencia de
   evaluación no se presenta como evidencia negativa.
6. Declara acceso por teclado, lector de pantalla y alternativas a gestos. Una interacción de
   arrastre necesita una alternativa que no requiera arrastrar.
7. Declara versión de esquema y componente, y metadatos de migración cuando cambia contenido
   persistido.
8. Declara mappings QTI/xAPI solo con el grado de fidelidad real (`exact`, `approximate`, `none`).
9. Mantiene dependencias especializadas como opcionales y localizadas, con fallback cuando sea
   viable.
10. Puede probarse de forma determinista sin un LMS o servicio externo.

La admisión no exige evidencia de fuerza alta: componentes de accesibilidad, autoría o dominios
especializados pueden ser valiosos sin aparecer en los meta-análisis revisados. Sí exige honestidad
sobre qué se sabe, qué se infiere y qué no se ha evaluado.

## Qué no es un componente educativo nuevo

- Un color, tamaño, borde, icono, animación o variante de layout.
- Una story de Storybook, demo, preset de contenido o plantilla que solo rellena props existentes.
- Un alias de terminología (`test` frente a `quiz`) sin contrato distinto.
- Cada configuración de cardinalidad de la misma interacción, salvo que cambie sustancialmente la
  autoría, la respuesta o la accesibilidad.
- Un badge decorativo, contador o mensaje de éxito sin función pedagógica independiente.
- Un wrapper de proveedor que no traduce semántica ni datos.
- Un helper interno, hook o utilidad de estilos.
- Un exportador QTI/xAPI: es un `adapter`, no una interacción nueva.
- Una dependencia como dnd-kit, ts-fsrs, inkjs o Sandpack: habilita componentes, pero no es uno.

## Contratos comunes

`ComponentManifest` identifica el tipo y reúne autoría, versiones, evidencia, accesibilidad,
disponibilidad/madurez, variantes, mappings (uno o varios por estándar) y dependencias opcionales.
`AuthoringField` es recursivo: objetos y listas pueden contener
campos, con condiciones de visibilidad y obligatoriedad e i18n explícito.

`Response` separa el estado (`draft`, `streaming`, `submitted`) de la forma de respuesta. Esto
permite autosave y captura progresiva sin fingir que una respuesta parcial fue enviada. `Result`
separa evaluación de captura y admite estados no puntuados, parciales, feedback y outcomes. Estas
formas internas son estables; los adapters se ocupan de serializarlas a QTI, xAPI o un LMS.

## Reglas de evolución

- `version.schema` versiona la forma del manifest; `version.component`, el contenido persistido de
  ese tipo.
- Un cambio incompatible de contenido requiere una entrada de migración `from` → `to`.
- Añadir un mapping o evidencia no convierte automáticamente un cambio en breaking.
- Las validaciones devuelven issues estructurados y no lanzan excepciones ante JSON no confiable.
- El catálogo puede crecer por oleadas, pero ningún tipo salta el criterio de admisión para aumentar
  el recuento.
