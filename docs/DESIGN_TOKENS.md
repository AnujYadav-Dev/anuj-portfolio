# Design Tokens

> Semantic token definitions for the portfolio design system.
> These tokens are implemented as CSS custom properties in [CSS_TOKENS.md](CSS_TOKENS.md) and consumed via Tailwind in [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md).

---

## 1. Colors

### Semantic Color Tokens

| Token | Purpose |
|---|---|
| `--color-background` | Page-level background |
| `--color-surface` | Elevated surfaces: cards, panels, modals |
| `--color-surface-muted` | Subtle backgrounds: hover fills, secondary panels, code blocks |
| `--color-foreground` | Primary text |
| `--color-muted` | Secondary/tertiary text: descriptions, captions, metadata |
| `--color-accent` | Brand color: links, primary buttons, active indicators |
| `--color-accent-hover` | Accent hover state (slightly lighter/darker) |
| `--color-accent-foreground` | Text on accent backgrounds |
| `--color-border` | Borders, dividers, separators |
| `--color-ring` | Focus rings |
| `--color-destructive` | Error states, destructive action buttons |
| `--color-destructive-foreground` | Text on destructive backgrounds |
| `--color-success` | Success states, confirmations |
| `--color-success-foreground` | Text on success backgrounds |
| `--color-warning` | Warning states |
| `--color-warning-foreground` | Text on warning backgrounds |
| `--color-input` | Form input backgrounds |
| `--color-input-border` | Form input borders |
| `--color-placeholder` | Input placeholder text |

### Dark Theme Values

| Token | Value |
|---|---|
| `--color-background` | `#000000` |
| `--color-surface` | `#111111` |
| `--color-surface-muted` | `#1a1a1a` |
| `--color-foreground` | `#ffffff` |
| `--color-muted` | `#b4b4b4` |
| `--color-accent` | `#ff8c42` |
| `--color-accent-hover` | `#ffa366` |
| `--color-accent-foreground` | `#000000` |
| `--color-border` | `#262626` |
| `--color-ring` | `#ff8c42` |
| `--color-destructive` | `#ef4444` |
| `--color-destructive-foreground` | `#ffffff` |
| `--color-success` | `#22c55e` |
| `--color-success-foreground` | `#000000` |
| `--color-warning` | `#eab308` |
| `--color-warning-foreground` | `#000000` |
| `--color-input` | `#111111` |
| `--color-input-border` | `#262626` |
| `--color-placeholder` | `#666666` |

### Light Theme Values

| Token | Value |
|---|---|
| `--color-background` | `#faf8f5` |
| `--color-surface` | `#ffffff` |
| `--color-surface-muted` | `#e5ded6` |
| `--color-foreground` | `#212529` |
| `--color-muted` | `#4b4b4b` |
| `--color-accent` | `#ff8c42` |
| `--color-accent-hover` | `#e67a30` |
| `--color-accent-foreground` | `#ffffff` |
| `--color-border` | `#d4cdc4` |
| `--color-ring` | `#ff8c42` |
| `--color-destructive` | `#dc2626` |
| `--color-destructive-foreground` | `#ffffff` |
| `--color-success` | `#16a34a` |
| `--color-success-foreground` | `#ffffff` |
| `--color-warning` | `#ca8a04` |
| `--color-warning-foreground` | `#ffffff` |
| `--color-input` | `#ffffff` |
| `--color-input-border` | `#d4cdc4` |
| `--color-placeholder` | `#9ca3af` |

> [!NOTE]
> `--color-accent` (`#ff8c42`) is the same in both themes. `--color-accent-hover` shifts lighter in dark mode and darker in light mode to maintain contrast direction.

---

## 2. Typography

### Font Family

| Token | Value |
|---|---|
| `--font-sans` | `'Geist Variable', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'Geist Mono', ui-monospace, 'Cascadia Code', monospace` |

### Font Size

| Token | Value | Rem |
|---|---|---|
| `--text-xs` | 14px | 0.875rem |
| `--text-sm` | 16px | 1rem |
| `--text-md` | 20px | 1.25rem |
| `--text-lg` | 28px | 1.75rem |
| `--text-xl` | 36px | 2.25rem |
| `--text-2xl` | 44px | 2.75rem |
| `--text-3xl` | 56px | 3.5rem |
| `--text-4xl` | 72px | 4.5rem |

### Font Weight

| Token | Value | Usage |
|---|---|---|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasized text, labels |
| `--font-semibold` | 600 | Subheadings, card titles |
| `--font-bold` | 700 | Headings, strong emphasis |

### Line Height

| Token | Value | Usage |
|---|---|---|
| `--leading-tight` | 1.2 | Headings, display text |
| `--leading-normal` | 1.5 | Body text (base: 24px at 16px) |
| `--leading-relaxed` | 1.75 | Long-form reading |

### Letter Spacing

| Token | Value | Usage |
|---|---|---|
| `--tracking-tight` | -0.02em | Large display text |
| `--tracking-normal` | 0 | Body text |
| `--tracking-wide` | 0.05em | Uppercase labels, caps |

---

## 3. Spacing

| Token | Value |
|---|---|
| `--space-0` | 0px |
| `--space-1` | 8px |
| `--space-2` | 12px |
| `--space-3` | 16px |
| `--space-4` | 24px |
| `--space-5` | 32px |
| `--space-6` | 48px |
| `--space-7` | 64px |
| `--space-8` | 96px |

---

## 4. Border Radius

| Token | Value |
|---|---|
| `--radius-xs` | 4px |
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-full` | 9999px |

---

## 5. Shadows

| Token | Dark Value | Light Value |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | `0 4px 6px rgba(0,0,0,0.07)` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | `0 10px 15px rgba(0,0,0,0.1)` |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.5)` | `0 20px 25px rgba(0,0,0,0.1)` |

---

## 6. Breakpoints

| Token | Value |
|---|---|
| `--breakpoint-sm` | 640px |
| `--breakpoint-md` | 768px |
| `--breakpoint-lg` | 1024px |
| `--breakpoint-xl` | 1280px |
| `--breakpoint-2xl` | 1536px |

---

## 7. Z-Index

| Token | Value | Usage |
|---|---|---|
| `--z-dropdown` | 10 | Dropdowns, popovers |
| `--z-sticky` | 20 | Sticky header |
| `--z-overlay` | 30 | Backdrop overlays |
| `--z-modal` | 40 | Modals, dialogs |
| `--z-toast` | 50 | Toast notifications |
| `--z-command` | 60 | Command palette |

---

## 8. Motion

| Token | Value | Usage |
|---|---|---|
| `--duration-instant` | 150ms | State changes (hover, focus, active) |
| `--duration-fast` | 300ms | Transitions, micro-interactions |
| `--duration-normal` | 500ms | Content reveals, page transitions |
| `--duration-slow` | 700ms | Staggered animations, complex reveals |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy micro-interactions |

---

## 9. Container

| Token | Value |
|---|---|
| `--container-max` | 1200px |
| `--container-content` | 720px |
| `--container-padding-mobile` | 16px |
| `--container-padding-desktop` | 64px |

---

## Token Usage Rules

1. MUST use semantic tokens (e.g., `var(--color-foreground)`) in all component styles.
2. MUST NOT use raw hex/rgb values directly in component code.
3. If a needed token does not exist, propose adding it to this file before using a one-off value.
4. Tokens are consumed via Tailwind's `theme.extend` configuration (see [TAILWIND_GUIDELINES.md](TAILWIND_GUIDELINES.md)) and CSS custom properties (see [CSS_TOKENS.md](CSS_TOKENS.md)).
