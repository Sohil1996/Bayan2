# @bayan/ui

Bayan's design system as React components styled with Tailwind CSS v4, documented in Storybook.
Values are measured from the live app ([bayan2.vercel.app](https://bayan2.vercel.app)), so the components match production.

## Quick start

```bash
cd ui
npm install
npm run dev              # Storybook on http://localhost:6006
```

| Script | What it does |
|---|---|
| `npm run dev` | Storybook with hot reload |
| `npm run build` | Library: `dist/index.js`, `dist/styles.css`, type declarations |
| `npm run build-storybook` | Static Storybook in `storybook-static/` (deploy anywhere) |
| `npm run typecheck` | TypeScript, no emit |

Stack: React 18+ (developed on 19), TypeScript, Tailwind CSS 4, Vite, Storybook 10, lucide-react icons.

## Using it in an app

```tsx
import '@bayan/ui/fonts.css';   // Inter, Cairo, Cormorant Garamond (skip if you self-host)
import '@bayan/ui/styles.css';  // tokens + every class the components use
import { AssistantMessage, BookCard, Composer } from '@bayan/ui';
```

Set theme and direction on `<html>`; components read nothing else:

```html
<html data-theme="dark" dir="ltr" lang="en">
<html data-theme="light" dir="rtl" lang="ar">
```

Apps already on Tailwind v4 can share the tokens instead:

```css
@import 'tailwindcss';
@import '@bayan/ui/theme.css';
@source '../node_modules/@bayan/ui/dist';
```

That gives you `bg-bg`, `text-fg-muted`, `text-gold-ink`, `glass`, `surface-card`, `surface-panel`, `rounded-card`, `h-control`, the `light:` variant and the rest.

## Structure

```
ui/
├─ src/
│  ├─ styles/theme.css     tokens (CSS variables, dark + light) and Tailwind theme/utilities
│  ├─ styles/index.css     library stylesheet entry
│  ├─ styles/fonts.css     self-hosted fonts
│  ├─ components/*.tsx     components, with *.stories.tsx next to them
│  ├─ stories/             Introduction, Foundations (tokens), Patterns (full screens), sample data
│  └─ index.ts             public exports
├─ .storybook/             config: Theme, Language and Backdrop toolbars
└─ public/                 sample covers, portraits, backgrounds for stories
```

## Components

| Group | Components |
|---|---|
| Primitives | `Button`, `IconButton`, `Spinner`, `Chip`, `SuggestionChip`, `Tag` |
| Forms | `TextField`, `SearchBar`, `Composer`, `Checkbox`, `Switch`, `SegmentedControl` |
| Navigation | `Dock`, `AppHeader` |
| Content | `Card`, `ListItem`, `Tabs`, `BookCover`, `BookCard`, `BookList`, `FavoriteButton`, `SectionHeader`, `Divider`, `Wordmark`, `BayanGlyph`, `Avatar`, `AvatarPair`, `Timeline`, `CreditMeter` |
| Chat | `AssistantMessage`, `UserMessage`, `MessageActions`, `TypingIndicator`, `SuggestionRow` |
| Feedback | `Dialog`, `Toast` |

Storybook's **Patterns** section rebuilds Home, Book chat, General chat, Duo column and Sign in from these components only.

## Rules

1. **RTL with logical properties only** (`ms-` `pe-` `start-` `end-` `text-start`). Arrows and chevrons mirror (`rtl:-scale-x-100`); logos and play/pause never do.
2. **Mixed-language text**: `dir="auto"` + `[unicode-bidi:plaintext]` + `text-left rtl:text-right`, so an Arabic title in the English UI lines up with its neighbours.
3. **No hard-coded copy**: every visible or accessible label is a prop. Pass the current language's string.
4. **44px touch targets** (`h-control`); icon-only buttons require `aria-label`.
5. **Book cards and media go in `AssistantMessage` `attachments`**, never inside the text bubble.
6. **Gold text on the page uses `text-gold-ink`** (AA contrast in both themes); `gold` is for fills and icons.
7. **Same word for the same thing**: My Library / مكتبتي, Duo conversation / حوار ثنائي, Add to favorites / أضف إلى المفضلة.

## Quality checks done

- Every story checked in 4 combinations (dark/light × English/Arabic) with axe-core against WCAG 2.2 AA: 0 violations.
- No runtime or console errors in any story.
- Typecheck clean; library and Storybook build.

## Not included yet (next steps for the team)

- Data fetching, routing and state: components are presentational; wire them to your API.
- Canela is a commercial font. If you hold a licence, add its `@font-face`; otherwise Cormorant Garamond is used.
- Remaining app-specific pieces to build on top: book fan picker, listen player, explore map, payment form.
