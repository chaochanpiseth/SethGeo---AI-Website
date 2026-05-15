# SethGeo AI — Vercel Deployment Guide

**Developer:** Chao Chanpiseth

AI-powered OSINT image geolocation using 4-step visual reasoning.

---

## Quick Deploy to Vercel

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up environment variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

Get an API key at: https://platform.openai.com/api-keys

### Step 3 — Deploy

**Option A — Vercel CLI (recommended):**
```bash
npm install -g vercel
vercel deploy
```

When prompted:
- Set `OPENAI_API_KEY` as an environment variable in the Vercel dashboard
- Or run: `vercel env add OPENAI_API_KEY`

**Option B — Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import this folder as a new project
3. Add `OPENAI_API_KEY` in the Environment Variables section
4. Click Deploy

---

## Local Development
```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`

For local API testing, create `.env.local` with your `OPENAI_API_KEY`.

---

## Project Structure

```
├── api/
│   ├── geoanalyze.ts   — POST /api/geoanalyze (Vercel serverless function)
│   └── healthz.ts      — GET  /api/healthz
├── src/
│   ├── components/     — UI components
│   ├── hooks/          — useAnalyzeImage React Query hook
│   ├── lib/            — Utilities and types
│   └── pages/          — App pages
├── vercel.json         — Vercel routing config
└── vite.config.ts      — Vite build config
```

## Optional: Change Model

Add to your Vercel environment variables:
```
OPENAI_MODEL=gpt-4o
```
