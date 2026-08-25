# Tailwind CSS Guidelines

> How Tailwind CSS MUST be used in this project.
> Based on the design system in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and tokens in [DESIGN_TOKENS.md](DESIGN_TOKENS.md).

---

## 1. Tailwind Configuration

Tailwind MUST be configured to consume the CSS custom properties defined in [CSS_TOKENS.md](CSS_TOKENS.md). This creates a single source of truth: tokens are defined as CSS variables, Tailwind maps them into utility classes.

```typescript
// tailwind.config.ts (simplified example)
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: 'var(--color-accent-foreground)',
        },
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        input: {
          DEFAULT: 'var(--color-input)',
          border: 'var(--color-input-border)',
        },
        placeholder: 'var(--color-placeholder)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      spacing: {
        // Map design system spacing tokens
        'ds-1': 'var(--space-1)',
        'ds-2': 'var(--space-2)',
        'ds-3': 'var(--space-3)',
        'ds-4': 'var(--space-4)',
        'ds-5': 'var(--space-5)',
        'ds-6': 'var(--space-6)',
        'ds-7': 'var(--space-7)',
        'ds-8': 'var(--space-8)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        command: 'var(--z-command)',
      },
    },
  },
};
```

---

## 2. When to Use Utility Classes

### Use Tailwind utility classes for:

- **Layout:** `flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`
- **Typography:** `text-foreground`, `text-muted`, `font-semibold`, `text-sm`
- **Colors:** `bg-surface`, `text-accent`, `border-border`
- **States:** `hover:bg-surface-muted`, `focus-visible:ring-2`
- **Responsive:** `md:grid-cols-2`, `lg:grid-cols-3`
- **Spacing:** `p-ds-3`, `gap-ds-4`, `mt-ds-7`

### Create a reusable component instead when:

- The same combination of classes appears 3+ times across different files.
- The element has complex interactive behavior (animations, multi-state).
- The element represents a distinct UI concept (Button, Card, Badge, Input).
- The class string exceeds ~10 utilities.

---

## 3. Class Organization

Order Tailwind classes by concern:

```tsx
<div
  className={cn(
    // 1. Layout & positioning
    'flex items-center gap-ds-2',
    // 2. Sizing
    'w-full max-w-md',
    // 3. Spacing
    'p-ds-3',
    // 4. Visual (bg, border, shadow, radius)
    'bg-surface border border-border rounded-md',
    // 5. Typography
    'text-sm text-foreground',
    // 6. States & transitions
    'hover:border-accent transition-colors duration-instant',
    // 7. Conditional
    isActive && 'border-accent',
  )}
/>
```

Use the `cn()` utility (clsx + tailwind-merge) for conditional classes:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

---

## 4. Responsive Design

- MUST design mobile-first. Base classes target mobile; `md:`, `lg:`, `xl:` add desktop behavior.
- MUST NOT use `max-*:` responsive variants (desktop-first). Always mobile-first.
- Standard breakpoint pattern for card grids:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-4">
```

- Standard breakpoint pattern for section padding:

```tsx
<section className="px-ds-3 py-ds-7 lg:px-ds-7 lg:py-ds-8">
```

---

## 5. Dark Mode

- Dark mode is implemented via the `class` strategy (Tailwind `darkMode: 'class'`).
- Because the design system uses CSS custom properties that switch values based on the theme class, **most components do not need explicit `dark:` variants.**
- The token-based colors (e.g., `bg-surface`, `text-foreground`) automatically adapt when the theme class changes.
- Use explicit `dark:` prefixes **only** when a value does not have a CSS variable equivalent and genuinely differs between themes. This SHOULD be rare.

```tsx
// ✅ Correct — tokens handle both themes automatically
<div className="bg-surface text-foreground border-border">

// ❌ Avoid — unnecessary dark: prefix when tokens already handle it
<div className="bg-white dark:bg-neutral-900 text-black dark:text-white">
```

---

## 6. Arbitrary Values

- MUST NOT use arbitrary values (e.g., `p-[13px]`, `text-[#ff8c42]`) when a design token or Tailwind class exists.
- If an arbitrary value is truly needed (e.g., a one-off layout dimension), add a comment explaining why.
- If the same arbitrary value appears more than twice, it MUST be added to the Tailwind config as a named token.

---

## 7. Component Variant Patterns

For components with variants (size, color, state), use a variant utility like `cva` (class-variance-authority):

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-instant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        secondary: 'border border-accent text-accent hover:bg-accent hover:text-accent-foreground',
        ghost: 'text-foreground hover:bg-surface-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
```

---

## 8. Anti-Patterns

| Anti-Pattern                                                 | Correct Approach                                  |
| ------------------------------------------------------------ | ------------------------------------------------- |
| Using raw hex values: `text-[#ff8c42]`                       | Use token: `text-accent`                          |
| Inline styles: `style={{ padding: 16 }}`                     | Use classes: `p-ds-3`                             |
| Excessive class strings (15+ utilities)                      | Extract a component                               |
| Mixing design tokens with Tailwind defaults: `text-gray-500` | Use token: `text-muted`                           |
| Using `dark:` when CSS variables already handle it           | Remove unnecessary `dark:`                        |
| Hardcoded spacing: `mt-[37px]`                               | Use nearest token: `mt-ds-5`                      |
| Applying global styles via Tailwind `@apply` excessively     | Use CSS custom properties or component extraction |

---

## 9. `@apply` Usage

- SHOULD be used sparingly. Prefer component extraction over `@apply`.
- Acceptable uses: global typography defaults (prose styling), base element resets.
- MUST NOT use `@apply` to recreate entire component styles in CSS — that defeats the purpose of utility-first.

```css
/* ✅ Acceptable — global prose defaults */
.prose h2 {
  @apply text-lg font-semibold text-foreground mt-ds-6 mb-ds-3;
}

/* ❌ Avoid — full component in CSS */
.card {
  @apply flex flex-col gap-ds-2 p-ds-3 bg-surface border border-border rounded-md;
}
/* Create a <Card> component instead */
```

---

## Related Documents

- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) — Token definitions
- [CSS_TOKENS.md](CSS_TOKENS.md) — CSS custom property implementation
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Visual design guidelines
