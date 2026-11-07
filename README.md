<div align="center">

# LovePixels — Community Network & Interactive Web Platform

**The official web platform and live Discord bridge for LovePixels — an interactive digital space for community events, gaming, and creative creators**

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=flat-square&logo=greensock)](https://greensock.com/gsap/)
[![Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=flat-square&logo=discord)](https://discord.gg/lovepixel)

[**Join the Community on Discord →**](https://discord.gg/lovepixel)

</div>

---

## 🌸 Overview

**LovePixels** is an interactive community hub engineered for creators, gamers, and digital artists. Designed with an emphasis on soft atmospheric aesthetics and tactile micro-interactions, the platform connects **15,400+ members** with live community events, verified reward payouts, voice salons, and Discord gateway synchronization.

The platform couples a high-performance **React 19 + Vite** client with an asynchronous **Express 5** backend bridge that streams Discord server telemetry directly to web clients.

---

## 📊 Community Milestones

- **15,400+** Registered Discord Community Members
- **2,080+** Average Daily Active Users
- **50+** Verified Community Tournaments & Events Hosted
- **₹2,00,000+** Total Cash Prizes & Rewards Distributed
- **100%** Verified Payout Track Record

---

## ✨ Feature Suite

### 1. Cinematic Atmosphere Engine
- **Canvas Shader Atmospheres**: Soft GLSL atmospheric backgrounds (`SoftShaderAtmosphere.tsx`, `CelestialAuroraSkyCanvas.tsx`).
- **Procedural Particle Systems**: Physics-based floating petals and interactive blossom cursors (`FallingPetalsCanvas.tsx`, `BlossomCursor.tsx`).
- **Smooth Inertial Scrolling**: Decoupled Lenis smooth-scroll orchestration with hardware-accelerated transforms.

### 2. Live Discord Gateway Bridge
- **Real-Time Voice Salons**: Synchronized voice channel occupancy and member streaming (`LiveVoiceSalons.tsx`).
- **Active Member Feed**: Live dynamic presence indicators reflecting connected users (`OnlineMembersStrip.tsx`).
- **Discord OAuth2 Portal**: Secure user identity verification with guild role inspection (`useDiscordAuth.ts`).

### 3. Events & Tournament Hub
- Dynamic schedule matrix tracking upcoming community nights, game tournaments, and creative showcases.
- Detailed rules, countdown tickers (`NumberTicker.tsx`), and automated registration prompts.

### 4. Transparent Rewards & Payout Ledger
- Public, auditable record of community rewards, tournament prize distributions, and recipient receipts.
- Live distribution metrics with verified payout ratios.

### 5. Administrative Dashboard
- Role-gated administration portal (`AdminInbox.tsx`, `Management.tsx`) for managing community submissions, partner applications, and direct user support.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19.2, TypeScript 6.0, Vite 8.3 |
| **Animation & Motion** | GSAP 3.15, Lenis Smooth Scroll |
| **Design System** | Tailwind CSS v4, Lucide React, Custom CSS Shaders |
| **Routing** | React Router 7 |
| **Backend & Bridge** | Express 5, Node.js, `tsx` TypeScript Execution Engine |
| **Discord Integration** | Discord REST API v10, OAuth2, Webhooks |
| **Linting & Hygiene** | Oxlint 1.81 |

---

## 📂 Project Architecture

```
lovepixel/
├── public/                 # Static branding, high-res assets, audio
├── scripts/                # Build and asset generation helpers
├── server/                 # Express backend API & Discord bridge
│   ├── index.ts            # API router & middleware entry point
│   ├── routes/             # Authentication, Discord telemetry, support
│   └── services/           # Guild caching & bot webhook handlers
├── src/
│   ├── animations/         # GSAP context providers & scroll triggers
│   ├── components/
│   │   ├── cinematic/      # Shader canvases & particle systems
│   │   ├── community/      # Server showcases & activity highlights
│   │   ├── discord/        # Discord voice salons & online strips
│   │   ├── entrance/       # Heavenly blossom introduction screen
│   │   ├── management/     # Caretaker team & leadership cards
│   │   ├── navigation/     # DreamCloud identity & interactive navbar
│   │   └── ui/             # Liquid glass buttons, tickers, spotlight cards
│   ├── config/             # Guild ID & Discord endpoint declarations
│   ├── data/               # Community statistics, events & payout ledgers
│   ├── hooks/              # Discord authentication & data hooks
│   └── pages/              # Home, Community, Events, Gallery, Payouts, Admin
├── .env.example            # Environment configuration template
├── package.json            # Node dependencies & scripts
├── vite.config.ts          # Vite bundler & Tailwind v4 plugin config
└── tsconfig.json           # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `20.x` or higher
- npm or pnpm
- (Optional) Discord Application credentials for OAuth2 & Bot features

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Velvettt-67/lovepixel.Mc.git

# 2. Navigate to project root
cd lovepixel.Mc

# 3. Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Configure your Discord Application credentials:
- `DISCORD_CLIENT_ID`: Your Discord application ID
- `DISCORD_CLIENT_SECRET`: OAuth2 client secret
- `DISCORD_BOT_TOKEN`: Bot token for telemetry access
- `DISCORD_GUILD_ID`: `1498650220215664781`

### Running the Application

```bash
# Start frontend client (Vite on http://localhost:5173)
npm run dev

# Start backend Discord bridge server (Express on http://localhost:3001)
npm run server

# Build production bundle
npm run build
```

---

## 🌐 Community Links

- Discord: [discord.gg/lovepixel](https://discord.gg/lovepixel)
- Instagram: [@lovepixel.community](https://instagram.com/lovepixel.community)
- Contact: `care@lovepixels.gg`

---

## 👤 Author

**Rohit Kanwal (Velvet)**
- Portfolio: [velvet-portfolio.vercel.app](https://velvet-portfolio.vercel.app/)
- GitHub: [@Velvettt-67](https://github.com/Velvettt-67)
- LinkedIn: [Rohit Kanwal](https://www.linkedin.com/in/rohit-kanwal-003a75431/)
- X: [@nyx_velvet67](https://x.com/nyx_velvet67)
