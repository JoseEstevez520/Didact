import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const registryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const workspaceRoot = path.resolve(registryRoot, "../..");
export const sourcePath = path.join(registryRoot, "registry.json");
export const outputRoot = path.join(registryRoot, "public", "r");
export const registryBaseUrl = (
  process.env.DIDACT_REGISTRY_BASE_URL ??
  "https://raw.githubusercontent.com/JoseEstevez520/Didact/main/packages/registry/public/r"
).replace(/\/$/, "");

export const educationalSourcePrefix = "packages/core/src/components/";

const manifestRegistryItems = new Map([
  ["didact.flashcard", "flashcard"],
  ["didact.quiz", "quiz-item"],
  ["didact.matching-exercises", "matching-exercises"],
  ["didact.hint-reveal", "hint-reveal"],
  ["didact.rubric", "rubric"],
  ["didact.glossary", "glossary"],
  ["didact.progress", "progress-indicators"],
  ["didact.mastery-badge", "mastery-badge"],
  ["didact.timeline", "timeline"],
  ["didact.practice-set", "practice-set"],
  ["didact.retrieval-practice-session", "retrieval-practice-session"],
  ["didact.self-explanation-prompt", "generative-learning"],
  ["didact.worked-example", "generative-learning"],
  ["didact.completion-problem", "generative-learning"],
  ["didact.numeric-question", "numeric-question"],
  ["didact.word-bank", "word-bank"],
  ["didact.hotspot", "hotspot"],
  ["didact.interactive-media", "interactive-media"],
  ["didact.data-explorer", "data-explorer"],
  ["didact.branching-scenario", "branching-scenario"],
  ["didact.simulation-lab", "simulation-lab"],
  ["didact.code-exercise", "code-exercise"],
  ["didact.label-diagram", "label-diagram"],
  ["didact.concept-map", "concept-map"],
  ["didact.drawing-response", "drawing-response"],
  ["didact.equation-workbench", "equation-workbench"],
  ["didact.evidence-annotation", "evidence-annotation"],
  ["didact.measurement-lab", "measurement-lab"],
]);

const uiExports = new Map([
  ["Button", "button"],
  ["buttonVariants", "button"],
  ["Card", "card"],
  ["CardHeader", "card"],
  ["CardTitle", "card"],
  ["CardDescription", "card"],
  ["CardAction", "card"],
  ["CardContent", "card"],
  ["CardFooter", "card"],
  ["Badge", "badge"],
  ["badgeVariants", "badge"],
  ["Separator", "separator"],
  ["Toggle", "toggle"],
  ["toggleVariants", "toggle"],
  ["ToggleGroup", "toggle-group"],
  ["ToggleGroupItem", "toggle-group"],
  ["Input", "input"],
  ["Textarea", "textarea"],
  ["Label", "label"],
  ["RadioGroup", "radio-group"],
  ["RadioGroupItem", "radio-group"],
  ["Checkbox", "checkbox"],
  ["Popover", "popover"],
  ["PopoverTrigger", "popover"],
  ["PopoverContent", "popover"],
  ["PopoverAnchor", "popover"],
  ["Progress", "progress"],
]);

export function readRegistry() {
  return JSON.parse(fs.readFileSync(sourcePath, "utf8"));
}

export function targetFor(source) {
  const normalized = source.replaceAll("\\", "/");
  if (normalized.startsWith("packages/ui/src/components/")) {
    return normalized.replace("packages/ui/src/components/", "components/ui/");
  }
  if (normalized === "packages/ui/src/lib/cn.ts" || normalized === "packages/core/src/lib/cn.ts") {
    return "lib/didact/cn.ts";
  }
  if (normalized.startsWith(educationalSourcePrefix)) {
    return normalized.replace(educationalSourcePrefix, "components/didact/");
  }
  if (normalized.startsWith("packages/spaced-repetition/src/")) {
    return normalized.replace("packages/spaced-repetition/src/", "lib/didact/spaced-repetition/");
  }
  if (normalized.startsWith("packages/schema/src/")) {
    return normalized.replace("packages/schema/src/", "lib/didact/schema/");
  }
  throw new Error(`No registry target mapping for ${source}`);
}

