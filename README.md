# 💸 Expense Autopilot

> **Log expenses in plain English via Telegram. View analytics on a React dashboard.**
> Built as a portfolio project — migrated from a self-hosted MERN + n8n stack to a fully managed Supabase architecture.

---

## 🚀 Live

| Service | URL |
|---------|-----|
| 🌐 **Dashboard** | [expense-autopilot.vercel.app](https://expense-autopilot.vercel.app) |
| ⚙️ **Telegram Bot** | Message the bot to log expenses |

---

## 🧠 The Problem

Manually opening a finance app to log every expense kills the habit. Most people give up within a week.

**Expense Autopilot solves this** — send a message like `spent 150 on food` and it's parsed by AI, categorised, and visible on your dashboard instantly.

---

## ✨ Features

- 📲 **Telegram Bot** — log expenses in plain English, no app switching
- 🤖 **AI Categorisation** — Groq (llama-3.1-8b-instant) classifies each expense into a category
- 🔐 **Supabase Auth** — email/password sign-in with session management
- 🛡️ **Row Level Security** — every query is scoped to the signed-in user at the database layer
- 📊 **React Dashboard** — pie charts, bar charts, trend lines via Recharts
- 🔗 **link_code flow** — secure one-time code to connect Telegram to your account

---

## 🏗️ Architecture

```
User (Telegram message)
        │
        ▼
Supabase Edge Function  (Deno, plain JavaScript)
   ├── /connect <code>  →  validate link_code  →  store chat_id in profiles
   └── expense message  →  parseExpense()
                         →  categorize() via Groq API
                         →  find-or-create category
                         →  INSERT into expenses
                         →  reply to Telegram

React Dashboard  (Vercel)
   ├── supabase.auth.signInWithPassword()
   ├── supabase.from('expenses').select()      ← RLS: auth.uid() = user_id
   ├── supabase.from('expense_category_summary')  ← Postgres view with SUM/GROUP BY
   └── Settings page  →  generate link_code  →  copy /connect command
```

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 19 + Vite | Deployed on Vercel |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/vite` plugin |
| **Charts** | Recharts | Pie, bar, line charts |
| **Auth** | Supabase Auth | Email/password, session tokens |
| **Database** | Supabase Postgres | Row Level Security on all tables |
| **API client** | @supabase/supabase-js | No Express layer between frontend and DB |
| **Automation** | Supabase Edge Function | Deno runtime, plain JavaScript |
| **AI** | Groq API — llama-3.1-8b-instant | Called via `fetch()` inside Edge Function |
| **Secrets** | `supabase secrets set` | Never committed to git |
| **Deployment** | Vercel + Supabase | No self-hosted infrastructure |

---

## 🔄 Why I Migrated (Interview Notes)

The original stack used **Node.js + Express** on Render, **n8n** (self-hosted on Render) for Telegram automation, and **custom JWT auth** with bcryptjs.

| Old Stack | Problem | New Stack |
|-----------|---------|-----------|
| Express REST API | Extra server to maintain, deploy, and keep alive | Supabase RLS + Edge Function |
| Custom JWT / bcryptjs | Reinventing auth; no session refresh, no OAuth path | Supabase Auth |
| n8n self-hosted | Vendor lock-in, workflow state not in version control | Supabase Edge Function (JS in git) |
| Express middleware auth | Easy to bypass by forgetting a middleware call | RLS at the DB layer — impossible to bypass |
| Render (always-on) | Free tier spins down; needed a keep-alive pinger | Supabase serverless — no spin-up delay |

**One-line answer:** "I moved everything into Supabase so there's one deploy target, auth and authorization are handled at the platform and database layers respectively, and the automation is plain JavaScript in version control instead of a self-hosted GUI tool."

---

## ⚙️ Running Locally

### Prerequisites

- Node.js ≥ 18
- Supabase account (free tier works)
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Groq API key from [console.groq.com](https://console.groq.com)

### 1 — Clone the repo

```bash
git clone https://github.com/Thangeda-Shashider/expense-autopilot.git
cd expense-autopilot
```

### 2 — Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (copy from `.env.local.example`):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

```bash
npm run dev
# Dashboard at http://localhost:5173
```

### 3 — Supabase setup

1. Run migrations in order via **Supabase Dashboard → SQL Editor**:
   - `supabase/migrations/001_enable_rls_policies.sql`
   - `supabase/migrations/002_add_link_code_to_profiles.sql`
   - `supabase/migrations/003_expense_summary_view.sql`

2. Set Edge Function secrets:
   ```bash
   supabase secrets set GROQ_API_KEY=<your-groq-key>
   supabase secrets set TELEGRAM_BOT_TOKEN=<your-bot-token>
   ```

3. Deploy the Edge Function:
   ```bash
   supabase functions deploy telegram-webhook --project-ref <your-project-ref>
   ```

4. Register the Telegram webhook:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook
   ```

---

## 📂 Project Structure

```
expense-autopilot/
├── frontend/                        # React + Vite dashboard
│   └── src/
│       ├── lib/supabase.js          # Shared Supabase client
│       └── pages/
│           ├── Login.jsx            # Supabase Auth sign-in/sign-up
│           ├── Dashboard.jsx        # Charts + recent expenses
│           ├── Expenses.jsx         # Full expense list + add/delete
│           ├── Categories.jsx       # Category management
│           └── Settings.jsx         # Connect Telegram via link_code
├── supabase/
│   ├── functions/
│   │   └── telegram-webhook/
│   │       └── index.js             # Edge Function (Deno, plain JS)
│   └── migrations/                  # SQL migrations — run in order
├── expense-autopilot-api/           # OLD Express API (decommissioned, kept for reference)
├── n8n-workflows/                   # OLD n8n automation JSONs (inactive, kept for reference)
└── README.md
```

---

## 🤝 Connect

Built by **Thangeda Shashidhar** — feel free to reach out or explore the live demo!
