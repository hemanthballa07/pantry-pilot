#!/usr/bin/env bash
# Run the visual-regression suite inside the pinned Playwright image, forced to
# linux/amd64 so screenshots match the amd64 CI runner (host is arm64). An
# anonymous volume masks node_modules so the host's darwin install is untouched;
# npm ci populates Linux modules inside the container. Forwards args, e.g.:
#   npm run vrt:docker -- --update-snapshots   # (re)generate baselines
#   npm run vrt:docker                         # compare against baselines
set -euo pipefail
IMAGE="mcr.microsoft.com/playwright:v1.60.0-jammy" # keep == @playwright/test version
exec docker run --rm --platform linux/amd64 \
  -v "$PWD":/work -v /work/node_modules -w /work \
  "$IMAGE" \
  bash -lc 'npm ci && npx playwright install chromium && npx playwright test --config playwright.vrt.config.ts "$@"' _ "$@"
