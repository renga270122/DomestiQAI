# DomestiQ AI

DomestiQ AI is a mobile-first Next.js PWA for home cleaning routines. The current app includes a compact home screen, a task dashboard, basic reminders, and a first AI assistant chat screen.

## Stack

- Next.js 16 with App Router
- TypeScript
- React 19
- Custom CSS with mobile-first layout
- Progressive Web App support with manifest and service worker

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current scope

- Mobile-first home screen at `/`
- Task dashboard at `/dashboard`
- AI assistant chat at `/assistant`
- Persistent task management stored in local browser storage
- Basic reminder management with on/off toggles
- PWA manifest, install metadata, and service worker registration
- Production-ready build and lint scripts

## PWA notes

- Manifest is generated from `src/app/manifest.ts`
- Service worker is served from `public/sw.js`
- App icons are stored in `public/icons`
- Installability is available when the app is served over localhost or HTTPS

## Natural next steps

1. Connect the assistant screen to a real LLM backend.
2. Add authentication and household profiles.
3. Replace local storage with a shared database.
4. Add push reminders and calendar integration.