function parseSpecifiers(body) {
  return body
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const typeOnly = part.startsWith("type ");
      const value = typeOnly ? part.slice(5).trim() : part;
      return { typeOnly, value };
    });
}

function renderGroupedImports(groups, prefix) {
  return [...groups.entries()]
    .map(([moduleName, specifiers]) => {
      const body = specifiers
        .map(({ typeOnly, value }) => `${typeOnly ? "type " : ""}${value}`)
        .join(", ");
      return `import { ${body} } from "${prefix}${moduleName}";`;
    })
    .join("\n");
}

function rewriteUiImports(content, registryDependencies, itemName) {
  return content.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']@didact\/ui["'];?/g,
    (_match, body) => {
      const groups = new Map();
      for (const specifier of parseSpecifiers(body)) {
        const importedName = specifier.value.split(/\s+as\s+/)[0];
        const dependency = uiExports.get(importedName);
        if (!dependency) {
          throw new Error(`${itemName}: cannot map @didact/ui export ${importedName}`);
        }
        if (!registryDependencies.includes(dependency)) {
          throw new Error(`${itemName}: import ${importedName} requires registryDependencies[${dependency}]`);
        }
        const group = groups.get(dependency) ?? [];
        group.push(specifier);
        groups.set(dependency, group);
      }
      return renderGroupedImports(groups, "@/components/ui/");
    },
  );
}

function rewriteSchedulerImports(content, registryDependencies, itemName) {
  return content.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']@didact\/spaced-repetition["'];?/g,
    (_match, body) => {
      if (!registryDependencies.includes("spaced-repetition")) {
        throw new Error(`${itemName}: scheduler import requires registryDependencies[spaced-repetition]`);
      }
      const groups = new Map();
      for (const specifier of parseSpecifiers(body)) {
        const importedName = specifier.value.split(/\s+as\s+/)[0];
        const moduleName = importedName.startsWith("SM2") || importedName === "sm2Scheduler" ? "sm2" : "types";
        const group = groups.get(moduleName) ?? [];
        group.push(specifier);
        groups.set(moduleName, group);
      }
      return renderGroupedImports(groups, "@/lib/didact/spaced-repetition/");
    },
  );
}

function rewriteSchemaImports(content, registryDependencies, itemName) {
  return content.replace(
    /import\s*(type\s+)?\{([^}]*)\}\s*from\s*["']@didact\/schema["'];?/g,
    (_match, typeImport, body) => {
      const schemaModule = registryDependencies.includes("artifact-execution-schema")
        ? "artifact-execution"
        : registryDependencies.includes("simulation-schema")
          ? "simulation"
        : registryDependencies.includes("decision-graph-schema")
          ? "decision-graph"
        : registryDependencies.includes("data-coordinate-schema")
          ? "data-coordinate"
        : registryDependencies.includes("interactive-media-schema")
          ? "interactive-media"
          : undefined;
      if (!schemaModule) throw new Error(`${itemName}: schema import requires a schema registryDependency`);
      return `import { ${parseSpecifiers(body).map(({ typeOnly, value }) => `${typeImport || typeOnly ? "type " : ""}${value}`).join(", ")} } from "@/lib/didact/schema/${schemaModule}";`;
    },
  );
}

export function rewriteContent(content, item) {
  const dependencies = item.registryDependencies ?? [];
  let result = rewriteUiImports(content, dependencies, item.name);
  result = rewriteSchedulerImports(result, dependencies, item.name);
  result = rewriteSchemaImports(result, dependencies, item.name);
  result = result
    .replaceAll('from "../lib/cn.js"', 'from "@/lib/didact/cn"')
    .replaceAll('from "./toggle.js"', 'from "@/components/ui/toggle"')
    .replaceAll('from "./flashcard.js"', 'from "@/components/didact/flashcard"');
  if (item.name === "spaced-repetition") {
    result = result
      .replaceAll('from "./types"', 'from "@/lib/didact/spaced-repetition/types"')
      .replaceAll('from "./types.js"', 'from "@/lib/didact/spaced-repetition/types"');
  }
  return result;
}

