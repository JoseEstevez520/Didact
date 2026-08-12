# System Simulation foundation

**Estado:** disponible como contrato experimental
**Experiencia pública:** `SimulationLab`
**Verticales:** movimiento temporal visual e inventario operacional

## Decisión

`SimulationLab` es un shell educativo para sistemas: parámetros, estado observable, acciones,
reloj determinista y snapshots. No incorpora un solver universal. El consumidor inyecta la función
de transición y, si procede, una representación visual. `AnimationLab`, laboratorios de física y
modelos financieros permanecen como recipes mientras compartan este contrato.

## Fronteras

- El **schema** declara valores y controles JSON-safe.
- El **runtime inyectado** calcula el siguiente estado; no usa `eval` ni se serializa.
- `SimulationLab` coordina tiempo, controles, observables, acciones y snapshots accesibles.
- La **recipe** aporta ecuaciones, reglas y representación del dominio.
- El **consumidor** persiste, califica y conecta reporting.

El resultado base siempre es `ungraded`. Una experiencia pedagógica superior puede pedir una
predicción, comparar resultados o evaluar una meta, pero explorar un modelo no demuestra dominio.

## Dos verticales

El movimiento usa reloj continuo y una representación espacial. El inventario usa pasos manuales,
demanda, reposición y valores numéricos; no depende de keyframes. Ambos comparten parámetros,
acciones, tiempo, estado, observables, reset y snapshots. Esta intersección justifica una sola base.

## Accesibilidad y seguridad

Todos los valores de una representación personalizada aparecen también como observables textuales.
Play, pausa, paso, reset y snapshot usan controles con nombres accesibles. Ninguna operación exige
arrastrar. La transición es código confiable del consumidor; contenido generado no se ejecuta como
código dentro de la definición declarativa.
