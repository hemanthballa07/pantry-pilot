#!/usr/bin/env bash
# Vendor the self-hosted web fonts under public/fonts/ (OQ-014).
#
# Regenerates the 17 woff2 files + fonts.css that make the app (and the visual-
# regression suite) hermetic — no runtime dependency on the Google Fonts CDN.
# The gstatic woff2 URLs are content-addressed immutable assets, so re-running
# this yields byte-identical files UNLESS Google bumps a font version (the
# version path, e.g. /s/geist/v5/, changes). After regenerating, ALWAYS run
# `npm run vrt:docker` — the committed baselines are the proof that the fonts
# render identically; a diff means the vendored bytes changed (version drift)
# and the baselines must be regenerated deliberately (a design-fidelity call).
#
# Usage: bash scripts/fetch-fonts.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# The exact Google Fonts request the app used (was the index.html <link> href).
URL='https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap'
# A Chrome-class UA makes the API return woff2 (not ttf) with unicode-range subsets.
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

mkdir -p public/fonts
css="$(curl -fsSL -A "$UA" "$URL")"

# Download every referenced woff2 by its (unique) gstatic basename.
echo "$css" | grep -oE 'https://fonts\.gstatic\.com/[^) ]+\.woff2' | sort -u | while read -r u; do
  curl -fsSL -A "$UA" "$u" -o "public/fonts/$(basename "$u")"
done

# Emit fonts.css with the @font-face blocks verbatim, only the src URLs rewritten
# from the Google CDN to local /fonts/<file>.woff2.
{
  echo "/* Self-hosted web fonts (OQ-014) — Newsreader, Geist, Geist Mono."
  echo "   Generated from the Google Fonts CSS API by scripts/fetch-fonts.sh; the"
  echo "   font-face blocks are verbatim (unicode-range, weight ranges, font-display"
  echo "   swap preserved) with only the src URLs rewritten to local self-hosted"
  echo "   files under fonts/. Fonts are SIL Open Font License 1.1 — see OFL.txt. */"
  echo "$css" | sed -E 's#url\(https://fonts\.gstatic\.com/s/[^)]*/([^/)]*\.woff2)\)#url(/fonts/\1)#g'
} > public/fonts/fonts.css

echo "Vendored $(ls public/fonts/*.woff2 | wc -l | tr -d ' ') woff2 + fonts.css. Now run: npm run vrt:docker"
