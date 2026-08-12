import { importSpecifiers, materializeRegistry, readRegistry } from "./registry-tools.mjs";

const source = readRegistry();
const names = new Set();
for (const item of source.items) {
  if (names.has(item.name)) throw new Error(`Duplicate registry item: ${item.name}`);
  names.add(item.name);
}
for (const item of source.items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (!names.has(dependency)) throw new Error(`${item.name}: unknown registry dependency ${dependency}`);
  }
}

const built = await materializeRegistry(source);
for (const item of built.items) {
  for (const file of item.files ?? []) {
    for (const specifier of importSpecifiers(file.content)) {
      if (specifier.startsWith("@didact/")) {
        throw new Error(`${item.name}/${file.path}: unresolved workspace import ${specifier}`);
      }
    }
  }
}
console.log(`Linted ${built.items.length} registry items and their dependency/import graph`);
