# Pojok Seken

Pojok Seken is a TypeScript Next.js marketplace demo for selling used products. It includes dummy product data, searchable listings, product detail pages, SEO metadata, sitemap, robots rules, and JSON-LD schema.

## Routes

- `/` - homepage
- `/search` - product search and filters
- `/products/[slug]` - product detail page
- `/about`, `/contact`, `/about-contact` - about and contact page
- `/terms-and-conditions`, `/terms`, `/term-and-condition` - terms page
- `/sitemap.xml` - sitemap
- `/robots.txt` - robots rules

## Data

Dummy products live in `data/products.ts`.

## Development

```bash
yarn install
yarn dev
```

Open `http://127.0.0.1:3000`.

## Validation

```bash
yarn tsc --noEmit
yarn build
```
