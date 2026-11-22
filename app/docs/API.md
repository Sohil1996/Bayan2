# Bayan API

This is what the Bayan web app needs from a backend. The TypeScript source of truth is
[`src/api/contract.ts`](../src/api/contract.ts); this page describes the same thing for backend developers.

The app runs today without a backend: `src/api/mock/` implements every endpoint in the browser using
the bundled content, and reproduces the live site's chat behaviour. To switch to a real backend, set:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Conventions

- JSON in and out. Errors return a non-2xx status with a plain-text or `{ "message" }` body.
- `lang` is `en` or `ar`, the **interface** language. Every text field in a response comes back in
  that language (titles, blurbs, character names, chat replies).
- A book's own language (what it was written in) is the `lang` field on the book.
- Auth uses an HttpOnly session cookie set by `/auth/signin` or `/auth/signup`. Requests are sent with
  `credentials: include`, so allow credentials in CORS for the web origin.
- `GET /me` returns `401` when signed out. The app treats that as "guest".
- Image fields are URLs. The mock uses `/img/...` paths served by the app.

## Content

| Method | Path | Returns |
|---|---|---|
| GET | `/books?lang=&category=&q=&language=` | `BookSummary[]` |
| GET | `/books/:id?lang=` | `BookDetail` |
| GET | `/featured?lang=` | `BookSummary[]` in home-page order |
| GET | `/categories?lang=` | `CategoryDTO[]` |
| GET | `/books/:id/summary?lang=` | `SummaryDTO` |
| GET | `/explore?lang=` | `ExploreFeed` |

`BookDetail` adds:
- `characters`: `real: true` marks a historical person. They are described, never voiced.
- `places` and `timeline`: each lists the names of the characters involved, so the Universe view can filter by character.
- `prompts`: suggested first questions.
- `chat`: kicker, intro and chips for the book chat.
- `hasReader`: whether Read & Reflect passages exist.

`SummaryDTO.audioUrl` is optional. When it is null, the app reads the summary aloud with the browser's speech engine.

## Chat

### `POST /chat`

```jsonc
{
  "context": { "kind": "book", "bookId": "macbeth" },
  // or { "kind": "general" }
  // or { "kind": "character", "bookId": "macbeth", "characterId": "1" }
  // or { "kind": "duo", "a": { "bookId", "characterId" }, "b": { "bookId", "characterId" } }
  "message": "Who is Lady Macbeth?",
  "lang": "en",
  "spoilerFree": false,
  "setup": { "answers": ["…"], "length": 1 }, // character and duo chats: answers to the setup questions
  "flow": null,                                // category flow state, echoed back from the previous reply
  "conversationId": null                       // null starts a new conversation
}
```

Response, `ChatReply`:

```jsonc
{
  "conversationId": "c_123",
  "messages": [
    { "speaker": "bayan", "speakerName": "Bayan", "speakerImage": null, "text": "…" }
  ],
  // a duo reply has one message per character: speaker "macbeth:1" and so on
  "suggestions": [
    { "label": "Meet Lady Macbeth" },
    { "label": "Ask about White Nights", "action": { "openBook": "nights" } }
  ],
  "books": ["othello", "war"],                  // optional: recommendation cards under the reply
  "summary": { "bookId": "macbeth" },           // optional: a summary was made and saved to the library
  "ask": { "step": 1, "options": ["…"] },       // optional: guided question with fixed answers
  "flow": { "category": "fiction", "step": 1, "answers": [] },
  "card": { "image": "…", "title": "Lady Macbeth", "subtitle": "…", "action": "Talk to her", "characterId": "1" },
  "spoilerHidden": false,
  "credits": 119                                // balance after this message
}
```

The backend is expected to:
- **Charge one credit per message.** When the balance is 0, return `402`.
- **Honour `spoilerFree`.** Don't reveal plot outcomes; set `spoilerHidden: true` when an answer was held back.
- **Save summaries.** When the user asks for a summary (in English or Arabic), make one, add the book to `/me/summaries` and return `summary`.
- **Recommend only books from the catalogue,** by id, in `books`.
- **Stay in character in character and duo chats.** Keep each reply short when `setup.length` is 0, and never voice a real person (`real: true`).
- **Treat `flow` as opaque.** Return the next state, or `null` when the flow ends.

### `POST /chat/start-category`

Body: `{ "category": "fiction", "lang": "en" }`.

Returns the first guided question as a `ChatReply` with `ask` and `flow` set. The user then answers through `POST /chat` with that `flow`. After two questions the reply carries `books`.

### `POST /chat/feedback`

Body: `{ conversationId, messageIndex, value: "good" | "bad", reason?, note? }`. Returns `204`.

The reasons are: `inaccurate`, `unhelpful`, `spoiler`, `offensive`, `other`.

## Account

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/signup` | `{ name, email, password }` | `User` and a session cookie |
| POST | `/auth/signin` | `{ email, password }` | `User` and a session cookie |
| POST | `/auth/signout` | | `204` |
| GET | `/me` | | `User`, or `401` |
| PATCH | `/me` | `Partial<User>` | `User` |
| POST | `/me/password` | `{ current, next }` | `204` |

## Library

| Method | Path | Notes |
|---|---|---|
| GET | `/me/favorites` | `string[]` of book ids |
| PUT / DELETE | `/me/favorites/:bookId` | Returns the new list |
| GET | `/me/conversations` | `ConversationListItem[]`, newest first |
| GET / PUT / DELETE | `/me/conversations/:id` | `Conversation` with its `thread` |
| GET | `/me/summaries` | Ids of books with saved summaries |
| DELETE | `/me/summaries/:bookId` | |
| GET / POST | `/me/encounters` | Character and duo chats the user has had |

When the user turns off `preferences.rememberConversations`, stop storing conversations.

## Credits

| Method | Path | Returns |
|---|---|---|
| GET | `/me/credits` | `Credits`: balance, used this month, history |
| GET | `/credits/plans` | `TopUpPlan[]`. Demo plans: 100 for 19 SAR, 250 for 39 SAR, 600 for 79 SAR |
| POST | `/me/credits/top-up` | Body: `TopUpPlan`. Returns `Credits` |

In production, `top-up` should go through the payment gateway (for example, return a checkout URL and
credit the account from the gateway's webhook). The current demo top-up is instant and stores no card data.
