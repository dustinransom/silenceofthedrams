# Instructions for Claude: Silence of the Drams repo

This repo is the canonical archive of Dustin's reviews (whisky, mostly scotch; wine; dining).
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
   in his words) linking to the full review on silenceofthedrams.com. Group by type
   (whisky / wine / dining) or by tasting/event when that's the natural unit.
3. Create it as a **Substack draft only**; Dustin publishes, since the subscriber email can't be unsent.
4. After he publishes, set `substack_url` on each included review to the roundup's URL.

## Rules
- One file per review; don't restructure the folders without asking.
- The 37 WordPress reviews were imported by `imports/wp_to_jekyll.py`. Reviews before Aug 2025 use
  the old 10-point scale (`score_scale: 10`). Don't convert those scores; Dustin will rescore them himself.
- The Macallan 18 vertical post holds five drams, so it uses `scores: [...]` instead of `score`.
