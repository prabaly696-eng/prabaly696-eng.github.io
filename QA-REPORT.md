# Measure Twice: QA report (November 19, 2026)

Checked on a fresh extract of this package. Everything below was actually run.

## Problem found in the earlier "QA reviewed" ZIP
- `style.css`, `favicon.svg` and `sitemap.xml` were missing. All 15 pages link to the first two, so pages would show unstyled.
- Canonical, Open Graph and structured-data tags, and the Sitemap line in `robots.txt`, were also gone.
- Its report said "no missing local targets", which was wrong (a link check shows both files missing from 15 pages).
- Fix: restored the original files from the source build. No page was redesigned.

## Results
| Check | Result |
|---|---|
| Files present, 15 HTML pages, 312 local links/assets, 0 missing | Pass |
| `qa-tests.js` (12 checks) | Pass, 12/12 |
| Formula tests (76) | Pass |
| Extra metric and new-calculator tests (10) | Pass |
| Served under `/measure-twice/` (simulated), 340 checks: pages, CSS, JS, console, links, metric switch, deep 404 | Pass |
| Browser tests, 272 checks (console errors, titles, descriptions, links, no sideways scroll at 320 and 360 px, calculator behavior) | 271 pass, 1 fail |

The one failure: the 404 page loads its CSS from the real GitHub address, which is not live yet. Expected before deployment.

## Not tested / remaining
- Real Android phone, Safari, Firefox, screen readers.
- The live GitHub Pages site (not deployed, so not checked).
- Contact email is set to measuretwice.help@gmail.com (mailbox not tested by me).
- Repository name must be exactly `measure-twice` (lowercase). Addresses in the files use that.
- Search Console tag and AdSense script are intentionally empty. AdSense needs an eligible parent or guardian, and approval is not guaranteed.
