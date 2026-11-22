#!/usr/bin/env python3
"""Convert a WordPress WXR export into Jekyll review files for Silence of the Drams.

Usage: python3 imports/wp_to_jekyll.py imports/<export>.xml
Run from the repo root. Writes _reviews/whisky/*.md, about.md and
imports/download-images.sh. Only facts explicitly labeled in a post are
filled in; everything else is left blank.
"""
import html
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

NS = {
    "wp": "http://wordpress.org/export/1.2/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}
SITE = "https://silenceofthedrams.com"
UPLOADS = SITE + "/wp-content/uploads/"
# Posts before this date used the old 10-point scale (see About page).
TEN_POINT_BEFORE = "2025-08-01"
REGION_TAGS = {"islay": "Islay", "speyside": "Speyside", "highland": "Highland",
               "lowland": "Lowland", "island": "Islands", "islands": "Islands",
               "campbeltown": "Campbeltown"}
COUNTRY_TAGS = {"india": "India", "denmark": "Denmark", "sweden": "Sweden",
                "australia": "Australia"}


def plain_lines(h):
    t = re.sub(r"<!--.*?-->", "", h, flags=re.S)
    t = re.sub(r"<br\s*/?>|</p>|</li>|</h\d>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", "", t)).replace("\xa0", " ")
    return [l.strip() for l in t.split("\n") if l.strip()]


def label(lines, name):
    for l in lines:
        m = re.match(rf"{name}\s*:\s*(.+)$", l, re.I)
        if m:
            return m.group(1).strip()
    return ""


def to_markdown(h):
    h = re.sub(r"<!--.*?-->", "", h, flags=re.S)
    h = h.replace(UPLOADS, "/assets/images/wp/")
    h = re.sub(r"https?://(www\.)?silenceofthedrams\.com/(?!assets)", "/", h)
    out = subprocess.run(["pandoc", "-f", "html", "-t", "gfm-raw_html", "--wrap=none"],
                         input=h, capture_output=True, text=True, check=True).stdout
    return re.sub(r"\n{3,}", "\n\n", out).strip() + "\n"


def yq(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'


def num(s):
    m = re.search(r"\d+(\.\d+)?", s or "")
    return m.group(0) if m else ""


def main(path):
    root = ET.parse(path).getroot()
    images, written = set(), []
    os.makedirs("_reviews/whisky", exist_ok=True)
    for it in root.iter("item"):
        ptype = it.findtext("wp:post_type", namespaces=NS)
        status = it.findtext("wp:status", namespaces=NS)
        body_html = it.findtext("content:encoded", namespaces=NS) or ""
        # Jetpack CDN links (i0.wp.com/...?fit=..) -> the original upload URL
        body_html = re.sub(r'https://i\d\.wp\.com/(silenceofthedrams\.com/wp-content/uploads/[^"?\s]+)\?[^"\s]*',
                           r'https://\1', body_html)
        title = html.unescape(it.findtext("title") or "").strip()
        slug = it.findtext("wp:post_name", namespaces=NS)
        images.update(re.findall(re.escape(UPLOADS) + r'[^"\s)\]]+', body_html))

        if ptype == "page" and title.rstrip(".").lower() == "about":
            with open("about.md", "w") as f:
                f.write(f"---\nlayout: default\ntitle: About\npermalink: /about/\n---\n\n"
                        f"# About\n\n{to_markdown(body_html)}")
            continue
        if ptype != "post" or status != "publish":
            continue

        date = it.findtext("wp:post_date", namespaces=NS)[:10]
        lines = plain_lines(body_html)
        tags = [c.text for c in it.findall("category") if c.get("domain") == "post_tag"]
        cats = [c.text for c in it.findall("category") if c.get("domain") == "category"]
        tags_clean = sorted({t.lower() for t in tags if not t.lower().startswith("score")})

        country = region = ""
        cr = label(lines, "Country/Region")
        if cr:
            parts = [p.strip() for p in cr.split("/", 1)]
            country = parts[0]
            region = parts[1] if len(parts) > 1 else ""
        if not region:
            region = next((REGION_TAGS[t] for t in tags_clean if t in REGION_TAGS), "")
        if not country:
            country = next((COUNTRY_TAGS[t] for t in tags_clean if t in COUNTRY_TAGS), "")
        if not country and ("Scotch" in cats or "scotch" in tags_clean or region in REGION_TAGS.values()):
            country = "Scotland"

        abv = num(label(lines, "ABV"))
        if not abv:
            m = re.search(r"(\d+(?:\.\d+)?)\s*%\s*abv", " ".join(lines), re.I)
            abv = m.group(1) if m else ""
        if not abv:  # a line that is only a percentage, e.g. "46.2%"
            abv = next((l[:-1].strip() for l in lines[:8] if re.fullmatch(r"\d+(\.\d+)?\s*%", l)), "")

        scores = []
        for l in lines:
            m = re.match(r"(?:Score|Rating)\s*:\s*([\d.]+)", l, re.I)
            if m:
                scores.append(m.group(1).rstrip("."))
        scale = 10 if date < TEN_POINT_BEFORE else 5

        fm = [
            "---",
            f"title: {yq(title)}",
            "type: whisky",
            f"date: {date}",
            f"permalink: /{slug}/",
            "distillery: \"\"",
            f"bottler: {yq(label(lines, 'Bottler'))}",
            f"region: {yq(region)}",
            f"country: {yq(country)}",
            f"age: {yq(label(lines, 'Age'))}",
            f"abv: {abv}",
            f"cask: {yq(label(lines, 'Cask'))}",
            "price: \"\"",
        ]
        if len(scores) == 1:
            fm.append(f"score: {scores[0]}")
        else:
            fm.append("score:")
            if scores:
                fm.append(f"scores: [{', '.join(scores)}]   # multiple drams in one post")
        fm += [
            f"score_scale: {scale}",
            f"mental_image: {yq(label(lines, 'Mental Image'))}",
            "date_tasted:",
            f"wordpress_url: {SITE}/{slug}/",
            "substack_url: \"\"",
            f"tags: [{', '.join(yq(t) for t in tags_clean)}]",
            "---",
            "",
        ]
        fname = f"_reviews/whisky/{date}-{slug}.md"
        with open(fname, "w") as f:
            f.write("\n".join(fm) + to_markdown(body_html))
        written.append((fname, title, scores, scale))

    with open("imports/download-images.sh", "w") as f:
        f.write("#!/bin/bash\n# Run from the repo root on your Mac, BEFORE shutting down WordPress:\n"
                "#   bash imports/download-images.sh\nset -e\n")
        for url in sorted(images):
            rel = url[len(UPLOADS):]
            f.write(f'mkdir -p "assets/images/wp/{os.path.dirname(rel)}" && '
                    f'curl -fsSL "{url}" -o "assets/images/wp/{rel}"\n')
        f.write('echo "Downloaded $(find assets/images/wp -type f | wc -l) images."\n')

    for fname, title, scores, scale in written:
        print(f"{'/'.join(scores) or '-':>12} /{scale:<3} {fname}")
    print(f"{len(written)} reviews, {len(images)} image URLs")


if __name__ == "__main__":
    main(sys.argv[1])
