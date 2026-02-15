# Mini Foundry 5e Content Editor

Single-page editor for D&D 5e content in a mini-Foundry style.

## Features
- Project-based campaign workspace with collections: Actors, Items, Spells, Effects, Journal, Tables.
- Global search and section filters (PCs / Monsters).
- Template forms and modals (skills, resistances, senses).
- Foundry-compatible JSON import/export with round-trip-safe unknown field preservation.
- IndexedDB autosave and local version history.

## Development

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

## Quality checks

```bash
npm run check:bidi
npm run lint
npm run format:check
npm run build
```

## Build and preview

```bash
npm run build
npm run preview
```

## Deploy
Deploy the `dist/` folder to any static host (Vercel, Netlify, Nginx, etc.).

## Demo data
On first start, a `Demo Campaign` project is created with:
- 2 actors
- 5 items
- 5 spells
- 3 effects
- 1 journal entry
- 1 roll table

## Docs
- `docs/foundry-import-export.md`
- `docs/ui-json-mapping.md`
