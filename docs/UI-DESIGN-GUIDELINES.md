# UI Design Guidelines & Visual Source of Truth

> **Visual Source of Truth for the Portfolio Platform**  
> Based on UI references in `ui-reference/` (`home/`, `about-page/`, `blogs/`, `blogs/slug/`) and design specifications in `docs/` (`DESIGN_SYSTEM.md`, `CSS_TOKENS.md`, `DESIGN_TOKENS.md`, `DARK_DESIGN.md`, `LIGHT_DESIGN.md`, `TAILWIND_GUIDELINES.md`).

---

## 1. Executive Summary & Design Philosophy

The portfolio platform is an **architectural, minimalist, high-craft developer portfolio**. It merges stark high-contrast typography with surgical warm amber/orange accents, clean horizontal dividing lines, split-column layouts, and an interactive micro-crafted feel.

### Core Visual Principles

1. **Architectural Grid & Structure:** Clean horizontal divider rules (`1px solid var(--color-border)`) frame sections. Split layouts feature left-aligned section labels/metadata paired with rich content streams on the right.
2. **Typography as Architecture:** High-impact typography carries the visual weight. Giant uppercase display watermarks anchor hero and footer areas, while crisp sans-serif body copy ensures effortless readability.
3. **Surgical Accentuation:** A single brand accent color—warm orange (`#ff8c42`)—is used deliberately for interactive hyperlinks, pill badges, active markers, and accent underlines. The background remains pure black (`#000000`) in dark mode and warm off-white (`#faf8f5`) in light mode.
4. **Unified Motion Language:** One consistent, understated scroll-entry motion system across the entire site. No chaotic or mismatched animations.

---

## 2. Color System & Visual Formatting

### Color Tokens

| Token                   | Dark Mode (Default) | Light Mode | Semantic Purpose                         |
| :---------------------- | :------------------ | :--------- | :--------------------------------------- |
| `--color-background`    | `#000000`           | `#faf8f5`  | Canvas & page background                 |
| `--color-surface`       | `#111111`           | `#ffffff`  | Elevated cards, panels, bento boxes      |
| `--color-surface-muted` | `#1a1a1a`           | `#e5ded6`  | Pill badges, hover states, code blocks   |
| `--color-foreground`    | `#ffffff`           | `#212529`  | Primary headings, titles, active text    |
| `--color-muted`         | `#b4b4b4`           | `#4b4b4b`  | Body prose, secondary descriptions       |
| `--color-accent`        | `#ff8c42`           | `#ff8c42`  | Hyperlinks, active states, brand accents |
| `--color-accent-hover`  | `#ffa366`           | `#e67a30`  | Hover state for accent elements          |
| `--color-border`        | `#262626`           | `#d4cdc4`  | Section dividers, card outlines          |
| `--color-placeholder`   | `#666666`           | `#9ca3af`  | Form placeholders, subtle timestamps     |

### Visual Formatting Rules

- **Dividers:** Use `1px solid var(--color-border)` horizontal separator lines above and below major sections and between list items.
- **Hyperlinks:** Text links use `--color-accent` (`#ff8c42`) with solid underlines styled with `text-underline-offset: 4px` and `text-decoration-thickness: 1.5px`.
- **Card Surfaces:** Dark surface (`#111111`) with subtle border (`1px solid #262626`), `rounded-md` (8px) or `rounded-lg` (12px). Avoid heavy drop shadows in dark mode.
- **Badges & Pill Tags:** Compact padding (`px-2.5 py-1`), `rounded-xs` (4px) or `rounded-sm` (6px), dark muted background (`#1a1a1a` / `#262626`), muted text or accent highlight.

---

## 3. Typography & Hierarchy

### Font Families

- **Primary Sans:** `Geist Variable`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Monospace:** `Geist Mono`, `ui-monospace`, `'Cascadia Code'`, `monospace` (used for code blocks, ASCII/matrix art, technical badges, dates)

### Typographic Scale

| Level                  | Size                         | Weight          | Tracking  | Usage Examples                                              |
| :--------------------- | :--------------------------- | :-------------- | :-------- | :---------------------------------------------------------- |
| **Display Watermark**  | `clamp(3.5rem, 9vw, 6.5rem)` | 800 (ExtraBold) | `-0.03em` | Hero bottom name watermark, Footer name watermark           |
| **Hero Title / H1**    | `56px` (`text-3xl`)          | 700 (Bold)      | `-0.02em` | Main section titles ("NOW A SOFTWARE ENGINEER", "WRITINGS") |
| **Page Title**         | `36px` (`text-xl`)           | 700 (Bold)      | `-0.02em` | Page headers ("Blogs", "My Timeline")                       |
| **Section Label / H2** | `28px` (`text-lg`)           | 600 (SemiBold)  | `-0.01em` | Left-column section labels ("Who am I?", "Featured Blogs")  |
| **Subheading / H3**    | `20px` (`text-md`)           | 600 (SemiBold)  | `0`       | Subsection titles, Hero tagline                             |
| **Body Text**          | `16px` (`text-sm`)           | 400 (Regular)   | `0`       | Article prose, paragraphs (`line-height: 1.5` to `1.75`)    |
| **Metadata / Badges**  | `14px` (`text-xs`)           | 400 / 500       | `0`       | Timestamps, author tags (`by a Developer`), TOC items       |

