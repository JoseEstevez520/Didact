import fs from "node:fs";
import path from "node:path";

import { dependencyName, importSpecifiers, outputRoot, registryRoot } from "./registry-tools.mjs";

const fixtureRoot = path.join(registryRoot, "fixture", "consumer");
const generatedRoot = path.join(fixtureRoot, ".generated");
const generatedSource = path.join(generatedRoot, "src");
const index = JSON.parse(fs.readFileSync(path.join(outputRoot, "registry.json"), "utf8"));
const byName = new Map(index.items.map((item) => [item.name, item]));
const installed = new Set();
const targetContents = new Map();
const publicDependencies = new Set();
const rootItems = [
  "hint-reveal",
  "word-bank",
  "interactive-media",
  "measurement-lab",
  "math-foundations",
];

function installItem(name) {
  if (installed.has(name)) return;
  const item = byName.get(name);
  if (!item) throw new Error(`Consumer fixture cannot resolve registry item ${name}`);
  for (const dependency of item.dependencies ?? []) publicDependencies.add(dependency);
  for (const dependency of item.registryDependencies ?? []) installItem(dependencyName(dependency));
  for (const file of item.files ?? []) {
    const previous = targetContents.get(file.target);
    if (previous !== undefined && previous !== file.content) {
      throw new Error(`Consumer fixture received conflicting copies for ${file.target}`);
    }
    targetContents.set(file.target, file.content);
  }
  installed.add(name);
}

for (const item of rootItems) installItem(item);

fs.rmSync(generatedRoot, { recursive: true, force: true });
fs.mkdirSync(generatedSource, { recursive: true });

for (const [target, content] of targetContents) {
  if (importSpecifiers(content).some((specifier) => specifier.startsWith("@didact/"))) {
    throw new Error(`${target} still imports a Didact workspace package`);
  }
  const destination = path.join(generatedSource, target);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
}

for (const file of ["activity.tsx", "index.html", "main.tsx", "package.json", "styles.css", "tsconfig.json", "vite.config.ts"]) {
  fs.copyFileSync(path.join(fixtureRoot, file), path.join(generatedRoot, file));
}

const packageJson = JSON.parse(fs.readFileSync(path.join(generatedRoot, "package.json"), "utf8"));
const declaredPackages = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
]);
const packageName = (specifier) =>
  specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];
const withoutVersion = (dependency) => {
  if (dependency.startsWith("@")) {
    const separator = dependency.indexOf("@", 1);
    return separator === -1 ? dependency : dependency.slice(0, separator);
  }
  return dependency.split("@")[0];
};

for (const dependency of publicDependencies) {
  const name = withoutVersion(dependency);
  if (!declaredPackages.has(name)) throw new Error(`Fixture package.json misses public dependency ${name}`);
}

const allSources = [
  ...[...targetContents].map(([target, content]) => ({ target, content })),
  { target: "activity.tsx", content: fs.readFileSync(path.join(generatedRoot, "activity.tsx"), "utf8") },
];
for (const { target, content } of allSources) {
  for (const specifier of importSpecifiers(content)) {
    if (specifier.startsWith("@didact/")) throw new Error(`${target} imports workspace package ${specifier}`);
    if (specifier.startsWith("@/")) {
      const localTarget = specifier.slice(2);
      const resolves = [...targetContents.keys()].some(
        (candidate) => candidate.replace(/\.(tsx?|jsx?)$/, "") === localTarget,
      );
      if (!resolves) throw new Error(`${target} has unresolved copied import ${specifier}`);
    } else if (!specifier.startsWith(".")) {
      const external = packageName(specifier);
      if (!declaredPackages.has(external)) {
        throw new Error(`${target} imports undeclared public package ${external}`);
      }
    }
  }
}

const copiedFiles = [...targetContents.keys()].sort();
fs.writeFileSync(
  path.join(generatedRoot, "materialization.json"),
  `${JSON.stringify(
    {
      rootItems,
      registryItems: [...installed],
      publicDependencies: [...publicDependencies],
      copiedFiles,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Verified clean consumer: ${rootItems.join(", ")} + ${installed.size - rootItems.length} registry dependencies, ` +
    `${copiedFiles.length} copied files, all imports and public dependencies resolve`,
);
