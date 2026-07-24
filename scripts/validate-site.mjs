import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publishRoots = ["index.html", "favicon.svg", "assets", "books", "collections"];
const textExtensions = new Set([".css", ".html", ".js", ".svg"]);
const files = [];

function collect(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing publish root: ${relativePath}`);
  }
  const stat = fs.statSync(absolutePath);
  if (!stat.isDirectory()) {
    files.push(relativePath);
    return;
  }
  for (const name of fs.readdirSync(absolutePath)) {
    collect(path.join(relativePath, name));
  }
}

publishRoots.forEach(collect);

const failures = [];
const localReferencePattern =
  /(?:href|src|content)=["'](\/(?:assets|books|collections)\/[^"'?#]+|\/favicon\.svg)["']|url\(["']?(\/(?:assets|books|collections)\/[^"')?#]+|\/favicon\.svg)/g;

for (const relativePath of files) {
  if (!textExtensions.has(path.extname(relativePath))) continue;
  const contents = fs.readFileSync(path.join(root, relativePath), "utf8");

  if (contents.includes("REPLACE_ASIN")) {
    failures.push(`${relativePath}: unresolved Amazon placeholder`);
  }
  if (/__VINEXT_RSC_|codex-preview/.test(contents)) {
    failures.push(`${relativePath}: stale preview/runtime marker`);
  }

  for (const match of contents.matchAll(localReferencePattern)) {
    const reference = match[1] || match[2];
    const target = reference.slice(1);
    if (!fs.existsSync(path.join(root, target))) {
      failures.push(`${relativePath}: missing ${reference}`);
    }
  }
}

if (failures.length) {
  console.error("Site validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site validation passed: ${files.length} published files checked.`);
