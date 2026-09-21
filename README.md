# Upper Harbour Youth Council — website

A single-page site: cinematic hero, About (with the real Local Board boundary
map), Our story timeline, Meet the team (routed org chart with previous
councils), Events (upcoming + recent + Google Calendar), Local Board plans
(in-page PDF viewer) and Get in touch.

Plain HTML/CSS/JS. No build step, no framework. PDF.js is loaded from cdnjs
only when the Plans section scrolls into view.

```
index.html          the page
css/styles.css      design system + layout
js/data.js          ALL CONTENT: names, events, milestones, links  <-- edit this
js/org.js           org-chart engine (cards + routed connector lines)
js/plans.js         PDF viewer
js/main.js          nav, reveals, timeline, events, contact form
assets/             logo, hero photo, banner, plans/*.pdf, photos/ (see photos/README.md)
```

## Editing content

Open `js/data.js`. Everything a council member would change lives there:

- **Meet the team:** `team.current` is what shows by default. When a new council
  starts, move the old `current` into the top of `team.previous` and fill in the
  new one. Groups can have a `lead` or not; older councils can use a flat
  `members` list instead of groups.
- **Events:** add an object to `events` with an ISO `date`. Anything dated in the
  future shows under "Coming up" (the first one is featured); past dates move to
  "This year so far" automatically. `dateTbc: true` shows "TBC" on the date badge.
- **Our story:** edit the `history` array. `photo` is optional.
- **Photos:** drop files into `assets/photos/` (see `assets/photos/README.md`).
  Missing photos show a placeholder, never a broken image.
- **Contact form:** paste a Formspree endpoint into `links.formEndpoint`
  (free at formspree.io, forwards to UpperHarbourYouth@gmail.com). Until then the
  form opens the visitor's email app with the message pre-filled.
- **Calendar:** the Google Calendar `upperharbouryouth@gmail.com` must be set to
  public (Settings -> Access permissions -> Make available to public).

## Run locally

```bash
python3 -m http.server 8124
```
then open http://localhost:8124

## Hosting

Live at **https://uhyc.org.nz** (GitHub Pages, repo `AWildPlaneAppeared/uhyc-website`,
branch `main`, root folder). `www.uhyc.org.nz` and
`awildplaneappeared.github.io/uhyc-website` redirect there. HTTPS is enforced;
GitHub renews the Let's Encrypt certificate itself.

Deploy = push to `main`. The site rebuilds in about a minute.

Domain: `uhyc.org.nz` is registered at domain.co.nz (The Domain Name Company) under
the UHYC account, auto-renew on, expires 21 Sep 2027. DNS there: four A records at
the root (185.199.108.153, .109.153, .110.153, .111.153) and `www` CNAME to
`awildplaneappeared.github.io`. The `CNAME` file in this repo tells GitHub the
domain; do not delete it.

`.nojekyll` is included so GitHub serves the files as-is.
