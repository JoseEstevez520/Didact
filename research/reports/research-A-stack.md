# Investigación Fase 1 — Preguntas 1, 2 y 3 (requirements.md §6)

> Fecha de la investigación: 2026-08-11. Toda la evidencia de versiones npm se obtuvo en vivo
> contra `registry.npmjs.org` (no memoria del modelo) el mismo día.

---

## Pregunta 1 — ¿El mecanismo de registry de terceros de shadcn/ui es real y maduro?

### Evidencia

**El mecanismo existe, está documentado como producto de primera clase y es reciente (CLI 3.0,
agosto 2025; CLI v4, marzo 2026), no un hack de la comunidad:**

- Página raíz: "El registry es un sistema de distribución de código... funciona con cualquier
  tipo de proyecto y framework, no está limitado a React." —
  https://ui.shadcn.com/docs/registry
- Guía dedicada paso a paso para construir tu propia registry (no la oficial):
  https://ui.shadcn.com/docs/registry/getting-started
- Esquema raíz `registry.json`: `$schema`, `name`, `homepage`, y `items` (o `include` para
  componer varios ficheros en registries grandes) —
  https://ui.shadcn.com/docs/registry/registry-json
- Esquema de cada item, `registry-item.json`: `name`, `type`, `title`, `description`, `files`,
  `dependencies`, `devDependencies`, `registryDependencies`, `cssVars`, `css`, `envVars`, `font`,
  `docs`, `categories`, `meta`, y `tailwind` (marcado **deprecated**, sustituido por
  `cssVars.theme`) — https://ui.shadcn.com/docs/registry/registry-item-json
  - **No existe un campo `version`** en este esquema para versionar un mismo item. Confirmado
    leyendo la lista completa de propiedades documentadas.

**Hosting:** dos vías oficiales — (a) `pnpm dlx shadcn@latest build` genera JSON estático en
`public/r/*.json` servible desde Next.js/Vite/Vue/Svelte/PHP o cualquier servidor que sirva JSON
por HTTP; (b) rutas dinámicas con `loadRegistry()`/`loadRegistryItem()` como dependencia runtime.
Un repo de GitHub con un `registry.json` en la raíz también es una registry válida sin hosting
adicional. — https://ui.shadcn.com/docs/registry/getting-started

**Instalación por el consumidor**, dos formas:
- URL directa: `pnpm dlx shadcn@latest add https://tu-dominio.com/r/flashcard.json`
- Namespace configurado en `components.json`: primero
  `pnpm dlx shadcn@latest registry add @anfaia=https://tu-dominio.com/r/{name}.json`, luego
  `pnpm dlx shadcn@latest add @anfaia/flashcard`.
  — https://ui.shadcn.com/docs/registry/getting-started y
  https://ui.shadcn.com/docs/registry/namespace

**Namespaces:** prefijo `@`, modelo **descentralizado** ("eres libre de crear y usar cualquier
namespace"), sin autoridad central, solo alfanumérico/guiones/guión bajo. Varias registries
coexisten sin conflicto declarado en `components.json`; el CLI detecta y previene dependencias
circulares entre registries. — https://ui.shadcn.com/docs/registry/namespace

**Autenticación:** soportada de forma nativa vía cabeceras HTTP configuradas en
`components.json` + variables de entorno — Bearer token (`Authorization: Bearer ${TOKEN}`),
API key en cabecera custom, o token en query param (documentado como menos seguro). Ejemplos
oficiales para Next.js/Express de cómo validar esas cabeceras en tu propio servidor de registry.
No hay soporte documentado de OAuth/OIDC ni de discovery automático de credenciales — cada
registry privada exige configuración explícita. — https://ui.shadcn.com/docs/registry/authentication

**Límites conocidos, verificados:**
- Para aparecer en el **índice público oficial** (`ui.shadcn.com/r/registries.json`, opcional,
  solo para descubribilidad) se exige: código abierto y públicamente accesible, JSON válido
  contra el schema, **estructura plana** (`registry.json` y `[item].json` en la raíz, sin
  anidamiento), y el array `files` no puede incluir `content` inline (debe referenciar rutas).
  Esto **no aplica** si no se busca esa listing pública — una registry privada con auth headers
  vive fuera de este requisito por diseño (la propia página de autenticación asume registries
  que nunca podrían cumplir "públicamente accesible"). —
  https://ui.shadcn.com/docs/registry/registry-index
- **No hay versionado nativo de un mismo componente** dentro del esquema (sin campo `version`).
  La única primitiva relacionada es `shadcn diff` / `shadcn add --diff`, que compara el código
  ya copiado en el proyecto consumidor contra la versión servida actualmente por la URL/registry
  — pero la documentación oficial consultada (changelog CLI v4, marzo 2026) **no confirma
  explícitamente que `--diff` funcione contra registries de terceros namespaced**, solo lo
  documenta para la registry oficial. **No verificado** — esto habría que probarlo
  empíricamente contra una registry propia antes de apoyarse en ello como mecanismo de "aviso de
  actualización disponible". — https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- Blogs de terceros (no doc oficial) sugieren "versionado" vía URL/tag propio (p. ej. servir
  `/r/v2/flashcard.json`), es decir: el versionado de un componente es responsabilidad de cómo
  la propia registry organiza sus rutas, no algo que el CLI resuelva por ti.

