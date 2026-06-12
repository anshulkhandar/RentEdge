# RentEdge — India's Fintech-Powered Rental Network

> **Tagline:** Zero brokers. Full transparency. Rent premium homes, pay rent seamlessly via UPI, and build your credit profile with India's first Rent Score.

RentEdge is a premium **broker-free rental platform** targeting the Indian market. It integrates modern financial services — credit score reporting, security deposit loans, and automated HRA e-receipts — directly into the rental workflow. The platform supports two primary user roles: **Tenants** and **Landlords (Property Owners / Hostel Managers)**.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                 |
| :----------- | :------------------------------------------------------------------------- |
| **Framework** | Next.js 16 (App Router, Turbopack)                                        |
| **Language**  | TypeScript                                                                |
| **Styling**   | Tailwind CSS v4 + custom CSS design tokens in `globals.css`               |
| **Animations**| Framer Motion (page transitions, floating cards, modal entries, micro-interactions) |
| **Icons**     | Lucide React + React Icons (social icons via `react-icons/fa6`)           |
| **Font**      | Plus Jakarta Sans (Google Fonts, loaded via `next/font`)                  |
| **Theme**     | Light/Dark mode (toggled via `html.dark` class + React state sync)        |
| **State**     | React `useState` / `useEffect` + `localStorage` for session persistence  |
| **Backend**   | Supabase (configured in backend `.env` with URL and keys)                 |
| **Deployment**| Netlify (configured via `netlify.toml` with `@netlify/plugin-nextjs`)     |
| **Node**      | v20 (specified in Netlify build config)                                   |

---

## 📁 Complete File Structure

```
RentEdge/
│
├── README.md                          ← THIS FILE (project overview for handoff)
├── assets.MD                          ← Supabase credentials / notes
│
├── backend/
│   └── .env                           ← Backend env file (configured with Supabase URL & keys)
│
└── Frontend/                          ← Main Next.js 16 application
    ├── package.json                   ← Dependencies & scripts
    ├── package-lock.json              ← Lock file
    ├── next.config.ts                 ← Next.js config (currently default/empty)
    ├── tsconfig.json                  ← TypeScript config
    ├── tsconfig.tsbuildinfo           ← TS build cache
    ├── eslint.config.mjs              ← ESLint config
    ├── postcss.config.mjs             ← PostCSS config (Tailwind pipeline)
    ├── netlify.toml                   ← Netlify deployment config
    ├── next-env.d.ts                  ← Next.js type declarations
    ├── .gitignore                     ← Git ignore rules
    ├── AGENTS.md                      ← AI agent instructions (Next.js breaking changes warning)
    ├── README.md                      ← Original frontend-specific README
    │
    ├── public/                        ← Static assets served at root
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    │
    └── src/
        ├── app/                       ← Next.js App Router pages
        │   ├── layout.tsx             ← Root HTML shell (Plus Jakarta Sans font, metadata, viewport)
        │   ├── page.tsx               ← Main route controller (auth state, role routing, deep links)
        │   ├── globals.css            ← Master stylesheet (theme tokens, glassmorphism, dark mode, animations)
        │   ├── favicon.ico            ← Site favicon
        │   │
        │   └── property/
        │       └── [id]/
        │           └── page.tsx       ← Dynamic property detail route (/property/:id)
        │
        └── components/                ← All UI components (27 files)
            │
            │── ── NAVIGATION ──────────────────────────────────
            ├── Navbar.tsx                  ← Top navigation bar, "Check Rent Score" CTA, light/dark mode toggle
            ├── MobileNav.tsx               ← Sticky bottom mobile navigation bar
            │
            │── ── LANDING / PUBLIC ─────────────────────────────
            ├── Hero.tsx                    ← Hero section with search, floating CIBIL card & Live Node ticker
            ├── Features.tsx                ← Platform differentiators grid (Zero Brokerage, Smart Contracts, etc.)
            ├── PublicGrid.tsx              ← Property discovery grid with search/filter, image carousels, favorites
            ├── Pricing.tsx                 ← Subscription tier cards (Tenant: Basic/Pro/Elite, Landlord: Essential/Growth/Enterprise)
            ├── RentScoreSimulator.tsx       ← Interactive slider calculating credit score boost from rent payments
            ├── LeadCaptureContactBlock.tsx  ← Contact/lead capture form block
            ├── MagneticButton.tsx           ← Magnetic hover-effect button component
            ├── PageTransitionShell.tsx      ← Framer Motion page transition wrapper
            │
            │── ── AUTHENTICATION ───────────────────────────────
            ├── AuthModal.tsx               ← Login/signup modal overlay with role selection (Tenant/Owner)
            │
            │── ── LANDLORD FLOW ────────────────────────────────
            ├── LandlordOnboardingPipeline.tsx ← Step-by-step property listing wizard for owners (60KB — largest component)
            ├── LandlordOS.tsx              ← Landlord operating dashboard (rent collection metrics, nudges, access codes)
            ├── OwnerDashboard.tsx           ← Owner dashboard with analytics and management tools
            ├── ListingWizard.tsx            ← Property listing creation wizard
            ├── MyProperties.tsx            ← Owner's property portfolio management view
            ├── TenantManagement.tsx         ← Landlord's tenant management panel
            ├── FinancialManagement.tsx       ← Financial tracking and rent collection management
            │
            │── ── TENANT FLOW ──────────────────────────────────
            ├── TenantLifecycleController.tsx ← Tenant workflow router (rent payments, lease reviews, docs)
            ├── TenantShell.tsx              ← Tenant dashboard shell with navigation and content areas
            ├── MyDocuments.tsx              ← Document management for tenants (lease agreements, receipts)
            │
            │── ── PROPERTY VIEWS ───────────────────────────────
            ├── PropertyDetail.tsx           ← Inline property detail view component
            ├── PropertyDetailPage.tsx       ← Full-page property detail view (used by /property/[id] route)
            ├── Listings.tsx                 ← Property listings browser with advanced filtering (71KB)
            │
            │── ── SHARED / LAYOUT ──────────────────────────────
            ├── Layout.tsx                  ← Main application layout shell with sidebar (77KB — largest file)
            ├── ProfileSettings.tsx         ← User profile and settings panel
            │
            │── ── DATA ─────────────────────────────────────────
            └── propertiesData.ts           ← Mock property data and TypeScript type definitions
```

