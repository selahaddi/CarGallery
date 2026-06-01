---
name: Auralis Linear
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
  page-bg: '#F7F7F5'
  panel-bg: '#F3F2EF'
  card-bg: '#FCFCFB'
  border-subtle: '#E7E7E4'
  accent-emerald: '#10B981'
  accent-indigo: '#6366F1'
typography:
  h1:
    fontFamily: Geist
    fontSize: 84px
    fontWeight: '600'
    lineHeight: '1.05'
    letterSpacing: -0.04em
  h1-mobile:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  h2:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  h3:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 32px
  section-gap-desktop: 180px
  section-gap-mobile: 80px
  nav-height: 72px
---

## Brand & Style

Auralis Linear is a sophisticated, developer-centric design system that blends high-end technical precision with a soft, organic aesthetic. The brand personality is "Advanced Minimalism"—it feels professional and enterprise-grade, yet approachable through the use of soft tonal layering and ethereal color gradients.

The design style is a hybrid of **Modern Corporate** and **Soft Glassmorphism**. It relies on high-quality typography, significant whitespace, and "Atmospheric Depth" where the UI feels like a series of pristine, semi-transparent panels floating over subtle, blurred energy orbs. This evokes a sense of "AI intelligence" that is fluid and alive, rather than static and mechanical.

## Colors

The palette is rooted in a "Warm Industrial" spectrum. The background uses a slightly off-white, bone-colored neutral (`#F7F7F5`) to reduce eye strain compared to pure white, while interactive components use absolute black (`#000000`) for maximum authority and legibility.

- **Primary:** Deep black for high-contrast actions and primary text.
- **Secondary:** Medium grays for supporting text and non-essential icons.
- **Tonal Layers:** Three distinct surface levels are used to create hierarchy: Page (`#F7F7F5`), Panel (`#F3F2EF`), and Card (`#FCFCFB`).
- **Accent Gradients:** Used sparingly in background "orbs" to represent intelligence. These consist of soft pastels like Rose, Indigo, Emerald, and Sky Blue.

## Typography

The system exclusively utilizes **Geist**, a typeface designed for precision and clarity. The typographic hierarchy is aggressive, with large display headlines featuring tight tracking to create a "technical editorial" look.

For body copy, line heights are generous (1.5x - 1.6x) to ensure high readability. Labels use an uppercase styling with increased letter spacing to provide a distinct structural contrast against the fluid body text. Inter is reserved solely for utility-heavy navigation items where a more neutral, standard sans-serif is required.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for desktop, centered within a 1280px container. It utilizes a 12-column system where content typically spans 12, 6, or 4 columns.

- **Vertical Rhythm:** Sections are separated by massive "Section Gaps" (140px - 180px) to give the AI concepts room to breathe.
- **Margins:** Desktop uses 32px horizontal padding. On mobile, this scales down to 16px.
- **Navigation:** A fixed top-bar with a backdrop-blur effect ensures constant access to global actions without obscuring the canvas.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Surface Levels:** Lower surfaces are darker (`#F3F2EF`), and as an element "rises," it becomes lighter (`#FCFCFB` or `#FFFFFF`).
- **Outlines:** All containers use a 1px solid border (`#E7E7E4`). This "ghost border" technique defines edges without adding visual weight.
- **Glassmorphism:** Navigation and bottom utility bars use `backdrop-blur-md` with an 80% opacity fill to maintain a sense of context.
- **Active State Shadows:** Interactive elements like the central play button use a `shadow-lg` to indicate high-priority interactivity.

## Shapes

The shape language is primarily "Soft-Rectangular."

- **Standard Containers:** Cards and panels use `2xl` (1.5rem) or `3xl` (1.75rem) corner radii to feel friendly and modern.
- **Utility Elements:** Buttons, tags, and small input toggles use `full` (pill-shaped) rounding to distinguish them from structural content containers.
- **Iconography:** Icons are encased in `lg` (0.5rem) rounded squares with subtle borders.

## Components

- **Buttons:** Primary buttons are pill-shaped, black background with white text. Secondary buttons use a transparent background with a 1px outline. Use a `scale-98` transform on active clicks.
- **Tabs/Switchers:** Contained within a pill-shaped track with a `surface-container-low` background. The active tab is a white floating pill with a subtle shadow.
- **Cards:** Use `bg-card-auralis` with a 1px border. Hover states should trigger a subtle internal gradient or a soft shadow.
- **Input Fields:** Minimalist styling with 1px borders. Use Geist for placeholder text.
- **Status Indicators:** Use small, high-saturation emerald dots for "live" or "online" statuses, paired with `text-sm` font weights.
- **Backdrop Orbs:** Purely decorative, placed behind content panels with `blur-3xl` and low opacity (40-60%) to provide a sense of atmospheric depth.