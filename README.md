# Jupiter Industrial Works — Next.js website + CMS

Full conversion of the static `Jupiter.zip` marketing site into a database-driven
Next.js application with an admin CMS. Every piece of public content (pages, sections,
products, power presses, press posts, locations, header, footer, CTA, contact
details, media) is editable from `/admin`. The top navigation is generated
automatically from the catalogue; its labels and drop-down texts live in Site settings → Header.

## Stack

| Layer     | Technology                                                            |
|-----------|-----------------------------------------------------------------------|
| Frontend  | Next.js 16 (App Router, React 19), original CSS ported 1:1            |
| Backend   | Next.js Route Handlers (REST API under `/api`)                        |
| Database  | MySQL / MariaDB via **Sequelize** ORM (`mysql2` driver)               |
| Auth      | JWT in an http-only cookie (`jose`), passwords hashed with `bcryptjs` |
| Uploads   | Stored in `public/uploads`, tracked in the `media` table              |

## Quick start

```bash
cp .env.example .env.local        # then edit DB credentials / JWT_SECRET / admin login
npm install
npm run db:create                 # creates the database if it does not exist
npm run db:seed                   # creates tables + loads all original site content + admin user
npm run dev                       # http://localhost:3000  (admin: http://localhost:3000/admin)
```

Default admin login comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local`
(see `.env.example`). Change the password from **Admin users** after first login.

Other scripts:

| Script             | What it does                                                        |
|--------------------|---------------------------------------------------------------------|
| `npm run db:sync`  | Create missing tables (`-- --alter` to alter existing ones)         |
| `npm run db:reset` | **Drops** all tables and re-seeds the original content             |
| `npm run build`    | Production build                                                    |
| `npm start`        | Serve the production build                                          |

## Project layout

```
src/
  app/
    (site)/            public website (own root layout, imports the original CSS)
      page.js          home            /about  /products  /products/[slug]
      power-press/     /power-press    /power-press/[slug]
      press/           /press          /press/[slug]
      contact/         /contact        [slug]/  → custom CMS pages
    (admin)/admin/     CMS (own root layout + admin.css)
      login/           sign-in
      (dash)/          dashboard, [resource] lists & forms, settings, media, pages/[id]/sections
    api/               REST API (public + /api/admin/*)
  components/site/     Header, Footer, CTA, section components, SiteEffects (ported JS)
  components/admin/    SchemaForm (schema-driven forms), MediaPicker, ResourceList/Form, editors
  lib/
    models/index.js    Sequelize models
    db.js              connection singleton
    content.js         data loaders used by the public pages
    sectionSchemas.js  section types + their editable fields (drives renderer AND admin)
    resources.js       admin resource definitions (fields, columns) + settings schema
    seed-data.js       all original site content
  proxy.js             route protection for /admin and /api/admin
scripts/               create-db / sync / seed
public/images, video   original assets   ·   public/uploads  CMS uploads
```

## Data model

| Table                | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| `pages` / `sections` | Pages are ordered lists of typed sections with JSON data       |
| `product_categories` | Clamp ranges (V-Band, T-Bolt, …) with hero/features/steps/etc. |
| `products`           | Individual designs inside a category                           |
| `machines`           | Power presses with gallery, features and spec table            |
| `posts`              | Press / Insights articles                                      |
| `locations`          | Contact cards with Google Maps embed                           |
| `enquiries`          | Contact-form submissions (also e-mailed to the contact address)|
| `job_openings`       | Careers page openings                                          |
| `job_applications`   | Applications with CV (file in `storage/cv`, also e-mailed to HR)|
| `settings`           | Branding, header, footer, contact, social, CTA (JSON per group)|
| `media`              | Uploaded files                                                 |
| `admin_users`        | CMS logins (admin / editor)                                    |

### Section types

`hero_video`, `marquee`, `divisions`, `vision`, `mission`, `crafting`, `built_to_scale`,
`about_hero`, `expertise`, `journey`, `certifications`, `page_title`, `product_grid`,
`machines_grid`, `press_list`, `contact_locations`, `contact_form`, `rich_text`,
`feature_grid`, `image_text`. Add a new type by registering its fields in
`src/lib/sectionSchemas.js` and a component in `src/components/site/SectionRenderer.js`.

## API

Public (GET): `/api/products`, `/api/products/:slug`, `/api/machines`, `/api/machines/:slug`,
`/api/posts?limit=`, `/api/posts/:slug`, `/api/locations`, `/api/menu` (generated), `/api/settings`,
`/api/pages/:slug`. Public POST: `/api/enquiries`, `/api/applications` (multipart with `cv` file).

Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

Admin (cookie required): `GET|POST /api/admin/:resource`, `GET|PUT|DELETE /api/admin/:resource/:id`
for `products`, `product-items`, `machines`, `posts`, `locations`, `pages`, `users`,
`enquiries`; plus `/api/admin/settings`, `/api/admin/sections[...]`, `/api/admin/upload`,
`/api/admin/media`, `/api/admin/stats`.

## Notes

* Public pages are rendered on demand (`force-dynamic`) so CMS edits are visible instantly.
* HTML entered in rich-text fields is sanitised on render (scripts / inline handlers removed).
* Uploads are written to the local filesystem; on serverless hosts replace
  `src/app/api/admin/upload/route.js` with S3/Cloudinary storage.
* E-mail notifications (enquiries → contact address, job applications → HR with the CV attached, plus an
  acknowledgement to the applicant) are sent with nodemailer when `SMTP_HOST` is set in `.env.local`.
  Locally, Mailpit on port 1025 (UI at http://localhost:8025) catches them. Without SMTP the forms still work.
* Applicant CVs are stored outside `public/` in `storage/cv` and served only to signed-in admins.
* MariaDB is supported: JSON columns are stored as LONGTEXT and (de)serialised by the models.
