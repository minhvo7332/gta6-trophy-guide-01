// GTA VI trophy guide entry v2 (Node 22, standard library only).
// This program hands the guide in: it copies this repo's app/ and
// screenshots/ into /output and writes /output/dossier.json with the
// vendored make.fun library, exactly as the scorer rebuilds it.
// The guide itself is plain static files under app/ (index.html, style.css,
// app.js, data/trophies.json) — no build step, no network at run time.
// vendor/makefun-frontend.ts is the kit's copy, unchanged.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, before copying anything, when the guide is incomplete: the
// scorer would refuse the entry, so say so here instead of handing in a
// half-built /output.
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');
if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html is missing');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) throw new Error('app/data/trophies.json is missing');
const trophyCount = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8')).trophies.length;
if (trophyCount !== 55) throw new Error(`expected 55 trophies, found ${trophyCount}`);
const shots = readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length < 3 || shots.length > 4) throw new Error(`expected 3-4 screenshots, found ${shots.length}`);

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// Same caps the scorer enforces: at most 4 screenshots, each at most
// 256 KiB; app/ at most 993 files and 48 MiB; dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`gta6-trophy-guide-01 v2: ${trophyCount} trophies, ${shots.length} screenshots (${shots.join(', ')}) -> ${out}`);
