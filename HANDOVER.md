# Bayan: developer handover

This repo now has three parts:

| Folder | What it is | Status |
|---|---|---|
| `ui/` | `@bayan/ui`, the React + Tailwind v4 component library, with Storybook | Ready to use |
| `app/` | The Bayan web app in Next.js, built on `@bayan/ui` | Feature parity with the live site; runs on a mock backend |
| `index.html`, `img/` | The current live site (static) | Untouched; still what bayan2.vercel.app serves |

The live site keeps running as it is until you switch Vercel over to `app/` (see **Deploy**).

## Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:3000; builds ui/ and copies images first
npm test           # Playwright: flows, accessibility (axe), layout, Arabic, both screen sizes
```

For Storybook, run `cd ui && npm install && npm run storybook`.

Requirements: Node 20 or later.

## How the app is organised

```
app/src/
  app/                    routes (Next.js App Router)
  components/             screens' building blocks (chat, book, header, dock…)
  api/
    contract.ts           the backend contract: every type and call the app needs
    mock/                 in-browser backend (today's behaviour, ported from the live site)
    http.ts               real backend client, used when NEXT_PUBLIC_API_URL is set
  content/                books, categories, Explore, summaries (exported from the live site)
  i18n/                   Arabic dictionary and t()
  lib/prefs.tsx           language, theme, user, favourites, credits (React context)
```

| Route | Screen |
|---|---|
| `/` | Home: hero ask bar, category flow, Recommend picker, Popular reads, category slider, Duo card |
| `/books` | Library: language and category filters, search, grid and list views |
| `/explore` | Featured media, book clubs, more to explore |
| `/library` | My Library: conversations, character encounters, summaries (read and listen), favourites |
| `/favorites` | Saved books |
| `/profile` | Personal info, favourite topics, personalization, credits and top-up, password (`?tab=`) |
| `/signin` | Sign in and create account |
| `/chat` | Librarian chat. `?q=` asks a question; `?cat=` starts the guided category flow |
| `/book/[id]` | Book chat. Includes the book column, Universe, Read & Reflect, character and duo chats with setup, summaries, Listen, spoiler-free mode and feedback. `?q=`, `?talk=<characterId>`, `?conv=<id>` |
| `/duo` | Duo across two books (`?with=book:char,book:char`) |

**The rule for data:** components never read content files or storage directly for user data. They call `api` from `src/api`. That's how the mock can be swapped for the real backend without touching screens.

## Connecting the real backend

1. Implement the endpoints in [`app/docs/API.md`](app/docs/API.md). The source of truth is [`app/src/api/contract.ts`](app/src/api/contract.ts).
2. Set `NEXT_PUBLIC_API_URL=https://api.your-domain` in Vercel and in `.env.local`.

The real backend takes over five things the mock fakes today:

| Today, in the mock | In production |
|---|---|
| Chat replies come from rules ported from the live site (`api/mock/engine.ts`) | An AI service. It must keep the reply shape: `messages`, `suggestions`, `books`, `summary`, `ask` and `flow` |
| Account, favourites, conversations and credits live in `localStorage` | The database and a session cookie |
| Credit top-up is a demo form that charges nothing and stores no card | A payment gateway, credited by webhook |
| Listen reads the summary aloud with the browser's speech engine | `SummaryDTO.audioUrl` from text-to-speech, when available |
| A first visit sees demo library data (`lib/seed.ts`) | Remove `seedDemo` (it already does nothing when `NEXT_PUBLIC_API_URL` is set) |

## Languages

- The language and theme are saved under the same keys as the live site (`bayan-lang`, `bayan-theme`), so users keep their choice.
- Every UI string is written in English and translated with `t('English text')`. The Arabic comes from three files, merged in `i18n/dictionary.ts`:
  - `content/ar.json`: the live site's dictionary
  - `i18n/live-inline-ar.json`: Arabic written inline in the live code, harvested from it
  - `i18n/app-ar.json`: a handful of strings the React app added. Add new strings here.
- Book content (titles, characters, chat) is stored in both languages in `content/books.json`.
- Test: *"Arabic screens have no untranslated interface text"* fails if English slips into the Arabic UI.
- Rendering: pages render once the saved language is known on the client, so nothing appears in the wrong language. If you need server-rendered localized pages (SEO), store the language in a cookie and read it in `app/layout.tsx`.

## Theme and design

- `<html data-theme="dark|light" dir lang>` is set before first paint by a small script in `layout.tsx`.
- All colours are tokens in `ui/src/styles/theme.css` (`--by-*`). Surfaces come in six utilities: `glass`, `surface-card`, `surface-panel`, `surface-field`, `surface-bubble` and `surface-tab-on`.
- Change the look in the tokens, not in screens.

## Testing

```bash
npm test                          # builds, starts on :3100, runs desktop + phone projects
PW_CHROMIUM=/path/to/chrome npm test   # use an existing Chromium instead of Playwright's download
LIVE_URL=https://bayan2.vercel.app APP_URL=http://localhost:3000 npm run compare
                                  # side-by-side screenshots: live vs React, EN/AR × dark/light × desktop/phone
```

The suite currently has 65 passing and 7 skipped. The skips are tests that only apply to one screen size. It covers:
- Every route, in English and Arabic: no console errors and no serious or critical axe violations.
- No sideways overflow on phones.
- Language and theme switching, including persistence.
- Book chat: Q&A, recommendations, summary saved to the library, spoiler-free mode, character and duo chats, and the phone Characters sheet.
- The librarian's category flow, the home ask bar, duo across two books, and sign in, favourites and credits top-up.

## Deploy

The cleanest switch is a **second Vercel project** pointed at this repo:
- Root Directory: `app`
- Framework: Next.js
- Defaults for everything else. `npm run build` builds `ui/` and copies `img/` itself.

Check it on its preview URL. When you're happy, move the bayan2 domain to the new project.

The current project (static, root `.`) keeps serving the old site until then. After the switch, add a `.vercelignore` there (or delete `index.html`) so `ui/` and `app/` source aren't served publicly.

## Deliberate choices to know about

- **Matching the live site.** Behaviour copies the live site, including some details you may want to revisit:
  - The dock keeps left-to-right order in Arabic.
  - Real historical people are described by Bayan, never voiced.
  - Duo topics alternate between two lines per topic.
- **Universe.** It appears only for books that have places or a timeline in the content.
- **Google sign-in.** The button is in place, but it needs the real backend (OAuth).
- **Next.js prompt file.** `app/AGENTS.md` was generated by Next.js for AI coding tools. Keep it or delete it; nothing depends on it.
