# Spatial construction foundation

## Decisión

`LabelDiagram`, `ConceptMap` y `DrawingResponse` comparten infraestructura conceptual —identidades
estables, coordenadas normalizadas, estado serializable, undo y alternativas accesibles— pero son
tres componentes porque solicitan acciones cognitivas y respuestas diferentes.

| Experiencia | Acción del alumno | Respuesta canónica |
|---|---|---|
| `LabelDiagram` | asignar nombres a posiciones conocidas | mapa target → label |
| `ConceptMap` | construir relaciones semánticas | nodos + aristas etiquetadas |
| `DrawingResponse` | producir una representación espacial libre | trazos vectoriales normalizados |

No se crea un mega-canvas común ni se cuentan recipes de anatomía, maquinaria, ciencia, empresa,
geometría o procedimientos como componentes adicionales.

## Accesibilidad compartida

- Ninguna operación depende exclusivamente de arrastrar o dibujar con precisión de puntero.
- `LabelDiagram` conserva una lista textual de destinos y asignación click/teclado.
- `ConceptMap` conserva un constructor From–Relationship–To sobre el mismo grafo.
- `DrawingResponse` conserva lista de trazos, coordenadas y creación mediante teclado.
- Posición y color nunca son la única información que expresa corrección o significado.

## Evaluación

Las soluciones opcionales de etiquetado permiten comparación determinista. Los mapas conceptuales
y dibujos aceptan evaluación inyectada porque su validez depende del dominio y del objetivo. Ningún
componente revela la solución antes de enviar ni presenta una inferencia visual heurística como nota.

## Próxima reutilización

`GraphicOrder` y `GraphicAssociation` solo se añadirán si sus modelos de respuesta divergen de
`LabelDiagram`, `SortExercise` y `MatchingExercise`. Compartirán coordenadas y alternativas de
teclado, no necesariamente una API React ni un runtime gráfico global.
