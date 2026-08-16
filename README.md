# NexusMarket

A modern, AI-powered e-commerce marketplace built with React, TypeScript and Vite — with a Gemini-powered shopping assistant and a full seller dashboard.

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)

## Features

- **AI Shopping Assistant** — a floating chat widget backed by the Gemini API that recommends products from the live catalog
- **Marketplace with search & filters** — search products and drill into categories via URL-driven filters
- **Shopping cart** — quantity controls, free-shipping progress bar and an order summary panel
- **Seller dashboard** — revenue / listing / order stats, an inventory table, and an AI-assisted product listing form
- **Persistent local data** — products and orders are stored in `localStorage` (no backend required)

## Tech Stack

| Area      | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 19, TypeScript, Vite 6                  |
| Styling   | Tailwind CSS (CDN) + custom design system      |
| Icons     | lucide-react                                  |
| AI        | Google Gemini (`@google/genai`)               |
| Routing   | react-router-dom v7 (HashRouter)              |

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies

   ```bash
   npm install
   ```

2. Set your Gemini API key in `.env.local`

   ```bash
   GEMINI_API_KEY=your-key-here
   ```

3. Run the dev server (http://localhost:3000)

   ```bash
   npm run dev
   ```

## Scripts

| Command            | Description                       |
|--------------------|-----------------------------------|
| `npm run dev`      | Start the Vite dev server         |
| `npm run build`    | Build the production bundle       |
| `npm run preview`  | Preview the production build      |
| `npm test`         | Type-check with `tsc --noEmit`    |

## Project Structure

```
.
├── App.tsx              # Main app: pages, components and layout
├── index.html           # HTML shell (Tailwind CDN, fonts, import map)
├── index.css            # Custom design system & animations
├── index.tsx            # React entry point
├── apiService.ts        # localStorage-backed product & order services
├── geminiService.ts     # Gemini AI wrapper
├── constants.tsx        # Seed products & categories
├── types.ts             # Shared TypeScript types
├── kubernetes/          # Kubernetes deployment manifests
└── .github/workflows/   # CI/CD pipelines
```

## Deploying

The repository includes Kubernetes manifests (`kubernetes/Nuxus-deployment.yaml`) and GitHub Actions workflows that run tests, security scans (Gitleaks, Trivy) and Docker image builds on every push to `main`.

## License

Private / for internal use. All rights reserved.