---

## 4. Layout & Spacing Principles

### Container Dimensions

- **Max Container Width:** `1200px` centered (`mx-auto`).
- **Horizontal Viewport Padding:** `16px` (`--space-3`) on mobile; `64px` (`--space-7`) on desktop (`lg:`).
- **Prose Content Max-Width:** `720px` (`--container-content`) for readability.

### Structural Rhythm

1. **Full-Width Divider System:** Sections begin and end with clean full-width horizontal divider lines.
2. **Split-Column Layout (2-Column Grid):**
   - **Desktop (`md:` / `lg:`):** Left column (`w-1/4` or `col-span-3`) displays the section title or year; Right column (`w-3/4` or `col-span-9`) holds the content stream.
   - **Mobile:** Stacks vertically with the section label positioned above the content stream.
3. **Spacing Rhythm:**
   - Section vertical spacing: `64px` (`py-ds-7`) to `96px` (`py-ds-8`).
   - Grouping gaps: `24px` (`gap-ds-4`) to `32px` (`gap-ds-5`).
   - Component internal padding: `16px` (`p-ds-3`) to `24px` (`p-ds-4`).

---

## 5. Section & Component Patterns

### 1. Navigation Header

- **Layout:** Fixed or sticky top bar with subtle background blur (`backdrop-blur-md bg-background/80`).
- **Left:** Brand logo/text `ZANE.C` / `ANUJ.Y` (bold sans-serif, uppercase, tracking tight).
- **Right:** Nav links (`Works ^`, `Writings ^`, `About`) + Theme toggle icon button.
- **Interactions:** Subtle hover color transition (`text-foreground` $\to$ `text-accent`).

### 2. Homepage Hero Section

- **Tagline (Top Left):** 2-line concise philosophical statement (`text-md font-medium text-foreground`).
- **Hero Watermark (Bottom):** Giant uppercase name typography (`text-4xl font-extrabold tracking-tight`) stretching across the lower hero boundary.

### 3. About Section (Homepage & Dedicated About Page)

- **Framing:** Enclosed between top and bottom horizontal rules.
- **Structure:** Left column has section heading ("Who am I?" or "About Zane"). Right column contains lead narrative with orange underlined key phrases (`Architect`, `Software Engineer`, `Bloomberg`) followed by contextual sub-blocks.

### 4. Works / Projects Showcase

- **Header:** Large uppercase heading ("NOW A SOFTWARE ENGINEER").
- **Bento Card Pair:**
  - **Left Card:** Monospace ASCII/terminal status matrix displaying system verbs (`thinking..`, `brewing..`, `dreaming..`, `architecting..`) with monospace dots and alignment.
  - **Right Card:** Interactive or animated visual feature card (e.g. creature evolution states, "Build Your Own Openclaw" retro-styled title).

### 5. Interactive Blog List (Homepage & Blogs Page)

- **Row Anatomy:**
  - Separated by `1px solid var(--color-border)` horizontal divider lines.
  - **Left:** Article Title (`font-semibold text-foreground hover:text-accent transition-colors`) + Category/Author suffix (e.g. `by a Developer` in italic muted text).
  - **Right:** Right-aligned publication date (`text-xs text-muted font-mono`).
- **Hover / Expand State:**
  - Hovering a blog row smoothly expands vertical space to reveal:
    1. **Tag Badges:** Pill badges (`#agent`, `#ai`, `by a Developer`).
    2. **Snippet:** 1–2 line summary description in muted foreground.
- **Pagination:** Clean bottom controls (`< Prev`, boxed active page `[1]`, `2`, `Next >`).

### 6. Blog Detail Page (`/blog/[slug]`)

- **Hero Header:** Bento squircle mosaic tile backdrop with dark lighting and a single highlighted warm orange squircle.
- **Article Header:** Bold display title, excerpt paragraph, hashtag pills, and metadata row (`Created on [Date], Last Updated on [Date], By [Author]`).
- **Two-Column Reading Layout:**
  - **Left (Main Content, max-w-720px):**
    - Blockquotes with `border-l-4 border-accent pl-4 text-muted italic`.
    - Headings with clear vertical spacing and anchor IDs.
    - Inline orange links and styled code blocks (`bg-surface-muted border border-border p-4 rounded-md`).
  - **Right (Sticky TOC Sidebar):**
    - "On this page" box with rounded container.
    - Active TOC item highlighted with solid dark gray pill background (`bg-surface-muted text-foreground`).
    - Smooth scroll jump to sections on click.
- **Related Articles:** Bottom section listing related posts with standard row dividers.

### 7. Timeline Component (`/about`)

