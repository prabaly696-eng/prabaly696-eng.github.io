# Measure Twice Calculators: setup guide

A free, static website with nine calculators (roof pitch, deck, retaining wall, gravel, mulch, fence posts, concrete, paint, tile and flooring), most with a US and Metric switch for US home and yard projects. It uses only HTML, CSS and plain JavaScript. There is no server, no database, no paid service and no build step.

Nothing in this project promises search rankings, traffic, Google AdSense approval or income.

## 1. What is in this folder

Every file sits in one flat folder on purpose. That makes it easy to upload from an Android phone, because you do not have to create sub-folders.

| File | What it is |
|---|---|
| `concrete.js`, `paint.js`, `tile-flooring.js` | The three new calculators |
| `index.html` | Home page with the nine calculator cards |
| `roof-pitch-calculator.html` | Roof pitch calculator page |
| `deck-material-calculator.html` | Deck material calculator page |
| `retaining-wall-calculator.html` | Retaining wall calculator page |
| `gravel-calculator.html` | Gravel calculator page |
| `mulch-calculator.html` | Mulch calculator page |
| `fence-post-calculator.html` | Fence post calculator page |
| `about.html`, `contact.html`, `privacy.html`, `terms.html` | Required info pages |
| `404.html` | Page shown when an address does not exist |
| `style.css` | All the design |
| `main.js` | Shared helpers (reading numbers, checking input, showing results) |
| `roof-pitch.js`, `deck-material.js`, `retaining-wall.js`, `gravel.js`, `mulch.js`, `fence.js` | The formula for each calculator |
| `favicon.svg` | Small icon in the browser tab |
| `robots.txt`, `sitemap.xml` | Files for search engines |
| `README.md` | This guide |

## 2. Fill in the placeholders before you publish

These are placeholders because the details are yours to choose. Replace the remaining ones when you can. The site works without the email, but a real contact address helps trust.

1. **Website address.** Already set to `https://prabaly696-eng.github.io/measure-twice/` in every canonical link, Open Graph tag, `robots.txt` and `sitemap.xml`. Your repository must be named exactly `measure-twice`.
2. **Contact email.** Done: `measuretwice.help@gmail.com` is on the Contact page as a clickable link. To change it later, edit `contact.html` and replace it in the line that starts with "Email:".
3. **About text.** Done. It uses the description you provided.
4. **Hosting service name** in `privacy.html`. Done: "GitHub Pages, run by GitHub, Inc."
5. **Google Search Console tag** and **AdSense script**. These are marked in the `<head>` of each page. Leave them empty until Google gives you the code (steps 7 and 8).

Look for the yellow dashed boxes on the About, Contact and Privacy pages. Those are the visible placeholders.

## 3. Which free host to use

**Recommended: GitHub Pages.** It is free for public repositories, needs no credit card and can be set up from a phone browser.

Limits checked on October 30, 2026 (limits can change, so check again before you rely on them):

- GitHub Pages: published site up to 1 GB, soft bandwidth limit of 100 GB per month, soft limit of 10 builds per hour. This site is well under 1 MB.
- GitHub says Pages is not intended as free hosting for online businesses, e-commerce or sites mainly used for commercial transactions. A free calculator site is not a shop, but GitHub does not say clearly how it treats ads. If the site starts to earn money, read GitHub's current terms again or move to another host.
- Cloudflare Pages (free plan) is a good second choice: 500 builds per month, up to 20,000 files per site and 25 MiB per file. Check its current terms and bandwidth rules before you use it.

Sources: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits).

GitHub and Google both have their own age rules. Ask a parent or guardian to help you with accounts, and follow each service's current rules.

## 4. Put the site online from an Android phone

You need: a phone with Chrome, a free GitHub account and these files on your phone. If you received a `.zip` file, open it with the Files app and tap Extract first.

1. **Create the files on your phone.** Extract the zip so that all files are in one folder.
2. **Make a GitHub account** at github.com (a parent or guardian can help). Confirm your email.
3. **Create a repository.** Tap the **+** button, then **New repository**.
   - Repository name: `measure-twice`. This is a project site, so the address will be `https://prabaly696-eng.github.io/measure-twice/` (note the `/measure-twice/` part).
   - Choose **Public**. Tap **Create repository**.
4. **Upload the files.** On the new repository page, tap **uploading an existing file** (or **Add file**, then **Upload files**). Tap to choose files, open your folder, select **all** the files and tap Open. Wait until all files show in the list.
5. **Save.** Scroll down and tap **Commit changes**.
6. **Turn on Pages.** Open **Settings**, then **Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**. Set the branch to **main** and the folder to **/ (root)**. Tap **Save**. If the Settings menu is hard to find on your phone, open the Chrome menu and turn on **Desktop site**.
7. **Wait 1 to 3 minutes**, then open `https://prabaly696-eng.github.io/measure-twice/`. The Pages settings screen also shows the address.