### Recomendación

**Adoptar el CLI y esquema oficiales de shadcn/ui como mecanismo primario de distribución.** La
evidencia (documentación oficial dedicada, con secciones específicas de autenticación,
namespaces e índice, más los cambios de CLI 3.0 y v4 fechados en 2025-2026) confirma que el
mecanismo de registry de terceros es real, está pensado explícitamente para este caso de uso
("crea y hostea tu propia registry, independiente de la oficial") y no es un uso no-soportado.
Esto **descarta como innecesario** construir un CLI propio desde cero (el riesgo del `design.md`
§9 "el mecanismo de terceros no soporta lo que necesitamos" **no se confirma**); mantenerlo solo
como plan B teórico, no como trabajo a hacer ahora.

Dos huecos concretos a llevar como riesgo activo, no como bloqueo:
1. **Sin versionado nativo de un componente.** Diseñar desde el principio una convención propia
   (p. ej. rutas `/r/{name}.json` = "latest" siempre, y decidir explícitamente si se ofrece o no
   una vía para pins de versiones antiguas) en vez de asumir que el CLI lo resuelve.
2. **`shadcn diff` contra registries de terceros: no verificado.** Antes de documentar "así se
   comprueban actualizaciones" en la librería, probarlo manualmente contra una registry propia de
   prueba y documentar el resultado real.

---

## Pregunta 2 — ¿Qué base de primitivos accesibles conviene para React 19?

### Evidencia

Metodología: en vez de fiarme de anuncios de marketing o READMEs, consulté (a) cambios/PRs
fechados en los changelogs oficiales y (b) el campo `peerDependencies` **publicado en el
registro de npm ahora mismo** (`registry.npmjs.org`, consultado hoy) para la versión `latest` de
cada librería — esto es lo que de verdad determina si `npm install` funciona sin flags.

| Librería | Paquete consultado | Versión `latest` hoy | `peerDependencies.react` publicado |
|---|---|---|---|
| Radix UI (primitives) | `@radix-ui/react-dialog` | 1.1.23 | `^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1` |
| React Aria | `react-aria-components` | 1.20.0 | `^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1` |
| React Aria (core) | `react-aria` | 3.51.0 | idéntico al anterior |
| Ariakit | `@ariakit/react` (paquete estable actual, no el histórico `ariakit`) | 0.4.37 | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` (limpio) |
| Base UI | `@base-ui/react` (MUI; homepage `base-ui.com`, repo `mui/base-ui`) | 1.7.0 | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` (limpio) |

**Lectura de esta tabla:** tanto Radix UI como React Aria, en sus paquetes `latest` **estables**
publicados hoy, declaran el peer dependency de React 19 restringido a la etiqueta de candidato
`19.0.0-rc.1`, no a `^19.0.0` general. Esto **no es un rumor**: es el JSON real publicado en npm
hoy. Consecuencia práctica confirmada por fuentes independientes: con `npm install` (no con
pnpm/yarn, que resuelven distinto) hace falta `--legacy-peer-deps` o `--force` para instalar
Radix o React Aria junto a React 19 estable — esto lo confirma **la propia documentación de
shadcn/ui**: "Package maintainers need to update their peer dependencies... users can use
`--force` or `--legacy-peer-deps`" — https://ui.shadcn.com/docs/react-19 — y lo reproducen
issues de comunidad (p. ej. `excalidraw/excalidraw#9253`, `radix-ui/primitives#2909`).

Radix tiene una **v1.2.0 en release-candidate** (publicada por primera vez 2026-07-25, última
prerelease usada para esta comprobación: `1.2.0-rc.1785512840124`, 2026-07-31) cuyo
`peerDependencies.react` ya está corregido a `^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc` —
es decir, el arreglo existe pero **todavía no es la versión `latest` publicada**, así que hoy
(2026-08-11) el problema de instalación sigue vigente para quien instale Radix normal.
Changelog de funcionalidad (no solo peer deps): Radix confirmó "Full React 19 compatibility" en
PR #2952 (19 jun 2024) y ha seguido arreglando bugs específicos de React 19 tan recientes como
julio 2026 ("Fixed stale `onEscapeKeyDown`/`onDismiss` handlers on React 19.2", PR #4015) —
https://www.radix-ui.com/primitives/docs/overview/releases

React Aria: el issue de seguimiento de compatibilidad
(`adobe/react-spectrum#6445`, abierto 24-may-2024) fue resuelto vía PR #6437 (confirmado por
comentario del mantenedor `snowystinger` el mismo día:
"Being handled in adobe/react-spectrum#6437" — vía GitHub API). El release del 19-may-2025
añadió explícitamente "Support React 19 ref cleanup callback" —
https://react-spectrum.adobe.com/v3/releases/2025-05-19.html. El propio equipo declara que
**nunca subirán el mínimo a React 19** porque mantienen React 16.8+ como base — es decisión de
diseño, no limitación técnica, según hallazgos de búsqueda (no verificado con cita textual
directa del equipo, solo con síntesis de terceros — **marcar como no confirmado al 100%**).

