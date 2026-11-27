// Turns downloaded texture maps into the two layers the site uses, lit from the top centre.
// Usage: npm run textures            (all objects)
//        npm run textures -- folder  (one object)
//
// Put downloads in assets/textures/<object>/ named:
//   <object>_color.jpg   colour/albedo map   (optional)
//   <object>_normal.jpg  normal map, GL      (optional, preferred for relief)
//   <object>_height.jpg  height/displacement (optional, used if there's no normal map)
// Stamp ink (optional): assets/textures/objects/stamp_source.jpg, black ink on white.
// It writes, next to them:
//   <object>_lit.jpg     the surface relief, lit from the page's light (grey, 128 = flat)
//   <object>_tone.jpg    fibres and specks from the colour map, with colour and lighting removed
// The page tints both with the object's own colour, so the source colour doesn't matter.

import sharp from "sharp";
import { access, readdir } from "node:fs/promises";
import { join } from "node:path";

const DIR = join(process.cwd(), "assets/textures");
const SIZE = 1024; // tile size; shown at 512 css px so it stays sharp on retina
const LIGHT = norm([0, -0.42, 0.91]); // top centre, slightly in front, same as the CSS shadows
const STRENGTH = { folder: 1.0, sheet: 0.7, card: 1.2 }; // relief strength per object
const only = process.argv[2] || "";

function norm(v) {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
}
const exists = (p) => access(p).then(() => true, () => false);

async function grey(path) {
  const { data } = await sharp(path).resize(SIZE, SIZE, { fit: "cover" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  return Float32Array.from(data, (v) => v / 255);
}

async function litFromNormal(path) {
  const { data } = await sharp(path).resize(SIZE, SIZE, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    // GL normal map: +Y points up, so flip it for screen space (y grows downwards)
    const n = norm([data[i * 3] / 127.5 - 1, -(data[i * 3 + 1] / 127.5 - 1), data[i * 3 + 2] / 127.5 - 1]);
    out[i] = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
  }
  return out;
}

async function litFromHeight(path) {
  const h = await grey(path);
  const out = new Float32Array(SIZE * SIZE);
  const at = (x, y) => h[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 4, dy = (at(x, y + 1) - at(x, y - 1)) * 4;
      const n = norm([-dx, -dy, 1]);
      out[y * SIZE + x] = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
    }
  return out;
}

// Centre on 128 and scale so the relief has a consistent strength whatever the source
function toGrey(values, spread) {
  let mean = 0, sd = 0;
  for (const v of values) mean += v;
  mean /= values.length;
  for (const v of values) sd += (v - mean) ** 2;
  sd = Math.sqrt(sd / values.length) || 1;
  return Buffer.from(values.map((v) => Math.max(0, Math.min(255, 128 + ((v - mean) / sd) * spread))));
}

async function save(buf, path) {
  await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 1 } }).jpeg({ quality: 86 }).toFile(path);
  console.log("  wrote", path.replace(process.cwd() + "/", ""));
}

// Stamp ink: assets/textures/objects/stamp_source.(jpg|png), black = ink, white = gaps.
// Becomes stamp.png, which the stamps use as a mask so the ink looks uneven.
for (const ext of ["png", "jpg"]) {
  const src = join(DIR, "objects", `stamp_source.${ext}`);
  if (only && only !== "stamp") break;
  if (!(await exists(src))) continue;
  const g = await grey(src);
  const alpha = Buffer.from(g.map((v) => Math.round((1 - v) * 255)));
  const white = Buffer.alloc(SIZE * SIZE * 3, 255);
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) { rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = white[i]; rgba[i * 4 + 3] = alpha[i]; }
  await sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } }).png().toFile(join(DIR, "objects", "stamp.png"));
  console.log("stamp\n  wrote assets/textures/objects/stamp.png");
  break;
}

for (const obj of await readdir(DIR)) {
  if (obj === "objects" || (only && obj !== only)) continue;
  const p = (m) => join(DIR, obj, `${obj}_${m}.jpg`);
  console.log(obj);
  const k = STRENGTH[obj] ?? 1;

  let lit = null;
  if (await exists(p("normal"))) lit = await litFromNormal(p("normal"));
  else if (await exists(p("height"))) lit = await litFromHeight(p("height"));
  if (lit) await save(toGrey(lit, 16 * k), p("lit"));
  else console.log("  no normal or height map, keeping the current", `${obj}_lit.jpg`);

  if (await exists(p("color"))) {
    // high-pass: keep fibres and specks, drop the photo's own lighting and colour
    const g = await grey(p("color"));
    const blur = await sharp(Buffer.from(g.map((v) => v * 255)), { raw: { width: SIZE, height: SIZE, channels: 1 } }).blur(24).raw().toBuffer();
    const hp = g.map((v, i) => v - blur[i] / 255);
    await save(toGrey(hp, 14 * k), p("tone"));
  } else console.log("  no colour map, keeping the current", `${obj}_tone.jpg`);
}
console.log("\nDone. Reload the page to see the new textures.");
