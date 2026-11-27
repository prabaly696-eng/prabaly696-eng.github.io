# Test report: Measure Twice Calculators

Date: October 31, 2026 (updated for 9 calculators and GitHub Pages)

## What was run, and what was not

- **Formula tests (Node.js):** 76 tests. Every calculator was run with sample inputs, zero, negative, blank and invalid inputs, unit conversions, rounding edge cases and floating point edge cases. Expected values were worked out by hand and written into the test before comparing. Result: all passed (table below).
- **Extra formula tests:** 10 more checks for the metric gravel result and the concrete, paint and tile defaults. All passed.
- **Subdirectory test:** the site was served under `/measure-twice/` (simulated with request routing, not the real GitHub), 340 checks: every page loads, CSS and scripts load, no console errors, every local link points to an existing file, the metric switch works, and the 404 page keeps its styling on a deep address. All passed.
- **Browser tests (headless Chromium via Playwright):** 272 checks across all 15 pages. 271 passed. The one failure is the 404 page, which loads its CSS from the real GitHub address that is not live yet. That is expected until you deploy; the subdirectory test above covers it. The checks were:
  - no console or JavaScript errors on any page
  - exactly one H1, a title under 65 characters, a description of 50 to 160 characters, and a canonical link on every page
  - every title and description is unique
  - every link, script and stylesheet points to a file that exists, and in-page anchors point to real ids
  - no sideways scrolling at 320 px and 360 px wide
  - each calculator: starting state, default result, error shown for letters, error for a negative number, zero handling, Reset restores the starting values and clears the result and errors
  - the Copy result button gives feedback, and the roof pitch drawing appears
  - pressing Enter calculates, switching feet and inches works, the fence loop error and the deck direction setting work
- **Screenshots** were taken at 360 px and 1100 px, in light and dark themes, and looked at by eye (including the roof drawing at 2:12, 6:12, 12:12 and 30:12).
- **Not tested:** a real Android phone or other real devices, Safari and Firefox, screen readers, a live GitHub Pages deployment, Google Search Console, and AdSense. Do the checklist in README section 5 on your phone after you publish.

## Known behavior worth knowing

- The deck calculator rounds the number of rows up. With the starting numbers, the 26th row would be only 0.25 inch wide. The result says so and suggests adjusting the gap, because a real deck could skip that row.
- Canonical, Open Graph, structured data, `robots.txt` and `sitemap.xml` now use `https://prabaly696-eng.github.io/measure-twice/`.
- The contact email is still a placeholder on purpose. Nothing here claims the site is live; that must be verified after deployment.
- US and Metric units are supported on eight calculators (not Roof Pitch, which uses ratios).

## Formula test table

