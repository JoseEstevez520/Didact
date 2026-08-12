# Decision & Procedure foundation

**Estado:** disponible como contrato experimental  
**Experiencia pública:** `BranchingScenario`  
**Verticales:** conversación comercial y procedimiento de seguridad

## Decisión

Didact publica un único `BranchingScenario` sobre un grafo serializable de nodos, decisiones,
variables, condiciones, efectos, historial y resultados. `ProcedureTrainer` no es otro componente:
por ahora es una recipe que utiliza exactamente el mismo contrato. Solo se separará si los
procedimientos requieren operaciones materiales que una conversación no comparte.

## Fronteras

- El **motor** evalúa condiciones y aplica efectos deterministas; no renderiza ni califica.
- La **experiencia** presenta el contexto, recoge decisiones, muestra consecuencias y permite
  retroceder o reiniciar según la política declarada.
- La **recipe** aporta nodos y lenguaje del dominio: venta, seguridad, compliance o atención.
- El **consumidor** persiste intentos, identidad y reporting, y puede adaptar Ink mediante `inkjs`.

Ink es una entrada opcional, no la API pública. QTI requiere `customInteraction`/PCI; xAPI puede
registrar decisiones significativas y el resultado final como `performance`.

## Por qué no es un quiz enlazado

Una elección puede modificar variables, desbloquear rutas posteriores y producir consecuencias. El
historial conserva snapshots para restaurar el estado al retroceder. El resultado describe el
desenlace (`completed`, `failed` o `neutral`) sin afirmar que una ruta demuestre dominio.

## Accesibilidad y seguridad

Las opciones son botones en orden de lectura, no nodos visuales que exijan arrastrar. Las rutas no
disponibles permanecen deshabilitadas y las consecuencias se anuncian. No hay tiempo límite ni gesto
exclusivo de puntero. El contenido se renderiza como texto/React del consumidor, nunca como HTML no
confiable. Variables, estado, historial y resultados son JSON-safe.

## Gate de dos verticales

La conversación comercial y el procedimiento de seguridad comparten el contrato completo pese a
tener resultados y vocabulario distintos. Esto justifica una sola experiencia. La evidencia de
simulaciones orienta la práctica activa y el feedback, pero no demuestra automáticamente la eficacia
de cada escenario.
