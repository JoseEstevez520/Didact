# Artifact & Execution foundation

## Decisión

Didact publica un contrato serializable para espacios de trabajo con varios archivos y una primera
experiencia `CodeExercise`. El navegador no evalúa ni ejecuta contenido no confiable por defecto.
Ejecución y evaluación son puertos independientes proporcionados por el consumidor.

## Fronteras

| Capa | Responsabilidad |
|---|---|
| Schema | Archivos, estado, solicitud y resultado de ejecución, evaluación y eventos serializables |
| `CodeExercise` | Selección/edición de archivos, acciones, salida y feedback accesibles |
| Adaptador | Sandbox, runtime, límites de CPU/memoria/red, cancelación y normalización de salida |
| Grader | Criterios, tests ocultos, puntuación y feedback informativo |
| Consumidor | Persistencia, identidad, secretos, consentimiento, telemetría y política de retención |

Sandpack, WebContainers, workers, servicios Python o motores SQL pueden implementar el puerto. No
forman parte del contrato público ni se convierten en dependencia obligatoria.

## Pruebas de amplitud

1. Transformación JavaScript: varios archivos, referencia de tests de solo lectura, ejecución y
   evaluación separadas.
2. Consulta SQL de operaciones: lenguaje y runtime distintos, salida tabular textual y feedback
   sobre filtrado y ordenación.
3. Artefacto no ejecutable de respuesta a incidentes: valida que el schema admite creación y
   evaluación sin fingir que todo artefacto es código. Todavía no se publica un `ArtifactWorkspace`
   genérico hasta demostrar su UI con un motor no textual.

## Seguridad

- `CodeExercise` nunca usa `eval`, `Function`, scripts insertados ni ejecución en el proceso principal.
- El host recibe una copia serializable de los archivos mediante `execute(request)`.
- Timeouts declarativos son metadatos; el adaptador debe imponerlos realmente.
- El código, stdout y stderr pueden contener datos sensibles: Didact no los persiste ni reporta.
- La preview rica, red, paquetes externos, sistema de archivos y secretos permanecen denegados salvo
  concesión explícita del sandbox del consumidor.

## Accesibilidad

- Los archivos se recorren como tabs y el editor base es un textarea etiquetado.
- Los archivos de referencia son seleccionables y de solo lectura.
- Salida y feedback son texto, anunciados tras una acción explícita.
- Un editor enriquecido debe conservar una ruta equivalente por teclado y no ocultar el valor.

## Estado de la abstracción

`ArtifactWorkspaceDefinition` se mantiene como base headless; `CodeExercise` entra como
available/experimental. Dibujo, circuitos, CAD o animación no se reducirán a un textarea: podrán
reutilizar archivos, ejecución y evaluación, pero necesitarán motores de dominio y evidencia de una
UI compartida antes de añadir otro componente público.
