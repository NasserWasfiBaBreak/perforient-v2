# PERFORIENT website

Plain HTML/CSS/JS, so there is no build step. Upload the contents of this `site/` folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, or your domain's cPanel `public_html`).

## Pages
- `index.html`: homepage (hero diagram, diagnosis checklist, leak calculator, services, results, method, why us, FAQ, audit form)
- `case-studies/engineering-firm.html`
- `case-studies/educational-institution.html`

## Before going live (2 settings)
Open `assets/js/main.js` and fill in `PERFORIENT_CONFIG` at the top:

1. **`formEndpoint`**: where the audit form sends submissions.
   Free option: create a form at https://formspree.io, then paste its URL, e.g. `"https://formspree.io/f/abcdwxyz"`.
   Submissions are then emailed to you. Until it is set, the form shows a "not connected yet" notice.
2. **`bookingUrl`**: your online booking page (Calendly, Cal.com, Google Calendar booking page…).
   Every "Book Online" button uses it. Until it is set, those buttons scroll to the form.

## Other things to update later
- **Client names/logos**: case studies are anonymous on purpose. Add names only once written permission is confirmed.
- **Domain**: canonical URLs, `sitemap.xml` and `robots.txt` assume `https://www.perforient.com`.
- **Logo**: `assets/img/logo.svg` (full logo) and `assets/img/favicon.svg` (icon).
- **Colors**: brand tokens are at the top of `assets/css/styles.css` (navy `#0B1F3A`, orange `#FF7A1A`).
- **Social preview image**: `assets/img/og-image.png` (1200×630). The `og:image` tags currently point to the
  github.io address. When perforient.com is connected, change them to `https://www.perforient.com/assets/img/og-image.png`.
- **FAQ**: on the homepage, with matching FAQ structured data in the `<head>`. Edit both together.
- **404 page**: `404.html` (GitHub Pages serves it automatically for missing pages).
- **Fonts**: Archivo (headings and body) and IBM Plex Mono (annotations) are self-hosted in `assets/fonts/` (SIL Open Font License).

## Design: "Engineering Blueprint"
The site is styled as an engineering drawing set: paper and grid, ink lines, numbered "sheets",
and red-orange "redline" markups for the fixes. Colors are tokens at the top of `assets/css/styles.css`.

Interactive parts (all in `assets/js/main.js`):
- **Process diagram** (`data-diagram="rd"` or `"enroll"`): a workflow with leaks. "Apply the fix" removes waste steps.
  Edit the steps in the `DIAGRAMS` object.
- **Symptom checklist** and **leak calculator**: their results are added to the audit form as hidden fields
  (`symptoms`, `leak_estimate`) so they arrive with each request.
- **Before/after case sheets** (`data-case`).
- **Work order form**: each visitor gets a reference number (`work_order` field).

## Preview locally
```
python3 -m http.server 8000
```
(run it inside this folder)
Then open http://localhost:8000