---

## 🏗️ Architecture Overview

### Routing & Page Structure

The app uses **Next.js 16 App Router** with two routes:

1. **`/` (Home)** — `src/app/page.tsx`
   - Acts as the **main controller** for the entire app
   - Manages authentication state, user role, and conditional rendering
   - **If NOT authenticated** → Shows public landing page (Hero → PublicGrid → Features → Pricing → Footer)
   - **If authenticated as Tenant** → Renders `TenantLifecycleController`
   - **If authenticated as Owner/Hostel** → Renders `LandlordOnboardingPipeline`

2. **`/property/[id]`** — Dynamic property detail page
   - Uses `PropertyDetailPage` component
   - Deep-linkable individual property views

### Auth Flow

```
User clicks "Login" → AuthModal opens → User selects role (Tenant/Owner)
→ Credentials stored in localStorage → UI re-renders based on role
→ Role-specific dashboard loads (Tenant Shell or Landlord Pipeline)
```

### State Management

All state is managed via **React hooks + localStorage** (no external state library). Key localStorage keys:

| Key                              | Purpose                                           |
| :------------------------------- | :------------------------------------------------ |
| `rentedge_authenticated`         | Boolean session flag                              |
| `rentedge_user_role`             | Active role: `'tenant'`, `'owner'`, or `'hostel'` |
| `rentedge_user_fullname`         | Authenticated user's display name                 |
| `rentedge_user_email`            | Authenticated user's email                        |
| `rentedge_properties`            | Landlord's registered properties array            |
| `rentedge_all_properties`        | Cached properties for public discovery            |
| `rentedge_access_codes_registry` | Active/pending lease codes (landlord-owned)        |
| `rentedge_access_codes`          | Access code verification map (tenant-side)        |
| `rentedge_lifecycle_state`       | Tenant's current lifecycle stage                  |
| `rentedge_selected_property_id`  | Currently selected property ID                    |

### Theming System

- **Light/Dark mode** controlled via `html.dark` CSS class
- Theme token CSS variables defined in `:root` and `html.dark` blocks in `globals.css`
- Global smooth transition (450ms) applied to all elements for premium theme switching
- Extensive dark mode CSS overrides for Tailwind utility classes (glassmorphism, card glows, ambient gradients)
- Colors: Brand Purple `#7C3AED`, Brand Mint `#10B981`, Primary `#0F172A`

---

## 📊 Current Project Status

### ✅ What's DONE (Frontend — Fully Built)

| Area                         | Status  | Notes                                                          |
| :--------------------------- | :-----: | :------------------------------------------------------------- |
| Landing Page (Hero, Features, Pricing) | ✅ Done | Premium design with floating widgets, glassmorphism, animations |
| Property Discovery Grid      | ✅ Done | Search, filter, image carousels, favorites                     |
| Property Detail Pages         | ✅ Done | Full detail view + dynamic route `/property/[id]`              |
| Auth Modal (Login/Signup)     | ✅ Done | Role-based auth (Tenant / Owner / Hostel)                      |
| Tenant Dashboard              | ✅ Done | Rent payments, lease reviews, document management              |
| Landlord Onboarding Pipeline  | ✅ Done | Step-by-step property listing wizard                           |
| Landlord Dashboard (LandlordOS) | ✅ Done | Metrics, rent collection tracking, access codes               |
| Owner Dashboard               | ✅ Done | Analytics, property management, tenant management              |
| Listings Browser               | ✅ Done | Advanced filtering and property browsing (71KB component)      |
| Dark Mode                      | ✅ Done | Full light/dark theme with premium glassmorphism               |
| Mobile Responsive              | ✅ Done | Mobile nav, safe-area padding, responsive grids                |
| Framer Motion Animations       | ✅ Done | Page transitions, floating cards, modal entries                |
| Rent Score Simulator           | ✅ Done | Interactive credit score calculator                            |
| Profile Settings               | ✅ Done | User profile management panel                                  |
| Netlify Deploy Config          | ✅ Done | `netlify.toml` configured with Next.js plugin                  |

