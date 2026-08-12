import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  dependencyName,
  educationalItems,
  importSpecifiers,
  kitItems,
  outputRoot,
  registryBaseUrl,
} from "./registry-tools.mjs";

const index = JSON.parse(fs.readFileSync(path.join(outputRoot, "registry.json"), "utf8"));
const byName = new Map(index.items.map((item) => [item.name, item]));

test("every index item has a standalone public artifact", () => {
  for (const item of index.items) {
    const artifact = JSON.parse(fs.readFileSync(path.join(outputRoot, `${item.name}.json`), "utf8"));
    assert.deepEqual(artifact, item, `${item.name}.json differs from the public index`);
  }
});

test("catalog collections generate dependency-only install kits", () => {
  const kits = kitItems(index);
  assert.equal(kits.length, 6);
  assert.deepEqual(kits.map(({ name }) => name).sort(), [
    "corporate-training",
    "language-learning",
    "learning-essentials",
    "math-foundations",
    "technical-training",
    "visual-spatial",
  ]);
  for (const kit of kits) {
    assert.equal(kit.type, "registry:block");
    assert.deepEqual(kit.files, []);
    assert.ok(kit.registryDependencies.length > 1, `${kit.name} needs theme plus component dependencies`);
    for (const dependency of kit.registryDependencies) {
      assert.ok(byName.has(dependencyName(dependency)), `${kit.name} references missing ${dependency}`);
    }
  }
});

test("all educational artifacts are copy-paste local", () => {
  const educational = educationalItems(index);
  assert.ok(educational.length >= 10, "expected the current educational catalog");
  for (const item of educational) {
    assert.ok(
      item.registryDependencies.some((value) => dependencyName(value) === "didact-theme"),
      `${item.name} misses theme setup`,
    );
    for (const dependency of item.registryDependencies) {
      assert.ok(dependency.startsWith(`${registryBaseUrl}/`), `${item.name} has an unqualified dependency`);
    }
    for (const file of item.files) {
      assert.equal(file.path, file.target);
      assert.match(file.path, /^(components|lib)\//);
      for (const specifier of importSpecifiers(file.content)) {
        assert.ok(!specifier.startsWith("@didact/"), `${item.name} retains ${specifier}`);
      }
    }
  }
});

test("every local alias import resolves through the registry dependency closure", () => {
  function closure(name, seen = new Set()) {
    if (seen.has(name)) return seen;
    seen.add(name);
    for (const dependency of byName.get(name)?.registryDependencies ?? []) {
      closure(dependencyName(dependency), seen);
    }
    return seen;
  }

  for (const item of educationalItems(index)) {
    const availableTargets = new Set(
      [...closure(item.name)].flatMap((name) => (byName.get(name)?.files ?? []).map((file) => file.target)),
    );
    for (const file of item.files) {
      for (const specifier of importSpecifiers(file.content).filter((value) => value.startsWith("@/"))) {
        const target = specifier.slice(2);
        const resolves = [...availableTargets].some(
          (candidate) => candidate.replace(/\.(tsx?|jsx?)$/, "") === target,
        );
        assert.ok(resolves, `${item.name}/${file.path}: ${specifier} is not provided by registryDependencies`);
      }
    }
  }
});

test("duplicate targets in a dependency tree are byte-identical", () => {
  for (const item of educationalItems(index)) {
    const contentsByTarget = new Map();
    const visit = (name, seen = new Set()) => {
      if (seen.has(name)) return;
      seen.add(name);
      const current = byName.get(name);
      for (const file of current?.files ?? []) {
        const previous = contentsByTarget.get(file.target);
        if (previous !== undefined) {
          assert.equal(file.content, previous, `${item.name}: conflicting copies target ${file.target}`);
        } else {
          contentsByTarget.set(file.target, file.content);
        }
      }
      for (const dependency of current?.registryDependencies ?? []) visit(dependencyName(dependency), seen);
    };
    visit(item.name);
  }
});

test("theme setup provides semantic tokens and a radius-derived Tailwind scale", () => {
  const theme = byName.get("didact-theme");
  assert.equal(theme.type, "registry:theme");
  assert.deepEqual(theme.dependencies ?? [], []);
  const vars = theme.cssVars.theme;
  const semanticTokens = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "border",
    "input",
    "ring",
  ];
  for (const token of semanticTokens) {
    assert.equal(vars[`color-${token}`], `var(--${token})`, `missing Tailwind alias for ${token}`);
    assert.ok(theme.cssVars.light[token], `missing light token ${token}`);
    assert.ok(theme.cssVars.dark[token], `missing dark token ${token}`);
  }
  assert.equal(theme.cssVars.light.radius, "0.625rem");
  assert.equal(vars["radius-md"], "calc(var(--radius) - 2px)");
  assert.equal(vars["radius-lg"], "var(--radius)");
  assert.equal(vars["radius-xl"], "calc(var(--radius) + 4px)");
});
