// GTA VI trophy guide entry (Node 22, standard library only).
// This program hands the guide in: it copies this repo's app/ and
// screenshots/ into /output and writes /output/dossier.json with the
// vendored make.fun library, exactly as the scorer rebuilds it.
// The guide itself is plain static files under app/ (index.html, style.css,
// app.js, data/trophies.json) — no build step, no network at run time.
// vendor/makefun-frontend.ts is the kit's copy, unchanged.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Same caps the scorer enforces: at most 4 screenshots, each at most
// 256 KiB; app/ at most 993 files and 48 MiB; dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