### 🟡 What's IN PROGRESS / PARTIALLY DONE

| Area                          | Status       | Notes                                                      |
| :---------------------------- | :----------: | :--------------------------------------------------------- |
| Supabase Backend Integration   | 🟡 Planned   | Database password exists in `assets.MD`, but `.env` is empty and no backend code exists yet |
| Real Authentication            | 🟡 Mock Only | Auth is currently simulated — no real auth provider connected |
| Property Data                  | 🟡 Mock Only | All property data comes from `propertiesData.ts` (hardcoded) |
| Payment Integration            | 🟡 Not Started | No payment gateway (Razorpay/UPI) integration yet          |

### ❌ What's NOT YET BUILT

| Area                           | Status       | Notes                                                     |
| :----------------------------- | :----------: | :-------------------------------------------------------- |
| Backend API                     | ❌ Not Started | `backend/` folder exists but only contains empty `.env`   |
| Supabase Database Setup         | ❌ Not Started | No schema, tables, or migrations                          |
| Real User Authentication        | ❌ Not Started | Need Supabase Auth or similar provider                    |
| Real Property CRUD              | ❌ Not Started | Properties are mock data, no create/read/update/delete API |
| Payment Gateway (Razorpay/UPI)  | ❌ Not Started | Mentioned in UI but not integrated                        |
| Credit Score / CIBIL Integration | ❌ Not Started | UI shows it but it's simulated                           |
| Email Notifications             | ❌ Not Started | No email service configured                               |
| Image Upload / Storage          | ❌ Not Started | Property images are placeholder URLs                      |
| Search / Filtering API          | ❌ Not Started | Currently client-side filtering of mock data              |

---

## 🚀 Running Locally

```bash
# Navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

The app runs on `http://localhost:3000` by default.

---

## 📦 Dependencies

### Production
| Package          | Version   | Purpose                              |
| :--------------- | :-------- | :----------------------------------- |
| `next`           | `16.2.6`  | React framework (App Router)         |
| `react`          | `19.2.4`  | UI library                           |
| `react-dom`      | `19.2.4`  | React DOM renderer                   |
| `framer-motion`  | `^12.40.0`| Animation library                    |
| `lucide-react`   | `^1.17.0` | Icon library                         |
| `react-icons`    | `^5.6.0`  | Social media icons (FaGithub, etc.)  |

### Development
| Package                 | Version  | Purpose                    |
| :---------------------- | :------- | :------------------------- |
| `tailwindcss`           | `^4`     | Utility-first CSS          |
| `@tailwindcss/postcss`  | `^4`     | PostCSS plugin for Tailwind|
| `typescript`            | `^5`     | Type safety                |
| `eslint`                | `^9`     | Linting                    |
| `eslint-config-next`    | `16.2.6` | Next.js ESLint rules       |
| `@types/node`           | `^20`    | Node.js types              |
| `@types/react`          | `^19`    | React types                |
| `@types/react-dom`      | `^19`    | React DOM types            |

---

## 🔑 Key Component Sizes (Complexity Indicators)

These are the largest components, indicating where most of the logic lives:

| Component                        | Size   | What it does                                    |
| :------------------------------- | :----- | :---------------------------------------------- |
| `Layout.tsx`                     | 77 KB  | Main app layout shell with sidebar navigation   |
| `Listings.tsx`                   | 71 KB  | Property listings with advanced filtering       |
| `LandlordOnboardingPipeline.tsx` | 60 KB  | Multi-step property listing wizard              |
| `LandlordOS.tsx`                 | 48 KB  | Landlord operating dashboard                    |
| `OwnerDashboard.tsx`             | 43 KB  | Owner analytics & management                    |
| `MyProperties.tsx`               | 35 KB  | Property portfolio management                   |
| `PropertyDetailPage.tsx`         | 31 KB  | Full-page property detail view                  |
| `AuthModal.tsx`                  | 29 KB  | Authentication modal with role selection        |
| `TenantManagement.tsx`           | 25 KB  | Landlord's tenant management panel              |
| `TenantShell.tsx`                | 23 KB  | Tenant dashboard shell                          |

---

## 📝 Summary for Context

**RentEdge is a fully-built Next.js 16 frontend** with premium UI/UX (dark mode, glassmorphism, Framer Motion animations) that simulates a complete rental platform. It has extensive mock data and client-side state management. **The backend has environment variables configured** in `backend/.env` with Supabase project credentials. The next major phase would be:

1. Setting up Supabase Database (database schema, tables, auth, storage)
2. Connecting real API calls to replace mock data in `propertiesData.ts`
3. Implementing real authentication (replacing the mock `AuthModal`)
4. Adding payment integration (Razorpay/UPI)
5. Building out the backend API layer

The frontend is deployed via Netlify with the Next.js plugin.
"# RentEdge" 
