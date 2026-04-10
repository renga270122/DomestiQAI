# DomestiQ AI

DomestiQ AI is a mobile-first Next.js PWA for home cleaning routines. The current app includes a compact home screen, a task dashboard, basic reminders, and a first AI assistant chat screen.

Production domain: `https://domestiq.soulvest.ai`

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

For production deployment, use `https://domestiq.soulvest.ai` as the primary domain.

## Assistant backend setup

Create a local `.env.local` file based on `.env.example`.

OpenAI:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

GitHub Models:

```bash
LLM_PROVIDER=github-models
GITHUB_MODELS_TOKEN=your_github_models_token_here
GITHUB_MODELS_MODEL=openai/gpt-4.1-mini
```

Azure OpenAI:

```bash
LLM_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
```

The assistant screen calls the server route at `/api/assistant`, which forwards requests to the selected provider and streams the response back to the client.

## Current scope

- Mobile-first home screen at `/`
- Task dashboard at `/dashboard`
- AI assistant chat at `/assistant`
- Server-side LLM assistant route at `/api/assistant`
- Provider support for OpenAI, GitHub Models, and Azure OpenAI
- Streaming assistant responses with conversation titles
- Task-aware assistant context from the dashboard state
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

1. Add authentication and household profiles.
2. Replace local storage with a shared database.
3. Persist chat history server-side per household.
4. Add push reminders and calendar integration.