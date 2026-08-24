# Design System

> Visual design guidelines for the dynamic portfolio platform.
> Source of truth: [DARK_DESIGN.md](DARK_DESIGN.md) · [LIGHT_DESIGN.md](LIGHT_DESIGN.md)

---

## 1. Design Philosophy

The portfolio is a **premium, minimal, developer-focused** platform. Every visual decision serves clarity and professionalism.

**Core principles:**

1. **Minimal and intentional.** Every element earns its place. No decorative clutter.
2. **Content-first.** Typography and spacing do the heavy lifting. The design recedes; the content speaks.
3. **Premium feel.** Subtle refinements — precise spacing, smooth transitions, considered color — distinguish this from a template.
4. **Utility-first aesthetics.** Visual style is clean, functional, and implementation-oriented.
5. **Accessible by default.** WCAG 2.2 AA is the baseline, not an afterthought.

---

## 2. Typography

### Font Family

- **Primary:** Geist Variable
- **Fallback stack:** system-ui, -apple-system, sans-serif
- **Monospace (code):** Geist Mono, ui-monospace, monospace

### Type Scale

| Token | Size | Usage |
|---|---|---|
| `text-xs` | 14px | Captions, labels, metadata |
| `text-sm` | 16px (base) | Body text, paragraphs |
| `text-md` | 20px | Subheadings, lead text |
| `text-lg` | 28px | Section titles |
| `text-xl` | 36px | Page titles |
| `text-2xl` | 44px | Hero subtitles |
| `text-3xl` | 56px | Hero headlines |
| `text-4xl` | 72px | Display / splash text |

### Typography Rules

- Base font size: **16px**.
- Base line height: **24px** (1.5).
- Base font weight: **400** (regular).
- Headings SHOULD use weight **600** or **700**.
- Body text MUST maintain a line length of **60–80 characters** for readability.
- MUST NOT use more than 3 font weights on a single page.
- MUST NOT introduce fonts beyond the defined family stack.

---

## 3. Color System

### Dark Theme (Default)

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#000000` | Page background |
| `--color-surface` | `#111111` | Cards, panels, elevated areas |
| `--color-surface-muted` | `#1a1a1a` | Subtle backgrounds, hover states |
| `--color-foreground` | `#ffffff` | Primary text |
| `--color-muted` | `#b4b4b4` | Secondary text, descriptions |
| `--color-accent` | `#ff8c42` | Links, highlights, CTAs, interactive elements |
| `--color-border` | `#262626` | Dividers, card borders |
| `--color-destructive` | `#ef4444` | Error states, destructive actions |
| `--color-success` | `#22c55e` | Success states |

### Light Theme

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#faf8f5` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels, elevated areas |
| `--color-surface-muted` | `#e5ded6` | Subtle backgrounds, hover states |
| `--color-foreground` | `#212529` | Primary text |
| `--color-muted` | `#4b4b4b` | Secondary text, descriptions |
| `--color-accent` | `#ff8c42` | Links, highlights, CTAs |
| `--color-border` | `#d4cdc4` | Dividers, card borders |
| `--color-destructive` | `#dc2626` | Error states |
| `--color-success` | `#16a34a` | Success states |

> [!WARNING]
> **Ambiguity in source docs:** [LIGHT_DESIGN.md](LIGHT_DESIGN.md) lists `color.surface.base=#000000` which appears to be a copy error from the dark theme. This design system uses `#faf8f5` (warm off-white derived from the `surface.muted=#e5ded6` palette) as the light background. **Confirm with the design owner.**

### Color Rules

- The accent color (`#ff8c42`, warm orange) is the **only** brand color. It MUST be used sparingly: links, primary CTAs, active states, highlights.
- MUST NOT use accent for large filled backgrounds.
- MUST use semantic token names (`--color-foreground`), never raw hex values in components.
- MUST meet WCAG 2.2 AA contrast ratios: ≥4.5:1 for normal text, ≥3:1 for large text and UI elements.

---

## 4. Spacing System

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 8px | Tight gaps: icon-to-text, inline elements |
| `--space-2` | 12px | Compact padding: badges, tags, small cards |
| `--space-3` | 16px | Standard padding: card padding, form fields |
| `--space-4` | 24px | Component gaps: between card items |
| `--space-5` | 32px | Section sub-gaps |
| `--space-6` | 48px | Between content groups |
| `--space-7` | 64px | Section padding (top/bottom) |
| `--space-8` | 96px | Major section breaks, hero padding |

> **Note:** The source docs define only 5 spacing values (8, 12, 16, 64, 96). The intermediate values (24, 32, 48) are interpolated to avoid jumps between 16px and 64px. This is a pragmatic extension.

### Spacing Rules

- MUST use spacing tokens for all margins, paddings, and gaps.
- MUST NOT use arbitrary pixel values (e.g., `p-[13px]`).
- Vertical rhythm MUST be maintained through consistent section spacing.
- Card internal padding MUST use `--space-3` (16px) minimum.

---

## 5. Layout

### Container

- Maximum content width: **1200px**, centered.
- Side padding: `--space-3` (16px) on mobile, `--space-7` (64px) on desktop.

### Grid

- Use CSS Grid or Flexbox — not float-based layouts.
- Card grids: 1 column mobile → 2 columns tablet → 3 columns desktop.
- Blog/article content: single column, max-width 720px for readability.

### Responsive Breakpoints

| Token | Value | Target |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large displays |

