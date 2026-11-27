# Claudia Hodoroga · Portfolio

Plain HTML, CSS and JavaScript, plus one Vercel function for the form. No build step.

```
index.html              page structure and copy
styles.css              all styling
script.js               folder, tabs, sandbox, house rules, RSVP form, confetti, CV, menu
work/                   case study pages (gdg.html, lfc.html, audits.html) + case.css + case.js
api/submit.js           Vercel function: receives the form and saves it to Supabase
supabase/schema.sql     database table for the form
cv.pdf                  add your CV here (the CV and menu buttons download it)
assets/
  textures/<object>/    folder, sheet, card: real paper textures (see below)
  textures/objects/     paperclip.png (and later stamp.png)
  notes/                your pencil notes
  images/               processed photos, made by the image script. Don't edit by hand.
  video/sandbox/        sandbox clips
  raw/                  your original photos (git-ignored)
scripts/                process-images.mjs, bake-textures.mjs
```

## Where to change things

All in `script.js`, near the top of each block:

- **Projects** (the files in the folder): the `P` list. Title, one-paragraph brief, status chip, photo and alt text.
- **Sandbox**: the `sbx` list. Title, year, tools, and the clip file name.
- **House rules**: the `rules` list.
- **Stickers on the inside cover**: the `stickers` list. Put transparent PNGs in `assets/stickers/` and give each a position, width and rotation. `stamp: true` gives a perforated postage-stamp edge (use that for rectangular images).
- **Card one-liners**: the `cardLines` list. A new one shows each time someone comes back to the contact section.

## How the form works

The page sends each response to `/api/submit`. That function checks it (only the three allowed
answers, contact up to 200 characters, a hidden field to catch bots) and saves it to the
`form_responses` table. The Supabase keys only live in Vercel's environment variables,
never in the page.

## Case study pages

Each case study is a normal HTML page in `work/`. The dashed boxes are placeholders to replace with
your own writing, and `<div class="ph">` boxes are image slots: swap them for
`<img src="../assets/your-image.webp" alt="what it shows">`. Each phase has a status chip:
change `data-state` to `done`, `wip` or `soon` (and the label inside it) as the project moves along.
The red stamp at the top can be removed once a project is finished.

## Setup

1. **Supabase:** in the SQL Editor, run `supabase/schema.sql` once. It creates `form_responses`
   with `blockers` (text[]) and `contact` (text), and only allows inserts.
2. **Vercel:** if you connected Supabase through Vercel's Supabase integration, the variables are
   already there (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, …) and nothing needs adding. Otherwise add
   `SUPABASE_URL` and `SUPABASE_SECRET_KEY` under Project > Settings > Environment Variables.
   The function uses the secret key because it runs on Vercel's server, never in the browser.
3. **Redeploy** (Deployments > ⋯ > Redeploy). New environment variables only apply to new deployments.
4. Submit the form on the live site and check Table Editor > `form_responses`.

Framework preset on Vercel: **Other**, with no build command and no output directory.

## Testing locally

Opening `index.html` directly works for everything except the form, because `/api/submit`
only exists on Vercel. To test the form locally, install the Vercel CLI (`npm i -g vercel`),
run `vercel link` once, `vercel env pull` to get the variables, then `vercel dev`.

## If responses don't show up

In Vercel, open the project > **Logs**, submit the form and look at the `/api/submit` entry.

- **Response body**: when saving fails, the `/api/submit` response in the browser's Network tab shows `supabaseStatus`, Supabase's `detail` message and which key variable was used (`keyUsed`).
- **Missing Supabase environment variables**: the variables aren't set, or you haven't redeployed.
- **Supabase error 401**: the key is wrong or incomplete. (New `sb_publishable_` keys must only be sent in the `apikey` header; `api/submit.js` already does this.)
- **Supabase error 404 / "relation does not exist"**: the table isn't there. Run `supabase/schema.sql` in the SQL Editor.
- **Supabase error 400**: a column name or type doesn't match (`blockers` text[], `contact` text).
- **Supabase error 403 / "permission denied for table form_responses"**: the table is missing a grant. Run the two `grant` lines from `supabase/schema.sql`.
- **Supabase error 403 / row-level security**: the insert policy is missing. Run `schema.sql` again.

## Images

1. Put originals in `assets/raw/<group>/` (groups: profile, gdg, lfc, audits, sandbox).
2. `npm install` once, then `npm run images` (or `npm run images -- lfc` for one group).
3. Outputs land in `assets/images/<group>/<name>-800.webp` and `-1600.webp`. Open `assets/images/_contact.html` to compare the set.
4. Ratios, crop focus and grade live in `images.config.json` and at the top of `scripts/process-images.mjs`.
   `kind`: `photo` (graded), `screen` (untouched), `mono` (greyscale). `position`: `attention`, `top`, or `[x%, y%]`.

## Textures

The textures in `assets/textures/` are generated stand-ins. To use real ones:

1. Download seamless, tileable textures (ambientCG and Poly Haven are free, CC0), ideally 2048px or more, without baked shadows.
2. Put them in the object's folder and rename them `<object>_<map>.jpg`. Objects: `folder`, `sheet`, `card`. Maps:
   - `color` (ambientCG `_Color`, Poly Haven `diff`)
   - `normal` (ambientCG `_NormalGL`, Poly Haven `nor_gl`). Always the GL version, not DX.
   - `height` (ambientCG `_Displacement`, Poly Haven `disp`)

   Any of the three is optional.
3. Run `npm run textures` (or `npm run textures -- folder`). It writes `<object>_lit.jpg` (the relief, lit from the
   page's top-centre light) and `<object>_tone.jpg` (fibres and specks). The page tints both with each object's colour,
   so the texture's own colour doesn't matter.
4. Relief strength per object is at the top of `scripts/bake-textures.mjs` (`STRENGTH`).

**Paperclip:** replace `assets/textures/objects/paperclip.png` with a real photo, cut out on a transparent background,
upright, lit from above. Same name, and it drops in.

## Sandbox clips

MP4 (H.264), 720 to 1080px wide, 6 to 12 seconds, no audio, ideally under 3MB. Save as
`assets/video/sandbox/<name>.mp4` with a poster frame `<name>.jpg`, then put `<name>` as the fourth item of that
entry in the `sbx` list. Clips play when scrolled into view and pause when they leave.
