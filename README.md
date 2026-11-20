# Platinum Roadmap v2: all 55 GTA VI trophies — dashboard, difficulty + time, missable warnings, phased roadmap

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/minhvo7332/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/minhvo7332/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app: a guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI.

## What's new in v2

- **Progress dashboard** (top of the page): percent complete, trophies by grade with bars, hours of trophy work left, and the next 5 easiest unearned trophies.
- **Difficulty + time per trophy**: every trophy carries a difficulty rating (1–5 stars) and a time estimate, built from PowerPyx's platinum totals (4/10, ≈ 200 h: story 60–80 h, 100% checklist ≈ 100 h, cleanup ≈ 10 h).
- **Fastest-to-platinum route**: sort the checklist by the quickest route — Phase 1 Story → Phase 2 Open world → Phase 3 Cleanup, easiest first within each phase, with a Route # on every card.
- **Missable check on every trophy**: each open guide has a detail panel saying exactly when the trophy can be missed and how to avoid it (only 1 is possibly missable: Positive Mental Attitude, the Chapter 1 meditation spot at Jason's house).
- **Phased roadmap**: the 5-stage roadmap is now 3 phases (Story 20 trophies · Open world 29 · Cleanup 6), each card listing its trophies — click a phase to filter the checklist to it.

## v1 features, kept

- Every trophy with its official name, description and grade, plus a guide written in our own words with its source cited.
- Checklist saved in the browser (localStorage), with export to a file and import back.
- Filters by kind (story, missable, collectibles, activities, completion, online), by phase, by grade, by search, and unearned-only.
- Spoiler-safe setting: story trophies stay hidden until earned.
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

Competition: `gta6-trophy-guide-01` on make.fun. Title: "Platinum Roadmap v2: all 55 GTA VI trophies — dashboard, difficulty + time, missable warnings, phased roadmap".

---

<sub>Entered on [make.fun](https://make.fun/?ref=ice777&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
