import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const pages = [
  ["en", path.join(dist, "index.html")],
  ["ru", path.join(dist, "ru/index.html")],
  ["ka", path.join(dist, "ka/index.html")]
];
const failures = [];

for (const [lang, file] of pages) {
  const html = await readFile(file, "utf8");
  if (!html.includes(`<html lang="${lang}">`)) failures.push(`${lang}: incorrect html lang`);
  if ((html.match(/<h1\b/g) || []).length !== 1) failures.push(`${lang}: expected one H1`);
  if ((html.match(/<h2\b/g) || []).length < 4) failures.push(`${lang}: core sections are missing`);
  for (const sectionId of ["what-we-do", "georgia", "services", "process", "contact"]) {
    if (!html.includes(`id="${sectionId}"`)) failures.push(`${lang}: missing #${sectionId} section`);
  }
  if (!html.includes('rel="canonical"')) failures.push(`${lang}: canonical is missing`);
  if ((html.match(/hreflang=/g) || []).length < 7) failures.push(`${lang}: hreflang links are incomplete`);
  if (!html.includes('data-lead-form')) failures.push(`${lang}: lead form is missing`);
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|favicon\.svg))/g)) {
    try { await access(path.join(dist, match[1])); } catch { failures.push(`${lang}: missing ${match[1]}`); }
  }
  for (const forbidden of ["corp-merch.eu", "merch.mt", "google-analytics.com", "gtag("]) {
    if (html.includes(forbidden)) failures.push(`${lang}: forbidden legacy value ${forbidden}`);
  }
}

const imageDir = path.join(dist, "assets/images");
const images = (await readdir(imageDir)).filter((file) => file.endsWith(".webp"));
if (images.length < 20) failures.push("Responsive image variants are missing");
for (const image of images) {
  const size = (await stat(path.join(imageDir, image))).size;
  if (size > 650_000) failures.push(`${image} is too large (${size} bytes)`);
}

if (failures.length) {
  console.error(failures.map((item) => `• ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Checks passed: 3 locales, responsive assets, metadata, form and legacy-domain safeguards.`);
