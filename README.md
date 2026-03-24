<div align="center">
  <h1 align="center">Specify</h1>
  <p align="center">
    <strong>Your AI copilot for system design thinking.</strong>
  </p>
</div>

Specify is an intelligent, high-cognitive-load workspace designed to instantly architect and generate full technical specifications from raw product ideas. 

By unifying background context, functional requirements, execution methodology, and technical architecture (including frontend, backend, database, and DevOps), Specify provides a single accessible place for software planning.

## 🌟 Features

- **Instant Architecture Generation:** Type a project idea and watch an elite AI agent parse and curate optimal tech stacks with rigorous justification.
- **Architectural Timeline:** Track your generation progress natively with an animated, milestone-driven visual timeline.
- **Interactive Tech Stack:** Hover over recommended technologies in your architecture to view deep insights on *why* they were chosen for your specific domain.
- **Dynamic 3D Ocean Background:** Features a jaw-dropping, GPU-accelerated vertex wave visualization tailored to a premium SaaS aesthetic.
- **Real-Time Database:** Seamless user authentication and project state persistence via Supabase.

## 🚀 Getting Started

First, secure your API keys inside an `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠 Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS & Radix UI (Shadcn)
- **Database / Auth:** Supabase
- **Data Fetching:** Apollo GraphQL
- **3D Graphics:** Three.js (@react-three/fiber & @react-three/drei)
- **AI Inference:** Llama 3 on Groq
