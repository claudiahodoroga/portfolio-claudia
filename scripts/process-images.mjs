// Batch-crops, grades and exports every image in assets/raw/ to assets/images/.
// Usage: npm run images            (process everything)
//        npm run images -- lfc     (only files whose path contains "lfc")
//
// Folder layout:  assets/raw/<group>/<file>.jpg  ->  assets/images/<group>/<file>-800.webp + -1600.webp
// Defaults per group and per-file overrides live in images.config.json.

import sharp from "sharp";
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { join, relative, dirname, extname, basename } from "node:path";

const ROOT = process.cwd();
const RAW = join(ROOT, "assets/raw");
const OUT = join(ROOT, "assets/images");
const only = process.argv[2] || "";

const config = JSON.parse(await readFile(join(ROOT, "images.config.json"), "utf8"));

// The house grade. Change these numbers once and every photo follows.
const GRADE = {
  saturation: 0.88, // 1 = untouched
  brightness: 1.0,
  contrast: 0.94, // < 1 lifts blacks and softens whites (matte)
  lift: 10, // added to every channel after contrast (0-255)
  warm: [1.03, 1.0, 0.95], // R, G, B multipliers: pushes highlights towards paper
};

const ratio = (r) => {
  const [w, h] = r.split(":").map(Number);
  return w / h;
};

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png|webp|tiff?|heic)$/i.test(name)) out.push(p);
  }
  return out;
}

function settingsFor(rel) {
  const group = rel.split("/")[0];
  const file = basename(rel);
  return {
    kind: "photo",
    ratio: "3:2",
    position: "attention",
    widths: [800, 1600],
    ...(config.groups?.[group] || {}),
    ...(config.files?.[file] || {}),
  };
}

const files = (await walk(RAW)).filter((f) => f.includes(only));
const results = [];

for (const file of files) {
  const rel = relative(RAW, file).replaceAll("\\", "/");
  const s = settingsFor(rel);
  const outDir = join(OUT, dirname(rel));
  await mkdir(outDir, { recursive: true });
  const stem = basename(rel, extname(rel));

  for (const w of s.widths) {
    const h = Math.round(w / ratio(s.ratio));
    // position: "attention" (sharp finds the subject), "centre", "top", or [x%, y%] focal point
    let img = sharp(file).rotate();
    if (Array.isArray(s.position)) {
      const meta = await sharp(file).rotate().metadata();
      const [W, H] = meta.orientation >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
      const scale = Math.max(w / W, h / H);
      const rw = Math.round(W * scale), rh = Math.round(H * scale);
      const left = Math.min(Math.max(Math.round((s.position[0] / 100) * rw - w / 2), 0), rw - w);
      const top = Math.min(Math.max(Math.round((s.position[1] / 100) * rh - h / 2), 0), rh - h);
      img = img.resize(rw, rh).extract({ left, top, width: w, height: h });
    } else {
      img = img.resize(w, h, { fit: "cover", position: s.position });
    }

    if (s.kind === "photo") {
      img = img
        .modulate({ saturation: GRADE.saturation, brightness: GRADE.brightness })
        .linear(GRADE.contrast, GRADE.lift)
        .recomb([
          [GRADE.warm[0], 0, 0],
          [0, GRADE.warm[1], 0],
          [0, 0, GRADE.warm[2]],
        ]);
    }
    if (s.kind === "mono") img = img.grayscale().linear(GRADE.contrast, GRADE.lift);
    // "screen": no grade, screenshots keep their true colours

    const out = join(outDir, `${stem}-${w}.webp`);
    await img.webp({ quality: 78 }).toFile(out);
    results.push({ rel: relative(OUT, out).replaceAll("\\", "/"), group: rel.split("/")[0], w, ratio: s.ratio, kind: s.kind });
  }
  console.log(`✓ ${rel}  (${s.kind}, ${s.ratio})`);
}

// Contact sheet: open images/_contact.html to judge the set side by side
const big = results.filter((r) => r.w === Math.max(...results.map((x) => x.w)) || r.w === 1600);
const html = `<!doctype html><meta charset="utf-8"><title>Contact sheet</title>
<style>body{margin:0;padding:32px;background:#f7f7f7;font:12px "IBM Plex Mono",monospace;color:#111}
h2{font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin:32px 0 12px}
.g{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end}
figure{margin:0}img{height:260px;display:block;box-shadow:0 1px 2px rgba(0,0,0,.18),0 8px 24px rgba(0,0,0,.08)}
figcaption{margin-top:6px;opacity:.6}</style>
${[...new Set(big.map((r) => r.group))]
  .map((g) => `<h2>${g}</h2><div class="g">${big.filter((r) => r.group === g)
    .map((r) => `<figure><img src="${r.rel}"><figcaption>${basename(r.rel)} · ${r.ratio} · ${r.kind}</figcaption></figure>`)
    .join("")}</div>`).join("")}`;
await writeFile(join(OUT, "_contact.html"), html);
console.log(`\n${files.length} images → assets/images/  ·  open assets/images/_contact.html to compare`);