**To change a file later:** open the repository, tap the file, tap the pencil icon, edit the text, then tap **Commit changes**. The site updates after a minute or two.

## 5. Test the live site

Open the live address on your phone and check each item:

- [ ] The home page shows nine calculator cards, and every card opens a page.
- [ ] On each calculator page, tap **Calculate** with the starting numbers. A result appears.
- [ ] Type letters or a negative number. A clear error message appears, and no result is shown.
- [ ] Tap **Reset**. The starting numbers come back and the result disappears.
- [ ] The footer links (About, Contact, Privacy Policy, Terms of Use) open.
- [ ] Type a wrong address such as `/nothing-here`. The "Page not found" page appears.
- [ ] Nothing scrolls sideways on your phone.

## 6. Connect a custom domain later (optional)

Do this only after you have real visitors. A domain costs money every year, so do not buy one before you know people use the site.

1. Buy a domain from a registrar. A parent or guardian should handle the payment.
2. In your repository, open **Settings**, then **Pages**, and enter the domain under **Custom domain**.
3. At your registrar, add the DNS records that GitHub Pages lists in its current instructions.
4. Turn on **Enforce HTTPS** when GitHub allows it.
5. Ask Claude for the files again with your new address filled in, and upload them to replace the old ones.

## 7. Connect Google Search Console (free)

Search Console shows whether Google can find and show your pages. It does not guarantee any ranking.

1. Go to search.google.com/search-console and sign in with a Google account.
2. Choose **URL prefix** and enter your full address, for example `https://prabaly696-eng.github.io/measure-twice/`.
3. Choose the **HTML tag** verification method. Google shows a line starting with `<meta name="google-site-verification"`.
4. Paste that line into `index.html` in the place marked `PLACEHOLDER (Google Search Console)`. Commit the change, wait a minute, then tap **Verify** in Search Console.
5. Open **Sitemaps** and submit `sitemap.xml`. `robots.txt` is only read by crawlers at the root of a host (`prabaly696-eng.github.io/robots.txt`), so on a project site it has no effect. Submitting `sitemap.xml` in Search Console is what matters.
6. Check back after several days. Pages can take days or weeks to be indexed, and some may not be.

## 8. Google AdSense: only when the site is ready

Facts from Google's AdSense help page (checked October 30, 2026; Google can change them):

- Applicants must be at least 18 years old.
- A minor can have a parent or guardian sign up using the **guardian's** Google Account. If that account is approved, all payments go to the adult responsible for the site.
- Content must be high quality, original and attract an audience, and the site must follow AdSense policies.
- You must be able to edit the site's HTML to add the AdSense code.

What this means for you:

- **Do not use a false age or someone else's identity.** A parent or guardian must apply and manage the AdSense account and payment details, as Google's rules require.
- Read Google's current AdSense rules, including what it says about site ownership and about sites on free host addresses. This guide does not claim that any address type is or is not accepted.
- Apply only when the site is live, complete and useful. Do not add fake ad code. When Google approves the site, paste its script into the `PLACEHOLDER (Google AdSense)` line in each page's `<head>`, and place ad units only where each calculator page has the `AD SLOT (PLACEHOLDER)` comment.
- Update the Privacy Policy before ads go live. Ads use cookies, and some regions need a consent notice.

## 9. An honest plan for earning from ads

- **Approval is not guaranteed.** Google may decide a small site with nine basic calculators does not offer enough value. It looks for original, accurate, useful pages. The worked examples, formulas and FAQs on each page help, but they may not be enough on their own.
- **Traffic is not guaranteed.** Many sites already offer similar calculators. SEO takes months, and some pages may never reach the first page of Google.
- **Do not spend money first.** Do not buy a domain, pay for ads or buy traffic until you see people using the site. Bought traffic can get an AdSense account banned.
- **Earnings stay small until traffic is large.** Do not plan around income from this site.

What to watch (both are free):

- **Search Console, Performance:** impressions (how often Google showed a page), clicks, click-through rate and average position, and the search queries behind them.
- **Search Console, Pages:** how many pages Google has indexed and why others are not.
- If you add Google Analytics later, update the Privacy Policy first.

How to decide what to do next:

- Pages show impressions but few clicks: improve the title and description, then wait a few weeks.
- A page sits around positions 8 to 20: make it more useful. Add a clearer example, a better explanation or a table that answers real questions.
- A query keeps appearing that you do not cover (for example a concrete or paint calculator): build that calculator next.
- No impressions after 4 to 6 weeks: check in Search Console that the pages are indexed and the sitemap was read.

## 10. What was tested

The formulas, error handling, page links and mobile layout were tested before this guide was written. The details are in `TEST-REPORT.md`, which comes with this download. The tests ran in a desktop Chromium browser at phone and desktop widths. They have not been run on a real Android phone, so do the checklist in section 5 on yours.
