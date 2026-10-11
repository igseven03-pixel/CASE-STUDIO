# CASE STUDIO – phone case catalogue
- `npm install` then `npm run build` → static site in `dist/` (`npm start` to preview). Deploy `dist/` to Netlify, Vercel, GitHub Pages, etc.
- **Add products:** drop images into `images/`, run `npm run build`. New ones are appended to `data/catalog.json` as "Design NNN" – edit name, collection, tags, description, price, featured/isNew/active there.
- **Business info:** `data/site.json` (name, announcement – empty hides the bar, WhatsApp/email/Instagram, collections, `phones`: {"Brand":["Model",...]} enables brand/model selectors).
- Policies are placeholders (see `build.mjs`). Originals stay in `images/`.
- Not built (needs a backend): cart, checkout, wishlist, contact-form delivery, admin UI.
