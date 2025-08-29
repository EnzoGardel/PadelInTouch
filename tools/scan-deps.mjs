// tools/scan-deps.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (EXTS.includes(path.extname(entry.name))) {
      files.push(path.join(dir, entry.name));
    }
  }
})(ROOT);

const pkgRegexes = [
  /import\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,            // import x from 'pkg'
  /import\s*['"]([^'"]+)['"]/g,                          // import 'pkg'
  /export\s+[^'"]*?from\s+['"]([^'"]+)['"]/g,            // export * from 'pkg'
  /require\(\s*['"]([^'"]+)['"]\s*\)/g                   // require('pkg')
];

const toBase = (spec) => {
  if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("/")) return null;
  // next/* -> next ; react-dom/* -> react-dom ; @scope/name/path -> @scope/name
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    return `${scope}/${name}`;
  }
  return spec.split("/")[0];
};

const found = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  for (const re of pkgRegexes) {
    let m;
    while ((m = re.exec(src))) {
      const base = toBase(m[1]);
      if (base) found.add(base);
    }
  }
}

// Saca alias típicos internos que no son paquetes “instalables”
const internal = new Set(["next/navigation", "next/server", "next/headers"]);
for (const i of internal) found.delete(i);

// Carga package.json para mostrar faltantes
const pj = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const installed = new Set([
  ...Object.keys(pj.dependencies || {}),
  ...Object.keys(pj.devDependencies || {})
]);

const runtime = [];
for (const name of [...found].sort()) {
  if (!installed.has(name)) runtime.push(name);
}

console.log("\n=== Detectado en imports ===");
console.log([...found].sort().join("\n") || "(ninguno)");

console.log("\n=== No instalados (runtime) ===");
console.log(runtime.length ? runtime.join("\n") : "(todo ok)");

if (runtime.length) {
  const ps = "pnpm add " + runtime.map((n) => (n.startsWith("@") ? `'${n}'` : n)).join(" ");
  const sh = "pnpm add " + runtime.join(" ");
  console.log("\nPowerShell:\n" + ps);
  console.log("\nBash:\n" + sh);
}
