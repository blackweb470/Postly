# Postly AI — Enterprise Marketing Command Center

Postly is an end-to-end, generative AI marketing dashboard designed specifically for e-commerce managers and solopreneurs. It aims to solve the digital marketing pipeline problem: condensing the repetitive tasks of analyzing a product image, calculating a price tier, writing platform-specific copy, and setting up distributions down to an $O(1)$ workflow.

## What it does

Postly AI provides a full-stack command center. At its core, the application features an advanced **5-step generative pipeline**:

1. **Upload & Polish**: Drop a raw product image. 
2. **AI Vision Analysis**: The backend proxy securely uses advanced vision models to inspect the image, extracting key attributes, materials, and estimating a target demographic and localized pricing tier.
3. **Multi-Channel Generation**: It dynamically arrays perfectly structured marketing copy tailored for the constraints and psychological audiences of Facebook, X (Twitter), Instagram, LinkedIn, and TikTok in parallel.
4. **Humanize**: A refinement step allows users to inject specific tones (urgent, professional, casual) overriding standard AI templates.
5. **Distribution**: Finally, users can share the image and copy directly via their Native OS share sheets or save it to their enterprise dashboard.

Beyond this, Postly features a **Premium Enterprise Dashboard** where users can track their generated assets, view performance, and seamlessly manage historical campaigns via a secure, authenticated Supabase library.

## The Architecture & Tech Stack

We architected Postly using a modern, highly secure client-server full-stack model (MERN-style, but using Supabase for scalable persistence):

### 1. Frontend Engine (The Presentation Layer)
*   **React 18 & Vite**: Extremely fast modern interactive routing.
*   **Tailwind CSS**: Powering the high-end Enterprise Dashboard. Extensive use of deep contrasts, glassmorphism, fluid micro-animations, and dynamic SVGs.
*   **Canvas API (HTML5)**: Our mathematical solution for intercepting and manipulating pixels across standard cross-origin browser constraints.

### 2. Backend Engine (The Secure Proxy Server)
*   **Node.js & Express.js**: Our API proxy layer bridging requests while locking down the browser and securely isolating execution keys.
*   **Production Hardened**: Uses `helmet` for Security headers and `express-rate-limit` for DDoS payload protection. Uses `express.static` to directly orchestrate the compiled Vite application.

### 3. Database, Storage, & Auth (The Persistence System)
*   **Supabase PostgreSQL**: Enforcing strict `row-level-security` (RLS) on all user actions.
*   **Supabase Auth**: Managing strict JWT-based authenticated sessions to establish user permissions inside the dashboard.
*   **Supabase Storage**: AWS S3-style bucket storing the extracted user image snapshots.

### 4. Intelligence Engine (The AI Layer)
*   **OpenAI API (GPT-4 Vision & GPT-4o)**: Utilizing strict prompt engineering and system directives to securely extract data directly from matrices without hallucinations.

## Setup Instructions

### Environment Setup
You will need an active [Supabase project](https://supabase.com/) and an active [OpenAI developer key](https://platform.openai.com/).

Create a `.env` file inside the `/server` directory with the following keys:
```env
# /server/.env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173 
```

### Installation

1. Navigate to the frontend workspace:
```bash
npm install
```

2. Navigate to the backend server and initialize:
```bash
cd server
npm install
```

### Local Development
From the root directory, leverage the concurrent runner:
```bash
npm run dev:all
```
Your backend will run on `:3001` providing the AI proxy, and your frontend will be available at your standard Vite port (e.g., `:5173`).

### Production Deployment
The application has been explicitly engineered for rapid Node deployment (e.g., Render, Railway, Heroku). 

Building:
```bash
npm run build
```
Running essentially builds the static `dist/` and runs the backend to securely serve those files over the network without proxy issues:
```bash
npm start
```