- **Structure:** Yearly milestone rows separated by horizontal divider rules.
- **Left:** Large Year label (`2026`, `2025`, `2024`, `2023`) in `text-xl font-bold text-foreground`.
- **Right:** Clean unordered list of bulleted achievements, milestones, and open-source contributions with orange underlined links.

### 8. Global Footer

- **Watermark:** Giant brand name text stretching across the footer width.
- **Divider:** Full-width separator line.
- **Bottom Row:**
  - **Left:** Copyright text (`© 2024-present [Name]. All Rights Reserved.`).
  - **Right:** Social links (`Email`, `Linkedin`, `Github`) styled with subtle underlines and hover transitions.

---

## 6. Animation & Motion Guidelines

### Unified Global Animation Rule

> **MANDATORY RULE:** Use one consistent global animation language throughout the project.  
> When content enters the viewport during scrolling, it MUST reveal by slowly and smoothly sliding upward from a slightly lower position (`translateY(16px)` $\to$ `translateY(0)`) into its final position, accompanied by an opacity transition (`opacity: 0` $\to$ `opacity: 1`).  
> Motion must be minimal, elegant, and consistent. Never introduce random, bouncing, 3D rotating, or disparate animation styles for different sections.

### Motion Specs

| Property              | Value                                       | Notes                                         |
| :-------------------- | :------------------------------------------ | :-------------------------------------------- |
| **Initial State**     | `opacity: 0`, `transform: translateY(16px)` | Clean starting state before entering viewport |
| **Final State**       | `opacity: 1`, `transform: translateY(0)`    | Snaps cleanly into place                      |
| **Duration**          | `600ms` (`--duration-slow`)                 | Smooth and deliberate                         |
| **Easing**            | `cubic-bezier(0.16, 1, 0.3, 1)`             | Premium ease-out deceleration                 |
| **Stagger Offset**    | `60ms` - `100ms` per item                   | Stagger children in list or grid rows         |
| **Hover Transitions** | `150ms` - `200ms` (`ease-out`)              | Snappy micro-interactions                     |

### Implementation Reference (CSS / Tailwind / IntersectionObserver)

```css
/* Scroll Reveal Utility Classes */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 600ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger Delays */
.reveal-delay-1 {
  transition-delay: 60ms;
}
.reveal-delay-2 {
  transition-delay: 120ms;
}
.reveal-delay-3 {
  transition-delay: 180ms;
}
.reveal-delay-4 {
  transition-delay: 240ms;
}
```

### Reduced Motion Requirement

```css
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## 7. Responsive Design Strategy

| Breakpoint                 | Width               | Layout Adjustments                                                                                                                        |
| :------------------------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile (`< 640px`)**     | Base                | Single column layouts; split sections stack vertically; hero display font scales dynamically via `clamp()`; horizontal scroll eliminated. |
| **Tablet (`md: 768px`)**   | $\ge 768\text{px}$  | 2-column split layouts activate (left label 30%, right content 70%); bento cards display side-by-side.                                    |
| **Desktop (`lg: 1024px`)** | $\ge 1024\text{px}$ | Sticky "On this page" TOC sidebar appears on blog detail; full `64px` side padding.                                                       |
| **Wide (`xl: 1280px`)**    | $\ge 1280\text{px}$ | Max container capped at `1200px` centered.                                                                                                |

---

## 8. Anti-Patterns & Prohibited Practices

```
NEVER: Introduce bright, saturated colors outside the defined --color-accent (#ff8c42) palette.
NEVER: Use jarring bouncy, springy, or 3D animations when revealing content on scroll.
NEVER: Hardcode inline raw hex values (e.g. #ff8c42 or #111) in components — use CSS variables or Tailwind tokens.
NEVER: Create floating cards without subtle borders in dark mode.
NEVER: Omit horizontal section divider lines between major page areas.
NEVER: Use more than 3 font weights on a single page view.
NEVER: Break the 2-column split rhythm for structured content sections.
NEVER: Ignore prefers-reduced-motion media query.
```

---

## 9. Implementation QA Checklist for Future AI / Agents

Before completing any UI change or new component, verify:

- [ ] **Color Contrast:** Normal text $\ge 4.5:1$, large text $\ge 3:1$ against background in both dark and light modes.
- [ ] **Divider Lines:** Sections are demarcated with `1px solid var(--color-border)` horizontal lines.
- [ ] **Typography Scale:** Correct Geist font sizes and weights are used with no arbitrary text styling.
- [ ] **Link Styling:** Interactive links have the warm orange accent color (`#ff8c42`) with proper underline offset.
- [ ] **Scroll Motion:** Content reveals upward smoothly with `translateY(16px)` $\to$ `translateY(0)` and opacity fade on viewport entry.
- [ ] **Expandable Rows:** Blog items expand smoothly to reveal tags and description on hover/focus.
- [ ] **Responsive Stacking:** Layout cleanly collapses to single column on mobile screens without horizontal overflow.
- [ ] **Reduced Motion:** With `prefers-reduced-motion: reduce`, animations are disabled and content is immediately visible.
