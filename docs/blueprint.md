# App Name: Sweet Surprise

> Note: standardized to "Sweet Surprise" here — the original draft of this
> file used "Sweet Delights Bakery," which doesn't match the name used in
> every other project document (pd.md, app_flow.md, backend_schema.md,
> trd.md, implementation_plan.md).

## Core Features:

- **Logo Integration**: Display the bakery's logo prominently in the header to enhance brand recognition.
- **Category Divisions**: Organize bakery items (cakes, cookies, chocolates, packing & bouquets) into distinct, visually appealing categories.
- **Product Cards**: Display each item as a card with an image and link to a detailed product page.
- **Header Navigation**: Functional header with links to key sections and contact info.
- **Informative Footer**: Footer with links to FAQs, contact information, and social media pages.
- **Hover Animations**: Animate product card appearance on hover to create interactive engagement.

## Style Guidelines:

- **Primary color**: Pink (#FF69B4) to evoke sweetness and charm.
- **Background color**: White (#FFFFFF) for a clean and modern look.
- **Accent color**: Light Purple (#E6E6FA) for highlights and calls to action.
- **Headline font**: 'Playfair Display' (serif) for an elegant feel; body font: 'Open Sans' (sans-serif) for readability.
- **Icons**: Delicate line icons related to bakery items (cake, cookie, etc.).
- **Layout**: Cards arranged in a grid layout within each category section, with sufficient spacing.
- **Hover behavior**: Subtle scale animation and shadow increase on product card hover.

## Technical Foundation

This is a visual/UX spec only — it intentionally says nothing about
backend technology. For how it's actually built, see:
- `trd.md` — full tech stack (Next.js 15, Tailwind, Shadcn UI, Supabase)
- `implementation_plan.md` — phase-by-phase build steps with security checkpoints
- `file_structure.md` — where each piece of this design lives in the codebase
