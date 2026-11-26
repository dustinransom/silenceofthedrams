# Instructions for Claude: Silence of the Drams repo

This repo is the canonical archive of Dustin's reviews (Scotch whisky, plus the odd world whisky; the site no longer covers wine or dining).
Substack is a periodic roundup newsletter, not a per-review channel.

## When Dustin sends tasting notes
1. Pick the type and copy the matching `templates/<type>.md` into `_reviews/<type>/YYYY-MM-DD-slug.md`
   (date = publish date; slug = lowercase-hyphenated full name). Set `date:` to the same date and
   `permalink: /slug/`. Review URLs live at the site root, matching the old WordPress URLs.
2. Fill the front matter from his notes. **Never invent facts** (ABV, cask, price, age, score).
   Ask for anything missing; leave a field blank instead of guessing.
3. Turn his notes into the body sections, keeping his voice and wording. Tidy grammar, don't
   embellish. No tasting descriptors he didn't give.
4. Scores are out of 5 (half points OK). Capture his "Mental Image" line in `mental_image`.
   His usual whisky format: intro/context, facts, Nose, Palate, Finish, Score, Mental Image, narrative.
5. The review is published on the site only (commit + push). Nothing goes to Substack yet.

## When Dustin asks for a Substack roundup
1. Gather every review with an empty `substack_url` (i.e. not yet in a roundup). Skip the imported
   WordPress reviews (they have `wordpress_url`) unless Dustin asks for a "best of the archive" issue.
2. Draft one post: short intro, then each review condensed (name, score, mental image, a few lines
   in his words) linking to the full review on silenceofthedrams.com. Group by tasting/event
   when that's the natural unit.
3. Create it as a **Substack draft only**; Dustin publishes, since the subscriber email can't be unsent.
4. After he publishes, set `substack_url` on each included review to the roundup's URL.

## Quick reviews (the default for whisky; `templates/quick.md`)
Dustin usually sends these from his phone mid-tasting. Expect shorthand like:
```
Quick: Springbank 15
46%, ex-bourbon/sherry, official              (any facts he has)
N: ...  P: ...  F: ...                         (optional one-liners)
3.5 · "mental image"
take: one-to-three sentence verdict
at: occasion / where
```
1. Copy `templates/quick.md` to `_reviews/whisky/YYYY-MM-DD-slug.md`. Use today's date for `date`
   unless he gives one. Quick reviews have no price or tasted date. Keep `published: false`.
2. Fill in only what he sent and leave the rest blank. Don't look up ABV, cask etc. List what's
   still blank at the end of your reply so he knows what to fill in later.
3. Body = optional Nose / Palate / Finish one-liners (each on its own line), then his take
   (tidied, his words). Keep the `{: .npf}` line under N/P/F (it mutes them). Remove the placeholder text and drop any N/P/F line he didn't give. Keep it short.
4. Commit + push the draft. It's safe because `published: false` keeps it off the site.
   Don't add the whisky log row yet (the archive would link to a hidden page).
5. When he says "finish <name>": fill in the facts he gives, delete the `published` line, add/update
   the `_data/whisky_log.csv` row with `review` set to the slug, then commit + push.
   "What drafts do I have?" = list reviews with `published: false`.
Use the full `templates/whisky.md` only when he asks for a long-form review.

## Whisky log (`_data/whisky_log.csv`)
Every whisky Dustin has scored, one row each, imported from his Google Sheet "Whisky Review Archive".
It drives the archive page. Columns: order (sheet order, 1 = newest), name, distillery, bottler,
country, region, abv, cask, age, distilled, bottled, score (out of 5), scale (blank = 5; "10" for rows
not yet rescored), mental_image, year, occasion, whiskybase, review (permalink slug of a written review,
or blank), status ("open" = bottle open but not yet scored).
- When adding a written whisky review, also add/update its row in the log and set `review` to its slug.
- Score-only tastings just get a row (no review file). New rows go at the top (shift `order`).

## Rules
- One file per review; don't restructure the folders without asking.
- The 37 WordPress reviews were imported by `imports/wp_to_jekyll.py`. Reviews before Aug 2025 use
  the old 10-point scale (`score_scale: 10`). Don't convert those scores; Dustin will rescore them himself.
- The Macallan 18 vertical post holds five drams, so it uses `scores: [...]` instead of `score`.
