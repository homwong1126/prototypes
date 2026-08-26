---
version: alpha
name: Aurora Ops Design System
description: "A calm operational UI system for high-density service management tools. It combines a soft graphite canvas, cool cyan primary accent, clear semantic status colors, and compact 8px geometry so tables, drawers, forms, and workflow states stay readable under heavy information load. The system feels precise, resilient, and quietly modern rather than decorative."

colors:
  primary: "#2f7cf6"
  on-primary: "#ffffff"
  primary-hover: "#4b90ff"
  primary-focus: "#1f6ae6"
  ink: "#e8edf6"
  ink-muted: "#b7c2d6"
  ink-subtle: "#7f8aa3"
  ink-tertiary: "#5e6780"
  canvas: "#0b1020"
  surface-1: "#11182b"
  surface-2: "#16203a"
  surface-3: "#1c2744"
  surface-4: "#223055"
  hairline: "#28324a"
  hairline-strong: "#38445f"
  hairline-tertiary: "#4b5875"
  inverse-canvas: "#f7f9fd"
  inverse-surface-1: "#eef3fb"
  inverse-surface-2: "#e3ebf7"
  inverse-ink: "#0b1020"
  brand-secure: "#5d6f99"
  semantic-success: "#1fb878"
  semantic-warning: "#e0a82e"
  semantic-danger: "#e15858"
  semantic-info: "#4ca3ff"
  semantic-overlay: "#000000"

typography:
  display-xl:
    fontFamily: Aurora Display
    fontSize: 72px
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: -2.2px
  display-lg:
    fontFamily: Aurora Display
    fontSize: 52px
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: -1.4px
  display-md:
    fontFamily: Aurora Display
    fontSize: 38px
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: -0.8px
  headline:
    fontFamily: Aurora Display
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.4px
  card-title:
    fontFamily: Aurora Display
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.2px
  subhead:
    fontFamily: Aurora Text
    fontSize: 18px
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: -0.1px
  body-lg:
    fontFamily: Aurora Text
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.05px
  body:
    fontFamily: Aurora Text
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: Aurora Text
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: Aurora Text
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: Aurora Text
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  eyebrow:
    fontFamily: Aurora Text
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.6px
  mono:
    fontFamily: Aurora Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 40px
  section: 88px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  button-danger:
    backgroundColor: "{colors.semantic-danger}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 14px
  card-default:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-elevated:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  table-shell:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 0
  form-field:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  form-field-focused:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  status-badge:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  tab-pill-default:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 14px
  tab-pill-selected:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 14px
  info-banner:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 16px
  side-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    padding: 16px
---

## Overview

Aurora Ops is a design system for dense service-management and operations dashboards. It is built for workflows with many rows, many states, and many forms. The feeling should be controlled and modern, with enough contrast to support long reading sessions and rapid action scanning.

The system uses a graphite-blue canvas, layered cool surfaces, and a single confident blue primary. Status colors are reserved for operational meaning, not decoration. Rounded corners stay restrained at 8px for controls and 12–16px for cards, so the UI remains crisp and enterprise-like.

## Design Intent

- Make dense tables readable without making them feel heavy.
- Keep workflows fast: primary actions should always be obvious.
- Separate information by surface and spacing, not by visual noise.
- Use status colors only when they carry a state or risk meaning.
- Prefer compact controls, short labels, and stable layouts.

## Color System

### Core
- Canvas: `#0b1020`
- Surface 1: `#11182b`
- Surface 2: `#16203a`
- Surface 3: `#1c2744`
- Surface 4: `#223055`
- Hairline: `#28324a`
- Hairline Strong: `#38445f`
- Hairline Tertiary: `#4b5875`

### Text
- Ink: `#e8edf6`
- Ink Muted: `#b7c2d6`
- Ink Subtle: `#7f8aa3`
- Ink Tertiary: `#5e6780`

### Brand & Status
- Primary: `#2f7cf6`
- Primary Hover: `#4b90ff`
- Primary Focus: `#1f6ae6`
- Success: `#1fb878`
- Warning: `#e0a82e`
- Danger: `#e15858`
- Info: `#4ca3ff`

## Typography

Aurora uses a geometric, operational sans with clear hierarchy and low ornament.

- Display styles are for page titles and empty states.
- Body styles prioritize legibility at 15–17px.
- Buttons are semibold and compact.
- Mono is reserved for IDs, timestamps, logs, and code-like values.

Fallback stack:
- `Aurora Display`: `Inter, SF Pro Display, system-ui, sans-serif`
- `Aurora Text`: `Inter, SF Pro Text, system-ui, sans-serif`
- `Aurora Mono`: `ui-monospace, SFMono-Regular, Menlo, monospace`

## Layout & Spacing

- Base spacing unit: 4px.
- Use 16px and 24px as the dominant gaps in forms and content cards.
- Use 40px–88px for section separation depending on page density.
- Keep list controls compact to preserve vertical space.

## Radius

- Controls: 8px
- Cards: 12px
- Panels: 16px
- Pills: 9999px

## Component Rules

### Buttons
- Primary buttons use the blue primary fill.
- Secondary buttons sit on elevated surfaces.
- Tertiary buttons are transparent or text-like.
- Dangerous actions use red only when destruction or rejection is explicit.

### Cards
- Default cards use Surface 1 with a hairline border.
- Elevated cards use Surface 2 to indicate layered hierarchy.
- Do not add heavy shadows.

### Forms
- Inputs use Surface 2 with a consistent 8px radius.
- Focus should be obvious through color and border, not glow.
- Label text should remain short and precise.

### Tables
- Tables must remain dense but readable.
- Sticky headers and sticky action columns are encouraged.
- Filter chips and state badges should remain compact.

### Status Badges
- Use status badges for process state, approval state, and exception state.
- Do not use status colors for decorative emphasis.

## Do

- Use blue as the only dominant accent.
- Keep controls compact and consistent.
- Use layer and contrast to express hierarchy.
- Use mono for operational identifiers.
- Keep tables readable at high density.

## Don't

- Don't use gradients or decorative glows.
- Don't introduce extra brand accents.
- Don't over-round buttons or cards.
- Don't rely on shadows for depth.
- Don't make primary actions hard to distinguish.

## Recommended Use Cases

- Work order management
- Service dispatch boards
- Inventory and stock operations
- Field service scheduling
- Enterprise admin portals
- Dense record detail pages
