import fs from "node:fs";
import path from "node:path";

import { materializeRegistry, outputRoot } from "./registry-tools.mjs";

const registry = await materializeRegistry();
fs.mkdirSync(outputRoot, { recursive: true });

for (const item of registry.items) {
  fs.writeFileSync(path.join(outputRoot, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
}

fs.writeFileSync(path.join(outputRoot, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Built ${registry.items.length} registry items in ${outputRoot}`);
