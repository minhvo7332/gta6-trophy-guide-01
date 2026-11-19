# Platinum Roadmap v1: all 55 GTA VI trophies — checklist, missable flags, spoiler-safe guides

An offline web app: a guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI.

- Every trophy with its official name, description and grade, plus a guide written in our own words with its source cited.
- Checklist saved in the browser (localStorage), with export to a file and import back.
- Filters by kind (story, missable, collectibles, activities, completion, online), by grade, by search, and unearned-only.
- Spoiler-safe setting: story trophies stay hidden until earned.
- A 5-stage roadmap to the platinum, and a missable-trophy panel (1 possibly missable: Positive Mental Attitude).
- Fully static under `app/` — no build step, no network at run time.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Competition: `gta6-trophy-guide-01` on make.fun. Title: "Platinum Roadmap v1: all 55 GTA VI trophies — checklist, missable flags, spoiler-safe guides".
