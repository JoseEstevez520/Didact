# @didact/registry

`registry.json` de Didact en el **esquema oficial de shadcn/ui** — el mecanismo de distribución
elegido para RF-15 de `requirements.md` (registry + CLI que copia código fuente al proyecto
consumidor, no dependencia npm versionada).

## Por qué el esquema oficial de shadcn y no un CLI propio

`specs/education-components/research.md` Pregunta 1 confirma que el mecanismo de registry de
terceros de shadcn/ui es real, documentado como producto de primera clase (no un hack de
comunidad) y funciona con cualquier framework, no solo React:

- Esquema raíz `registry.json` (`$schema`, `name`, `homepage`, `items`/`include`).
- Esquema de item `registry-item.json` (`name`, `type`, `files`, `dependencies`,
  `registryDependencies`, `cssVars`, `css`, `envVars`…).
- Hosting como JSON estático servible desde cualquier servidor HTTP, o un repo GitHub con
  `registry.json` en la raíz — este repo.
- Instalación por URL directa (`shadcn add https://.../<item>.json`) o por namespace configurado
  en el `components.json` del consumidor (modelo descentralizado, sin autoridad central).

**Recomendación de research.md P1:** adoptar el CLI y esquema oficiales como mecanismo primario.
Construir un CLI propio queda como plan B teórico, no como trabajo a realizar — el riesgo que
`design.md` §9 anticipaba ("el mecanismo de terceros no soporta lo que necesitamos") no se
confirmó en la investigación.

## Caveats verificados (no ignorar al operar esta registry)

- **No existe un campo `version` nativo en `registry-item.json`.** No hay versionado de un mismo
  componente a nivel de esquema; el versionado de "misma componente, distintas revisiones" es
  responsabilidad de cómo esta registry organice sus rutas (p. ej. namespacing por fecha o tag),
  no algo que el CLI de shadcn resuelva por nosotros.
- **`shadcn diff` contra registries de terceros: no verificado.** La documentación (changelog CLI
  v4) lo documenta para la registry oficial; no confirma explícitamente que funcione igual con
  registries namespaced de terceros como esta. Antes de documentar `shadcn diff` como mecanismo
  de actualización para consumidores de Didact, probarlo empíricamente.
- **Autenticación** es nativa vía cabeceras HTTP + variables de entorno (Bearer token, API key).
  No hay OAuth/OIDC ni discovery automático — relevante solo si esta registry deja de ser pública.

## Estado

`registry.json` válido con `items: []` — scaffold de Fase 1-3. Las entradas se añaden a medida
que `packages/core` implemente componentes reales en Fase 4, y esta registry se publica de forma
consumible (`shadcn build`, hosting del JSON) en Fase 6 del `ROADMAP.md`.
