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
const anyRootReferencePattern = /url\(["']?(\/[^"')?#]+)|(?:href|src)=["'](\/[^"'?#]+)["']/g;
const legacyAssetPattern =
  /(?:index-BDu4K_NV|mobile-experience|experience-suite|hero-(?:cabinet|book-open|conversion|book-focus|compact-faith)|polish-conversion|premium-refinement|living-bookshelf|_vinext_fonts|data-rsc-css-href|vite-rsc)/;

for (const relativePath of files) {
  if (!textExtensions.has(path.extname(relativePath))) continue;
  const contents = fs.readFileSync(path.join(root, relativePath), "utf8");

  if (contents.includes("REPLACE_ASIN")) {
    failures.push(`${relativePath}: unresolved Amazon placeholder`);
  }
  if (/__VINEXT_RSC_|codex-preview/.test(contents)) {
    failures.push(`${relativePath}: stale preview/runtime marker`);
  }
  if (legacyAssetPattern.test(contents)) {
    failures.push(`${relativePath}: legacy homepage layer or runtime marker`);
  }

  if (path.extname(relativePath) === ".html") {
    const ids = [...contents.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    for (const id of new Set(duplicates)) {
      failures.push(`${relativePath}: duplicate id "${id}"`);
    }
  }

  for (const match of contents.matchAll(localReferencePattern)) {
    const reference = match[1] || match[2];
    const target = reference.slice(1);
    if (!fs.existsSync(path.join(root, target))) {
      failures.push(`${relativePath}: missing ${reference}`);
    }
  }

  for (const match of contents.matchAll(anyRootReferencePattern)) {
    const reference = match[1] || match[2];
    if (!reference || reference === "/" || reference.startsWith("//")) continue;
    const target = reference.slice(1);
    if (!fs.existsSync(path.join(root, target))) {
      failures.push(`${relativePath}: missing root reference ${reference}`);
    }
  }
}

if (failures.length) {
  console.error("Site validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site validation passed: ${files.length} published files checked.`);
