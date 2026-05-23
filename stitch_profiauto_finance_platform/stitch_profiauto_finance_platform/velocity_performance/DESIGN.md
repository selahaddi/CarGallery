---
name: Velocity Performance
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#e5bdbe'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#ac8889'
  outline-variant: '#5c3f40'
  surface-tint: '#ffb3b6'
  primary: '#ffb3b6'
  on-primary: '#68001a'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#be0037'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#b4c5ff'
  on-tertiary: '#002a78'
  tertiary-container: '#2f6af2'
  on-tertiary-container: '#fdfaff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
  background-deep: '#000000'
  surface-zinc: '#18181B'
  accent-red-bright: '#F43F5E'
  text-muted: '#94A3B8'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
  component-padding: 1.5rem
---

## Brand & Style

The design system is engineered for the high-stakes world of B2B vehicle leasing, combining German industrial precision with a high-impact, aggressive aesthetic. It targets corporate fleet managers and automotive professionals who value speed, efficiency, and clarity in financial decision-making.

The visual style is **High-Contrast Glassmorphism**. It utilizes a deep, dark foundation (Zinc and Black) to create a premium "night mode" environment, punctuated by "Aggressive Red" highlights that draw immediate attention to calls to action and critical financial data. The interface feels like a high-end automotive cockpit—technical, authoritative, and fast. Large, unapologetic typography ensures that monthly rates and down payments are the undisputed heroes of the layout.

## Colors

The palette is strictly dark-centric to reduce eye strain during intensive data analysis and to elevate the premium feel of the vehicle assets.

- **Primary (Red-600):** Used exclusively for high-priority actions and brand highlights. It signifies urgency and performance.
- **Secondary (Slate-400):** Reserved for supporting text and non-critical UI elements to maintain a clear hierarchy.
- **Neutral (Zinc-900):** The primary container color, providing a subtle lift from the absolute black background.
- **Background-Deep:** Pure black is used for the canvas to maximize the contrast of the glassmorphic cards and red accents.

## Typography

This design system employs a dual-font strategy to balance impact with legibility.

- **Headlines (Sora):** Selected for its geometric structure and modern tech feel. The "Display Hero" and "Headline LG" roles are designed for "Instagram Story" style impact—massive, bold, and tightly tracked—to make financial figures like "€499 / Month" impossible to miss.
- **Body & Labels (Inter):** A systematic sans-serif used for complex leasing data, tables, and fine print. It ensures high readability even at small sizes in dense B2B dashboards.
- **Hierarchy:** Use all-caps for labels to create a "technical spec" appearance common in automotive manuals.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** with a generous 24px gutter to accommodate complex data tables and multi-step leasing applications. 

- **Desktop:** Emphasize wide horizontal sections with significant vertical gaps (80px+) between content blocks to create a sense of scale and luxury.
- **Data Density:** In leasing calculators, reduce component padding to 1rem to allow for more granular control inputs without scrolling.
- **Mobile:** Reflow 12-column layouts into a single-column stack. Increase the "Display Hero" font-weight but scale size to 32px to maintain punch without breaking the viewport.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Tonal Layering** rather than traditional shadows.

1.  **The Base:** Absolute black (`#000000`).
2.  **The Surface:** Zinc-900 with a 1px border of Slate-400 at 10% opacity.
3.  **The Float:** Use `backdrop-blur-md` on cards with a semi-transparent Zinc-900 background (alpha 0.7). This creates a "frosted glass" effect that allows the underlying colors or images to bleed through subtly.
4.  **The Focus:** Elements that require interaction should have a secondary inner glow or a 1px border of Primary Red to indicate "active" status.

## Shapes

The shape language reflects the aerodynamic curves of modern vehicles. 

- **Containers:** Large cards use a 1rem (`rounded-lg`) radius to soften the aggressive high-contrast colors.
- **Interactive Elements:** Buttons and input fields use a 0.5rem (`rounded`) radius, providing a balanced, professional appearance that isn't too circular nor too sharp.
- **Selection Indicators:** Use "Pill-shaped" (3) styling for active tags or status chips (e.g., "In Stock", "Immediate Delivery") to contrast against the rectangular grid.

## Components

- **Buttons:** Primary buttons are solid Red-600 with white text. Hover states should transition to Red-500 with a subtle glow (outer shadow) to simulate LED lighting.
- **Glass Cards:** Must feature `backdrop-blur-md`, a 1px border (`Slate-400` at 0.1 alpha), and a Zinc-900 background at 0.7 opacity. Headers within cards should use the primary red for icons.
- **Input Fields:** Dark Zinc backgrounds with a 1px Slate border. On focus, the border must transition to Primary Red.
- **Financial Figures:** Use the "Display Hero" typography role. If the figure is a monthly rate, the currency symbol and period (e.g., /Mo) should be 50% the size of the main figure, baseline aligned.
- **Data Lists:** Alternating row highlights using Zinc-800 to maintain readability in long fleet lists.
- **Progress Steppers:** Use thick (4px) horizontal lines. Completed steps are Primary Red; upcoming steps are Slate-400.