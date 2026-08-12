# Interactive Media foundation

**Estado:** implementación experimental disponible
**Schema:** `@didact/schema` / `InteractiveMediaDefinition` 1.0.0
**Manifest:** `didact.interactive-media` 1.0.0, available/experimental

## Problema educativo

Un medio lineal permite mirar o escuchar, pero no coordina necesariamente predicción, recuperación,
decisión o feedback. Interactive Media inserta actividades educativas existentes en momentos
significativos de audio o vídeo y mantiene una política explícita de finalización.

La interacción no se considera pedagógicamente útil por contener checkpoints. Cada actividad hija
debe provocar una acción relevante y conserva su propio modelo de respuesta, evaluación, feedback y
mapping de estándares.

## Fronteras

| Responsabilidad | Propietario |
| --- | --- |
| Decodificar, buffering, DRM, streaming y calidad | navegador o adaptador del proveedor |
| Tiempo actual, play/pause/seek | player nativo o adaptador inyectado |
| Cues, checkpoint activo y política de finalización | Interactive Media foundation |
| Autoría, respuesta, resultado y feedback de una pregunta | actividad hija |
| Persistencia, analítica, identidad y progreso del curso | consumidor |
| Import/export QTI o statements xAPI | adaptadores futuros |

Didact puede ofrecer un adapter nativo para `<audio>` y `<video>`, pero su contrato no presupone
YouTube, Vimeo, HLS, un CDN concreto ni una librería de reproducción.

## Contrato común validado

`InteractiveMediaDefinition` contiene:

- identidad, título y objetivo;
- asset `audio | video`, fuente, duración y tracks;
- transcript con cues ordenados;
- checkpoints temporales con una actividad hija referenciada por `manifestId` y `typeId` opcional;
- configuración de autoría JSON-safe para esa actividad;
- política de finalización por fin del medio, checkpoints requeridos o ambos;
- capacidad de seek y cambio de velocidad.

El estado runtime contiene solamente posición, duración conocida, reproducción, checkpoint activo y
checkpoints completados. No copia las respuestas hijas: el consumidor o el orquestador las conserva
como respuestas compuestas.

## Validación

El modo `complete` comprueba:

- IDs únicos y estables;
- tiempos ordenados y dentro de la duración conocida;
- autoría hija serializable, sin funciones, valores no finitos ni ciclos;
- al menos un checkpoint;
- transcript para audio pregrabado;
- captions para vídeo hablado;
- descripción textual o track de descripción para información visual significativa;
- ratio de visualización entre 0 y 1.

El modo `streaming` permite que título, URL, transcript y checkpoints lleguen progresivamente, pero
mantiene el discriminante del medio, la versión, identidad y política de finalización.

## Dos verticales de prueba

### Procedimiento corporativo en vídeo

- Vídeo de lockout/tagout.
- Captions, transcript y descripción visual.
- Predicción mediante single choice.
- Reconstrucción del procedimiento mediante ordering.
- Finalización: 80 % visto y checkpoints obligatorios terminados.

### Comprensión lingüística en audio

- Anuncio de una estación.
- Transcript temporizado.
- Extracción de hora/plataforma mediante WordBank.
- Explicación opcional mediante respuesta corta.
- Finalización: checkpoint obligatorio y 70 % escuchado.

## Resultado del contraste

La base compartida es legítima en el nivel de contrato:

- ambos casos usan un reloj y checkpoints;
- ambos componen actividades existentes en vez de reinventarlas;
- ambos necesitan transcript navegable y revisión de cues;
- ambos comparten estado, eventos y finalización;
- las diferencias de vídeo —captions y descripción visual— son obligaciones del asset, no ramas del
  modelo educativo.

No se crea `InteractiveVideo` y `InteractiveAudio` como dos componentes educativos. Son variantes de
medio de `InteractiveMedia`. Solo se dividirían si futuras pruebas demuestran modelos incompatibles.

## API React autorizada

La primera implementación debe:

1. aceptar una `InteractiveMediaDefinition` validada;
2. incluir player nativo accesible como adapter por defecto;
3. permitir sustituir el player mediante un slot/adaptador;
4. exponer estado controlado y no controlado;
5. activar una sola vez cada checkpoint al cruzar su tiempo, también después de seek;
6. permitir abrir todos los checkpoints desde una lista fuera de la timeline;
7. recibir `renderActivity(activity, controls)` sin conocer la UI hija;
8. marcar un checkpoint completo solo mediante acción explícita del renderer/consumidor;
9. calcular finalización sin asumir persistencia ni scoring;
10. conservar transcript, labels y controles completos cuando JavaScript o el medio están parciales.

## No incluido en la primera versión

- editor visual de checkpoints;
- hosting, uploads, transcoding, DRM o analytics de proveedor;
- overlays posicionados encima del vídeo;
- autoplay obligatorio;
- scoring agregado inventado por el contenedor;
- impedir seek como mecanismo de evaluación de seguridad;
- importar H5P o exportar QTI/xAPI;
- fingir que completar o ver un porcentaje equivale a dominar el contenido.