- Design mobile-first. Base styles are mobile; add complexity at larger breakpoints.
- All layouts MUST be usable at 320px viewport width minimum.
- No horizontal scroll at any breakpoint.

---

## 6. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 4px | Small elements: badges, tags, code blocks |
| `--radius-sm` | 6px | Buttons, inputs, small cards |
| `--radius-md` | 8px | Cards, modals, panels |
| `--radius-lg` | 12px | Large cards, hero elements |
| `--radius-full` | 9999px | Avatars, circular buttons |

---

## 7. Shadows

| Token | Usage |
|---|---|
| `--shadow-sm` | Subtle card elevation |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, dialogs |

- Dark theme: shadows SHOULD be very subtle (near-invisible) since the dark background already provides separation.
- Light theme: shadows provide primary depth separation.

---

## 8. Motion and Animation

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 150ms | Hover, focus, active state changes |
| `--duration-fast` | 300ms | Transitions, small animations |
| `--duration-normal` | 500ms | Page transitions, content reveals |
| `--duration-slow` | 700ms | Complex animations, staggered entry |

### Motion Rules

- Default easing: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out).
- MUST respect `prefers-reduced-motion` — disable non-essential animations when set.
- Hover transitions MUST use `--duration-instant` or `--duration-fast`.
- Page content entry animations SHOULD use `--duration-normal` with staggered delays.
- MUST NOT use animations that block interaction or delay content visibility.
- MUST NOT use infinite animations except for deliberate loading indicators.

---

## 9. Component Patterns

### Buttons

- **Primary:** Accent background (`--color-accent`), white text. Used for main CTAs (1–2 per view).
- **Secondary:** Transparent with accent border. Used for secondary actions.
- **Ghost:** No border, subtle hover background. Used for tertiary actions, navigation.
- All buttons MUST have `hover`, `focus-visible`, `active`, `disabled`, and `loading` states.
- Minimum touch target: 44×44px.

### Cards

- Background: `--color-surface`.
- Border: 1px `--color-border`.
- Padding: `--space-3` minimum.
- Border radius: `--radius-md`.
- Hover: subtle border or shadow transition.
- MUST NOT use both heavy shadow and border simultaneously.

### Forms

- Input height: 40px minimum (44px recommended for touch).
- Border: 1px `--color-border`.
- Focus: 2px `--color-accent` ring.
- Error: `--color-destructive` border + error message below field.
- Labels MUST be visible (no placeholder-only labels).

### Navigation

- Header: sticky, blurred background, minimal height.
- Active link: accent color or underline indicator.
- Mobile: hamburger menu or slide-out panel.
- All nav items MUST be keyboard-navigable.

### Content Display

- Blog/article body: rendered Markdown with consistent heading, list, code, and blockquote styling.
- Code blocks: monospace font, subtle background, syntax highlighting.
- Images: responsive, rounded corners, optional caption.

---

## 10. States

Every interactive element MUST define these states:

| State | Visual Treatment |
|---|---|
| **Default** | Base appearance |
| **Hover** | Subtle background shift, cursor pointer |
| **Focus-visible** | 2px accent ring (keyboard only) |
| **Active** | Slightly pressed/darker appearance |
| **Disabled** | 50% opacity, cursor not-allowed, not interactive |
| **Loading** | Spinner or skeleton, no interaction |
| **Error** | Destructive color border/text |
| **Empty** | Descriptive message, optional illustration or CTA |

---

## 11. Accessibility

### Requirements (WCAG 2.2 AA)

- Text contrast: ≥4.5:1 (normal), ≥3:1 (large text ≥18px bold or ≥24px).
- Interactive element contrast: ≥3:1 against adjacent colors.
- Focus indicators MUST be visible with ≥3:1 contrast.
- All interactive elements MUST be keyboard-operable.
- Tab order MUST follow visual reading order.
- All images MUST have `alt` text (from `media.alt_text`).
- Form inputs MUST have associated `<label>` elements.
- Color MUST NOT be the sole means of conveying information.

### Keyboard Behavior

- `Tab` / `Shift+Tab`: navigate between interactive elements.
- `Enter` / `Space`: activate buttons and links.
- `Escape`: close modals, dropdowns, and overlays.
- Arrow keys: navigate within menus, tabs, and lists.
- `Ctrl/Cmd + K`: open command palette.

### Focus Management

- Use `focus-visible` (not `focus`) for ring styling to avoid showing rings on mouse click.
- Modals MUST trap focus within the dialog.
- After closing a modal, focus MUST return to the trigger element.
- Skip-to-content link MUST be the first focusable element.

---

## 12. Dark / Light Theme Behavior

- **Default:** Dark theme (matches the primary brand aesthetic).
- **Toggle:** Users can switch via a toggle in the header.
- **System preference:** On first visit, respect `prefers-color-scheme` if no saved preference exists.
- **Persistence:** Store the user's choice in `localStorage`.
- **Implementation:** Theme is controlled via a `data-theme` attribute on `<html>` or a CSS class (e.g., `class="dark"`). CSS custom properties switch values accordingly.
- Both themes MUST be tested. Every component MUST look correct in both themes.

---

## Related Documents

- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) — Complete token definitions
- [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md) — Tailwind usage rules
- [CSS_TOKENS.md](CSS_TOKENS.md) — CSS custom property structure
- [DARK_DESIGN.md](DARK_DESIGN.md) — Original dark theme spec
- [LIGHT_DESIGN.md](LIGHT_DESIGN.md) — Original light theme spec