| # | Calculator | Input | Expected | Status |
|---|---|---|---|---|
| 1 | Util.parse | `"12"` | 12 | PASS |
| 2 | Util.parse | `" 1,200.5 "` | 1200.5 | PASS |
| 3 | Util.parse | `"1,2"` | NaN | PASS |
| 4 | Util.parse | `"$45"` | 45 | PASS |
| 5 | Util.parse | `"abc"` | NaN | PASS |
| 6 | Util.parse | `""` | NaN | PASS |
| 7 | Util.parse | `"1e5"` | NaN | PASS |
| 8 | Util.parse | `"-3"` | -3 | PASS |
| 9 | Util.parse | `".5"` | 0.5 | PASS |
| 10 | Util.parse | `"5."` | 5 | PASS |
| 11 | Util.parse | `"12 ft"` | NaN | PASS |
| 12 | Util.parse | `"--4"` | NaN | PASS |
| 13 | Roof pitch | `{"rise":"6","run":"12"}` | 6:12, 50%, 26.565 deg, x1.1180 | PASS |
| 14 | Roof pitch | `{"rise":"8","run":"24"}` | 4:12, 33.33%, 18.435 deg, x1.0541 | PASS |
| 15 | Roof pitch | `{"rise":"12","run":"12"}` | 12:12, 100%, 45 deg, x1.4142 | PASS |
| 16 | Roof pitch | `{"rise":"5","run":"12"}` | angle 22.620 deg | PASS |
| 17 | Roof pitch | `{"rise":"0","run":"12"}` | flat: 0:12, 0%, 0 deg, x1 | PASS |
| 18 | Roof pitch | `{"rise":"2.5","run":"10"}` | 3:12 (unit-free), 25% | PASS |
| 19 | Roof pitch | `{"rise":"6","run":"0"}` | error on run | PASS |
| 20 | Roof pitch | `{"rise":"-1","run":"12"}` | error on rise | PASS |
| 21 | Roof pitch | `{"rise":"abc","run":"12"}` | error on rise | PASS |
| 22 | Roof pitch | `{"rise":"","run":""}` | error on rise | PASS |
| 23 | Roof pitch | `{"rise":"6","run":"-12"}` | error on run | PASS |
| 24 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"12","direction":"length"}` | rows 26, 2 per row, 52 base, 58 boards, area 192 | PASS |
| 25 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"16","direction":"length"}` | rows 26, 1 per row, 26 base, 29 boards | PASS |
| 26 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"12","direction":"width"}` | run 12 ft, rows 34, 1 per row, 38 boards | PASS |
| 27 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"","boardLength":"12","direction":"length"}` | blank waste = 0%: 52 boards | PASS |
| 28 | Deck | `{"length":"16","width":"12.5","boardWidth":"6","gap":"0","waste":"10","boardLength":"10","direction":"length"}` | 25 rows x 2 = 50; 50 x 1.10 must give 55 (not 56) | PASS |
| 29 | Deck | `{"length":"10","width":"10","boardWidth":"5.5","gap":"0.25","waste":"","boardLength":"20","direction":"length"}` | rows 21, 1 per row, 21 boards (no waste) | PASS |
| 30 | Deck | `{"length":"0","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"12","direction":"length"}` | error on length | PASS |
| 31 | Deck | `{"length":"16","width":"-5","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"12","direction":"length"}` | error on width | PASS |
| 32 | Deck | `{"length":"16","width":"12","boardWidth":"0","gap":"0.25","waste":"10","boardLength":"12","direction":"length"}` | error on boardWidth | PASS |
| 33 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"-0.1","waste":"10","boardLength":"12","direction":"length"}` | error on gap | PASS |
| 34 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"5","waste":"10","boardLength":"12","direction":"length"}` | error on gap | PASS |
| 35 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"150","boardLength":"12","direction":"length"}` | error on waste | PASS |
| 36 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"ten","boardLength":"12","direction":"length"}` | error on waste | PASS |
| 37 | Deck | `{"length":"16","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"9","direction":"length"}` | error on boardLength | PASS |
| 38 | Deck | `{"length":"","width":"12","boardWidth":"5.5","gap":"0.25","waste":"10","boardLength":"12","direction":"length"}` | error on length | PASS |
| 39 | Retaining wall | `{"length":"20","height":"3","blockLength":"16","blockHeight":"8","waste":"10"}` | area 60, face .889, exact 67.5, 75 blocks, 5 courses, 15 per course | PASS |
| 40 | Retaining wall | `{"length":"20","height":"3","blockLength":"16","blockHeight":"8","waste":""}` | blank waste: 67.5 rounds up to 68 | PASS |
| 41 | Retaining wall | `{"length":"16","height":"4","blockLength":"16","blockHeight":"8","waste":"0"}` | exact fit: 72 blocks, 6 courses, 12 per course (no rounding up to 73) | PASS |
| 42 | Retaining wall | `{"length":"30","height":"2","blockLength":"12","blockHeight":"4","waste":"5"}` | area 60, face .3333, exact 180, x1.05 = 189 | PASS |
| 43 | Retaining wall | `{"length":"20","height":"3","blockLength":"0","blockHeight":"8","waste":"10"}` | error on blockLength | PASS |
| 44 | Retaining wall | `{"length":"20","height":"3","blockLength":"16","blockHeight":"-2","waste":"10"}` | error on blockHeight | PASS |
| 45 | Retaining wall | `{"length":"0","height":"3","blockLength":"16","blockHeight":"8","waste":"10"}` | error on length | PASS |
| 46 | Retaining wall | `{"length":"20","height":"tall","blockLength":"16","blockHeight":"8","waste":"10"}` | error on height | PASS |
| 47 | Retaining wall | `{"length":"20","height":"3","blockLength":"16","blockHeight":"8","waste":"150"}` | error on waste | PASS |
| 48 | Retaining wall | `{"length":"20","height":"","blockLength":"16","blockHeight":"8","waste":"10"}` | error on height | PASS |
| 49 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"45"}` | area 200, 50 cu ft, 1.8519 cu yd, cost $83.33 | PASS |
| 50 | Gravel | `{"length":"240","lengthUnit":"in","width":"120","widthUnit":"in","depth":"0.25","depthUnit":"ft","price":""}` | same volume from inches and feet: 50 cu ft, no cost | PASS |
| 51 | Gravel | `{"length":"9","lengthUnit":"ft","width":"9","widthUnit":"ft","depth":"4","depthUnit":"in","price":""}` | exactly 27 cu ft = 1 cu yd | PASS |
| 52 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"$45"}` | price typed as $45 is accepted | PASS |
| 53 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"0"}` | price 0 allowed: cost $0 | PASS |
| 54 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"0","depthUnit":"in","price":"45"}` | error on depth | PASS |
| 55 | Gravel | `{"length":"-4","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"45"}` | error on length | PASS |
| 56 | Gravel | `{"length":"20","lengthUnit":"ft","width":"","widthUnit":"ft","depth":"3","depthUnit":"in","price":"45"}` | error on width | PASS |
| 57 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"50","depthUnit":"in","price":"45"}` | error on depth | PASS |
| 58 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"-5"}` | error on price | PASS |
| 59 | Gravel | `{"length":"20","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"3","depthUnit":"in","price":"cheap"}` | error on price | PASS |
| 60 | Mulch | `{"length":"12","lengthUnit":"ft","width":"8","widthUnit":"ft","depth":"3","depthUnit":"in","price":"35"}` | area 96, 24 cu ft, 0.8889 cu yd, 12 bags (2 cu ft), 8 bags (3 cu ft), cost $31.11 | PASS |
| 61 | Mulch | `{"length":"10","lengthUnit":"ft","width":"10","widthUnit":"ft","depth":"2","depthUnit":"in","price":""}` | 16.667 cu ft: 9 bags of 2, 6 bags of 3 | PASS |
| 62 | Mulch | `{"length":"120","lengthUnit":"in","width":"96","widthUnit":"in","depth":"3","depthUnit":"in","price":""}` | 120 in x 96 in x 3 in = 10 ft x 8 ft x 0.25 ft = 20 cu ft | PASS |
| 63 | Mulch | `{"length":"12","lengthUnit":"ft","width":"8","widthUnit":"ft","depth":"","depthUnit":"in","price":"35"}` | error on depth | PASS |
| 64 | Mulch | `{"length":"0","lengthUnit":"ft","width":"8","widthUnit":"ft","depth":"3","depthUnit":"in","price":"35"}` | error on length | PASS |
| 65 | Mulch | `{"length":"12","lengthUnit":"ft","width":"wide","widthUnit":"ft","depth":"3","depthUnit":"in","price":"35"}` | error on width | PASS |
| 66 | Fence | `{"length":"100","spacing":"8","layout":"run","spare":""}` | 13 sections, 14 posts, spacing 7.692 ft, 14 to buy | PASS |
| 67 | Fence | `{"length":"100","spacing":"8","layout":"run","spare":"5"}` | 14 x 1.05 = 14.7, round up to 15 | PASS |
| 68 | Fence | `{"length":"96","spacing":"8","layout":"run","spare":""}` | exact fit: 12 sections, 13 posts | PASS |
| 69 | Fence | `{"length":"100","spacing":"8","layout":"loop","spare":""}` | closed loop: 13 sections, 13 posts | PASS |
| 70 | Fence | `{"length":"2.4","spacing":"0.8","layout":"run","spare":""}` | floating point: 2.4 / 0.8 is exactly 3 sections, 4 posts | PASS |
| 71 | Fence | `{"length":"5","spacing":"8","layout":"run","spare":""}` | shorter than spacing: 1 section, 2 posts | PASS |
| 72 | Fence | `{"length":"10","spacing":"8","layout":"loop","spare":""}` | error on layout | PASS |
| 73 | Fence | `{"length":"100","spacing":"0","layout":"run","spare":""}` | error on spacing | PASS |
| 74 | Fence | `{"length":"-5","spacing":"8","layout":"run","spare":""}` | error on length | PASS |
| 75 | Fence | `{"length":"","spacing":"8","layout":"run","spare":""}` | error on length | PASS |
| 76 | Fence | `{"length":"100","spacing":"8","layout":"run","spare":"-1"}` | error on spare | PASS |

