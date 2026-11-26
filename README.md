# Silence of the Drams

Landing page + permanent archive for every review, served free by GitHub Pages at
**silenceofthedrams.com**. New reviews are also published to Substack (the newsletter),
but this repo is the source of truth. Substack is used for occasional roundup emails
("this month's drams", a full tasting event), not every review. RSS feed: `/feed.xml`.

## How it's organized

| Path | What's in it |
|---|---|
| `_reviews/whisky/`, `_reviews/wine/`, `_reviews/dining/` | One markdown file per review. **This is the archive.** |
| `_data/whisky_log.csv` | Every whisky scored (from the Google Sheet), plus open bottles. Drives the archive page. |
| `stats.html`, `assets/js/stats.js` | Stats page; charts are drawn in the browser from the whisky log, so they update whenever the log does. Clean-up rules (Bruichladdich brands, regions, cask buckets) live at the top of `stats.js`. |
| `_data/scotch_distilleries.csv` | Scottish distillery list for the stats page tracker (working, ghost, revived; `aliases` maps brand names like Arran → Lochranza). |
| `templates/` | Blank templates for each review type (not published). |
| `imports/` | Drop the WordPress export here for conversion (not published). |
| `index.html` | Landing page (latest 6 reviews). |
| `reviews/index.html` | Full archive with search, type filter, and sort. |
| `_layouts/`, `_includes/`, `assets/` | Site look and feel. |
| `_config.yml` | Site settings: Substack URL, score scale. |

File names: `YYYY-MM-DD-short-name.md`, e.g. `2026-11-22-springbank-15.md`; the date is the publish
date. Each review sets `permalink: /short-name/`, so URLs match the old WordPress site.

## WordPress import (done Nov 2026)

- 37 published reviews converted by `imports/wp_to_jekyll.py` → `_reviews/whisky/`. About page → `about.md`.
- WordPress images were intentionally not carried over.
- All review scores were moved to the 5-point scale in Nov 2026 from the Google Sheet.
- `_to_delete/` holds files to discard; delete the folder.

## Adding a review

1. Send rough tasting notes to Claude (in the Silence of the Drams project).
2. Claude fills the template and writes the file into `_reviews/<type>/`.
3. Commit + push → site updates in about a minute.

## Sending a roundup

Ask Claude for a roundup. It collects every review not yet sent (empty `substack_url`), drafts one
Substack post linking back to the full reviews, and after you publish, stamps each review with the
roundup's URL.

Templates can also be filled by hand (or in Obsidian; open this folder as a vault).

## Hosting (all free)

GitHub Pages builds this site automatically with Jekyll; nothing to install or pay for.
- Repo → Settings → Pages → "Deploy from a branch" → `main` / root.
- Custom domain: add `silenceofthedrams.com` under Settings → Pages **only when you're
  ready to cut over from WordPress**, then update DNS at your registrar.

Optional local preview (needs Ruby): `bundle install && bundle exec jekyll serve`.
