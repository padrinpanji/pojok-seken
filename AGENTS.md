# Project Rules

## Styling

- Use Tailwind CSS utilities for new UI work whenever practical.
- Do not add global CSS for styling that can be expressed with existing Tailwind utilities.
- Prefer responsive Tailwind classes such as `sm:`, `md:`, `lg:`, and `xl:` instead of desktop-only layouts.
- Keep custom CSS minimal and scoped to cases that Tailwind cannot express cleanly or repeated project-level patterns.
- Reuse existing design tokens, colors, spacing, and component patterns before adding new visual styles.

## Responsive Design

- Build every page and component mobile-first.
- Verify layouts at mobile, tablet, and desktop widths.
- Avoid fixed widths that can overflow on small screens.
- Ensure text, buttons, forms, cards, images, and navigation do not overlap or clip.
- Use flexible grids, wrapping, and `minmax` or responsive Tailwind sizing where needed.

## Frontend Quality

- Keep interactions smooth and avoid layout jumps.
- Use accessible labels, semantic HTML, and keyboard-friendly controls.
- Do not add unnecessary JavaScript when CSS or server-rendered markup is enough.
- Run `yarn build` after UI or routing changes when feasible.