Ariakit: el paquete histórico `ariakit` (sin scope, v2 "next", última publicada
`2.0.0-next.44`) **NO** incluye React 19 en su peer dependency (`^17.0.0 || ^18.0.0` solamente)
— esto es una prerelease/rama distinta y no representa el Ariakit actual en uso. El paquete
correcto y activamente mantenido es `@ariakit/react` (0.4.x), que sí declara `^19.0.0` limpio.
Confirmado también por changelog de la comunidad (fixes de refs para React 19, tipos de
`RefObject`, callback refs de `Portal`).

Base UI: dos nombres de paquete en circulación — `@base-ui-components/react` (nombre antiguo/
beta, última versión `1.0.0-rc.0`, con peer deps también limpios `^17||^18||^19`) y
`@base-ui/react` (nombre **actual**, confirmado como el oficial vía metadata de npm:
`homepage: https://base-ui.com`, `repository: mui/base-ui`, y confirmado por la propia doc de
Quick Start de base-ui.com que instruye `pnpm add @base-ui/react`). Versión estable 1.7.0, sin
sufijo RC, peer deps limpios.

### Qué queda sin verificar

- No he ejecutado yo mismo un proyecto React 19 con cada librería (evidencia de changelog +
  peer dep publicado, no ejecución propia) — la tarea pedía "verificar con evidencia ejecutada o
  changelog/release notes explícitos"; cumplo la segunda vía pero no la primera. Recomendación
  operativa: antes de fijar la capa 1 en `design.md`, ejecutar un smoke test real (un componente
  con foco/portal/diálogo) en React 19 estable con cada candidato finalista.
- La cita de que React Aria "nunca subirá su mínimo a React 19" no tiene URL directa a una
  declaración textual del equipo, solo aparece en agregación de terceros — tratarla como
  plausible, no como hecho confirmado.

### Recomendación

