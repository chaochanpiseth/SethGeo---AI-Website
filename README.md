# SethGeo AI — Vercel Deployment Guide

**Developer:** Chao Chanpiseth

AI-powered OSINT image geolocation using 4-step visual reasoning.
Powered by **Google Gemini** — FREE, no credit card required.

---

## Quick Deploy to Vercel

### Step 1 — Get a FREE Gemini API key (no billing, no credit card)

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

**Free tier limits:** 1,500 requests/day — more than enough for personal use.

### Step 2 — Deploy to Vercel

**Option A — Vercel Dashboard (easiest):**
1. Go to https://vercel.com/new
2. Upload or import this folder
3. In **Environment Variables**, add:
   - Name: `GEMINI_API_KEY`
   - Value: `your key from Step 1`
4. Click **Deploy**

**Option B — Vercel CLI:**
```bash
npm install -g vercel
vercel deploy
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY
npm run dev
```

App runs at `http://localhost:5173`

---

## Project Structure

```
├── api/
│   ├── geoanalyze.ts   — POST /api/geoanalyze (Vercel serverless, uses Gemini)
│   └── healthz.ts      — GET  /api/healthz
├── src/
│   ├── components/     — UI components
│   ├── hooks/          — useAnalyzeImage React Query hook
│   ├── lib/            — Utilities and types
│   └── pages/          — App pages
├── vercel.json         — Vercel routing config
└── vite.config.ts      — Vite build config
```

## Models Available (all free)

| Model | Speed | Quality |
|-------|-------|---------|
| `gemini-1.5-flash` | Fast | Great (default) |
| `gemini-1.5-flash-8b` | Fastest | Good |
| `gemini-2.0-flash` | Fast | Best |

Set `GEMINI_MODEL` env var to switch models.