export function materializeItem(sourceItem) {
  const item = structuredClone(sourceItem);
  let localRegistryDependencies = item.registryDependencies ?? [];
  if (item.name !== "didact-theme") {
    localRegistryDependencies = [...new Set(["didact-theme", ...localRegistryDependencies])];
  }
  item.registryDependencies = localRegistryDependencies;
  item.files = (item.files ?? []).map((file) => {
    const absolute = path.join(workspaceRoot, file.path);
    if (!fs.existsSync(absolute)) throw new Error(`${item.name}: missing source file ${file.path}`);
    const target = targetFor(file.path);
    // Both workspace packages keep a local cn.ts to stay independently buildable. A copied
    // dependency tree has one shared target, so always emit the UI copy to make deduplication
    // deterministic regardless of dependency traversal order.
    const contentSource =
      target === "lib/didact/cn.ts"
        ? path.join(workspaceRoot, "packages/ui/src/lib/cn.ts")
        : absolute;
    return {
      path: target,
      content: rewriteContent(fs.readFileSync(contentSource, "utf8"), item),
      type: file.type,
      target,
    };
  });
  // Source items document the tokens they use, but the public artifacts install the complete
  // reusable setup once through didact-theme. Keeping per-item values here would override the
  // shared light/dark variables during shadcn's dependency merge.
  if (item.name !== "didact-theme") delete item.cssVars;
  item.registryDependencies = localRegistryDependencies.map(
    (dependency) => `${registryBaseUrl}/${dependency}.json`,
  );
  return item;
}

async function collectionKitItems(registry) {
  const catalogEntry = path.join(workspaceRoot, "packages", "catalog", "dist", "index.js");
  if (!fs.existsSync(catalogEntry)) {
    throw new Error("Catalog build is required before registry kits. Run pnpm --filter @didact/catalog build.");
  }
  const { availableCollections } = await import(pathToFileURL(catalogEntry).href);
  const sourceNames = new Set(registry.items.map(({ name }) => name));
  return availableCollections.flatMap((collection) => {
    if (!collection.kit) return [];
    const dependencies = [...new Set(
      collection.items
        .filter(({ role }) => collection.kit.includeRoles.includes(role))
        .map(({ manifestId }) => {
          const itemName = manifestRegistryItems.get(manifestId);
          if (!itemName) throw new Error(`${collection.id}: no registry item maps ${manifestId}`);
          if (!sourceNames.has(itemName)) throw new Error(`${collection.id}: registry item ${itemName} does not exist`);
          return itemName;
        }),
    )];
    if (dependencies.length === 0) throw new Error(`${collection.id}: kit has no installable dependencies`);
    return [{
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: collection.kit.name,
      type: "registry:block",
      title: typeof collection.title === "string" ? collection.title : collection.title.en ?? Object.values(collection.title)[0],
      description: typeof collection.description === "string" ? collection.description : collection.description.en ?? Object.values(collection.description)[0],
      registryDependencies: dependencies,
      dependencies: [],
      files: [],
      meta: { collectionId: collection.id, collectionVersion: collection.version },
    }];
  });
}

export async function materializeRegistry(registry = readRegistry()) {
  const sourceItems = [...registry.items, ...await collectionKitItems(registry)];
  const names = new Set();
  for (const item of sourceItems) {
    if (names.has(item.name)) throw new Error(`Duplicate registry item: ${item.name}`);
    names.add(item.name);
  }
  const items = sourceItems.map(materializeItem);
  return { ...registry, items };
}

export function kitItems(registry) {
  return registry.items.filter((item) => item.meta?.collectionId);
}

export function educationalItems(registry) {
  return registry.items.filter((item) =>
    (item.files ?? []).some((file) => file.path.startsWith("components/didact/")),
  );
}

export function importSpecifiers(content) {
  return [...content.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)].map((match) => match[1]);
}

export function dependencyName(address) {
  if (!address.includes("/")) return address;
  const pathname = new URL(address).pathname;
  return path.posix.basename(pathname, ".json");
}