**Base UI (`@base-ui/react`, MUI) es hoy la opción con la señal más limpia para React 19**: peer
dependency sin restricción de release-candidate, versión estable (no RC) publicada, mantenida
por el mismo equipo que ya migró Material UI y MUI X a React 19
(https://mui.com/blog/react-19-update/). Es además la base "headless" más nueva y más cercana en
filosofía a lo que Radix ofrece (composición de primitivos sin estilo).

Sin embargo, **Radix UI sigue siendo la opción por defecto razonable a corto plazo** porque: (a)
es la base que usa shadcn/ui, con quien ya se alinea el modelo de distribución (§0.2 del
requirements), lo que maximiza reutilización de patrones/documentación/ejemplos shadcn ya
existentes; (b) el problema real detectado (peer dep aún en `-rc.1`) es cosmético/de
instalación, no funcional — se resuelve con `--legacy-peer-deps` (que shadcn ya documenta como
paso esperado) o usando pnpm/yarn; y (c) el propio fix ya está en camino (v1.2.0 RC).

**Recomendación concreta**: adoptar Radix UI como capa 1 por defecto (alineado con shadcn/ui,
RNF-5 exige fijar versión exacta de todos modos), pero **documentar explícitamente** en el
`design.md` la fricción de instalación con npm + React 19 (y el flag necesario) como parte del
contrato con el consumidor, y **re-evaluar Base UI en 3-6 meses** cuando salga de RC y tenga más
adopción — no descartarlo ahora, pero tampoco bloquear la decisión actual esperándolo. Evitar
React Aria salvo necesidad puntual de un primitivo que Radix no cubra bien (p. ej. algunas
piezas de "collections" complejas), dado que comparte la misma fricción de peer-dep que Radix
sin la ventaja de alineación con shadcn.

---

## Pregunta 3 — ¿Tailwind como peer dependency obligatoria?

### Evidencia

**shadcn/ui mismo exige Tailwind, sin excepción documentada.** La guía de instalación manual
oficial da por hecho Tailwind ("los componentes se estilan con Tailwind CSS... sigue las
instrucciones de instalación de Tailwind") — https://ui.shadcn.com/docs/installation/manual — y
no existe una vía oficial "sin Tailwind" para el propio shadcn/ui. Un hilo de discusión oficial
de la comunidad (`shadcn-ui/ui#2832`, "Shadcn-ui variation without Tailwind") confirma que esto
es una petición recurrente, no resuelta por el proyecto — no localicé respuesta oficial del
mantenedor aceptándolo.

**shadcn/ui sí soporta Tailwind v4** (confirmado, no ambiguo): doc dedicada
https://ui.shadcn.com/docs/tailwind-v4, con soporte de la directiva `@theme`, `data-slot` en
cada primitivo, colores migrados de HSL a OKLCH, y migración documentada como "no rompe" para
proyectos v3/React 18 existentes. Esto confirma que **incluso dentro del propio shadcn, Tailwind
no es una versión congelada** — ya se movió una vez (v3→v4) y seguirá evolucionando, lo cual es
relevante como riesgo de arrastre si nuestra librería copia ese acoplamiento 1:1.

**El esquema `registry-item.json` (el mecanismo de distribución, independiente de qué CSS uses)
NO obliga a Tailwind.** Verificado leyendo la especificación completa de sus propiedades de
estilo:
- `cssVars` — variables CSS planas (`theme`/`light`/`dark`), agnósticas de framework CSS.
- `css` — reglas CSS arbitrarias inyectables (puede usar sintaxis Tailwind como `@layer`, pero
  no está obligado a hacerlo — son reglas CSS libres).
- `tailwind` — **marcado deprecated**, sustituido por `cssVars.theme`, señal de que el propio
  shadcn se está alejando de acoplar su config de Tailwind al esquema del registry.
— https://ui.shadcn.com/docs/registry/registry-item-json

Es decir: **el mecanismo de registry/CLI de shadcn (que sí queremos adoptar, pregunta 1) no
exige que los componentes que distribuyas usen Tailwind.** La obligatoriedad de Tailwind en
shadcn/ui viene de cómo shadcn/ui *decidió escribir sus propios componentes* (clases utility de
Tailwind en el JSX), no de una restricción del formato de registry en sí.

**Existen precedentes activos de "shadcn sin Tailwind"**: proyecto comunitario
`shadcn-css.com` / repo `qwalker8408/shadcn-css` — mismos componentes/patrón de copy-paste,
reescritos con **CSS Modules** en vez de Tailwind, con soporte de `next-themes`. Esto demuestra
que el patrón de capas (headless + estilo + copy-paste) **no depende intrínsecamente de
Tailwind** — es una elección de implementación de la capa 2 (`design.md` §2), reproducible con
CSS Modules o CSS custom properties planas. También existe un preset de UnoCSS para shadcn,
mostrando que incluso dentro del "mundo utility-CSS" Tailwind no es la única opción compatible
con el patrón.

### Recomendación

**No exigir Tailwind como peer dependency del núcleo.** La evidencia muestra que:
1. El objetivo de producto (§0.1 requirements.md: "debe poder usarse en cualquier proyecto
   React") es incompatible con una dependencia obligatoria de un framework CSS de terceros que
   además cambia de versión mayor con migraciones no triviales (v3→v4 con features de navegador
   "bleeding edge", según la propia doc de shadcn).
2. El mecanismo de distribución elegido (registry-item.json) ya soporta de forma nativa la vía
   agnóstica: **CSS custom properties (`cssVars`) como contrato de theming** (que es exactamente
   lo que RF-16 ya pide) más `css` para reglas puntuales, sin depender de una capa de utilidades.
3. Hay precedente probado (aunque comunitario, no oficial) de reescribir el patrón shadcn con
   CSS Modules manteniendo el mismo modelo copy-paste.

**Diseño concreto sugerido para `design.md` (capa 2 "Styled layer")**: escribir los componentes
del núcleo con **CSS custom properties + clases planas (o CSS Modules)** como base obligatoria
—esto es lo único que garantiza "funciona en cualquier proyecto React sin más setup"—, y
opcionalmente ofrecer, como variante de registry namespaced o flag de instalación, una capa de
utilidades Tailwind para quien ya lo use en su proyecto (dado que gran parte del ecosistema
shadcn sí lo trae puesto de fábrica, incluyendo SkillNet). Esto evita forzar la decisión de
Tailwind sí/no en una sola dirección y es coherente con que `registry-item.json` ya declara
`tailwind` como deprecated a favor de `cssVars`.

**Punto no resuelto que sí requeriría medición**: si `cva` (class-variance-authority), mencionado
en `design.md` §2 como candidato para la capa de variantes, funciona igual de bien generando
clases CSS Modules/planas que generando clases Tailwind — no lo he verificado; es una decisión
de implementación para la fase de diseño detallado, no bloquea esta pregunta de investigación.
