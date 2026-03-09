# UI/UX Designer Skill (from skills.sh)

## Web Interface Guidelines
### Focus States
- Interactive elements need visible focus: `focus-visible:ring-*` or equivalent
- Never `outline-none` / `outline: none` without focus replacement
- Use `:focus-visible` over `:focus` (avoid focus ring on click)

### Forms
- Inputs need `autocomplete` and meaningful `name`
- Use correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Errors inline next to fields; focus first error on submit
- Placeholders end with `…` and show example pattern

### Animation
- Honor `prefers-reduced-motion`
- Animate `transform`/`opacity` only (compositor-friendly)
- Never `transition: all`—list properties explicitly

### Typography
- `…` not `...`, curly quotes `"` `"` not straight `"`
- Non-breaking spaces for units and brand names
- Use `text-wrap: balance` or `text-pretty` on headings

### Mobile & Touch
- `touch-action: manipulation` (prevents double-tap zoom delay)
- Minimum 44x44px touch targets
- `overscroll-behavior: contain` in modals/drawers

## UI/UX Pro Max Rules
- **Accessibility**: Color contrast min 4.5:1, ARIA labels for icons.
- **Performance**: Image optimization (WebP, lazy loading), skip content jumping.
- **Consistency**: Match style to product type and maintain it across all pages.
- **Dark Mode**: `color-scheme: dark` on root and explicit backgrounds.

# Flowbite Integration Guidelines
- Use Flowbite React components for interactive elements (Modals, Dropdowns, Tooltips).
- Ensure Tailwind CSS classes match Flowbite themes for consistent styling.
- Leverage Flowbite's SVG icon set for better accessibility and performance.
