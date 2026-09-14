# 💸 Expense Autopilot

> **Log expenses in plain English via Telegram. View analytics on a React dashboard.**  
> Built as a portfolio project — migrated from a self-hosted n8n + Express stack to a fully managed Supabase architecture.

---

## 🚀 Live

| Service | URL |
|---------|-----|
| 🌐 **Frontend Dashboard** | [expense-autopilot.vercel.app](https://expense-autopilot.vercel.app) |
| ⚙️ **Telegram Webhook** | Supabase Edge Function (always-on, serverless) |

---

## 🧠 The Problem

Manually opening a finance app to log every expense kills the habit. Most people give up within a week.

**Expense Autopilot solves this** — just send `spent 150 on food` to the Telegram bot and it's logged, AI-categorised, and visible on your dashboard instantly.

---

## ✨ Features

- 📲 **Telegram Bot** — log expenses in plain English, no app switching
- 🤖 **AI Categorisation** — Groq (LLaMA 3.1) auto-detects the category from your message
- 🔐 **Supabase Auth** — email/password login, JWT sessions managed by Supabase
- 🛡️ **Row Level Security** — Postgres RLS policies ensure each user only sees their own data
- 📊 **React Dashboard** — interactive spending charts with Recharts
- 🔗 **Telegram Linking** — connect your bot account with a one-time code from the Settings page
- 📈 **Category Summary View** — Postgres view with `SECURITY INVOKER` enforcing RLS at query time

---

## 🏗️ Architecture (Current)

```
You (Telegram)
      ↓
Telegram Bot API
      ↓
Supabase Edge Function  (Deno, serverless)
      ├─ parse message  (plain JS parser)
      ├─ categorise     (Groq API → LLaMA 3.1)
      └─ write expense  (Supabase service-role client, bypasses RLS for bot writes)
            ↓
      PostgreSQL (Supabase)
      ├─ profiles        (linked telegram_chat_id, link_code)
      ├─ expenses        (RLS: auth.uid() = user_id)
      ├─ categories      (RLS: auth.uid() = user_id)
      └─ budgets         (RLS: auth.uid() = user_id)
            ↓
React Dashboard (Vercel)
      └─ supabase-js client → direct DB queries, no backend needed
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Bot Interface** | Telegram Bot API | User-facing message interface |
| **Serverless Backend** | Supabase Edge Functions (Deno) | Webhook handler — parses, categorises, saves |
| **AI** | Groq API (LLaMA 3.1 8B Instant) | Zero-latency expense categorisation |
| **Database** | Supabase PostgreSQL | Persistent storage with RLS |
| **Auth** | Supabase Auth | Email/password, JWT, session management |
| **Frontend** | React + Vite + Recharts | Analytics dashboard |
| **Deployment** | Vercel (frontend) + Supabase (backend) | Fully managed, no servers to maintain |

---

## 🔄 Migration: Why I Moved Away from n8n + Express

| | Old Stack | New Stack |
|--|-----------|-----------|
| **Bot logic** | n8n workflow (GUI nodes) | Supabase Edge Function (code) |
| **Storage** | Google Sheets + PostgreSQL | PostgreSQL only (via Supabase) |
| **Auth** | Custom JWT + Express middleware | Supabase Auth (built-in) |
| **Security** | Manual JWT validation | RLS policies in Postgres |
| **Hosting** | Render (Express) + Render (n8n) | Supabase + Vercel |
| **Cost** | ~$14/month (2× Render services) | Free tier (Supabase + Vercel) |
| **Cold starts** | ~30s (Render free tier) | <200ms (Edge Functions) |

**One-line interview answer:** *"I replaced a fragile no-code + Express setup with Supabase Edge Functions and RLS — eliminating two paid Render services, removing a JWT layer, and cutting cold-start latency from 30 seconds to under 200ms."*

---

## ✅ Project Status

- [x] Supabase Auth (email/password) live
- [x] RLS policies on all tables (profiles, expenses, categories, budgets)
- [x] Telegram Edge Function deployed and webhook registered
- [x] Groq AI categorisation working
- [x] Telegram account linking via one-time code
- [x] React dashboard migrated to `supabase-js` (no Express dependency)
- [x] `expense_category_summary` Postgres view with `SECURITY INVOKER`
- [x] Frontend deployed on Vercel
- [x] Render Express API — pending suspension
- [x] Render n8n instance — pending suspension

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

### 2 — Frontend (React Dashboard)

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (copy from `.env.local.example`):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
# Dashboard starts on http://localhost:5173
```

### 3 — Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in order via **SQL Editor**:
   - `supabase/migrations/001_enable_rls_policies.sql`
   - `supabase/migrations/002_add_link_code_to_profiles.sql`
   - `supabase/migrations/003_expense_summary_view.sql`
   - `supabase/migrations/004_fix_view_security_invoker.sql`

### 4 — Deploy Edge Function

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set GROQ_API_KEY=<your-key>
supabase secrets set TELEGRAM_BOT_TOKEN=<your-token>
supabase functions deploy telegram-webhook --no-verify-jwt
```

### 5 — Register Telegram Webhook

Open in your browser (replace with your values):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project-ref>.supabase.co/functions/v1/telegram-webhook
```

You'll see `{"ok":true,"result":true,"description":"Webhook was set"}` — done!

### 6 — Test it

Message your bot: `spent 150 on food` 🎉

---

## 📂 Project Structure

```
expense-autopilot/
├── frontend/                          # React dashboard (Vite + supabase-js)
│   ├── src/
│   │   ├── lib/supabase.js            # Supabase client singleton
│   │   └── pages/
│   │       ├── Dashboard.jsx          # Spending charts
│   │       └── Settings.jsx          # Telegram linking UI
│   └── .env.local.example
├── supabase/
│   ├── functions/
│   │   └── telegram-webhook/
│   │       └── index.ts              # Edge Function (plain JS, Deno runtime)
│   ├── migrations/
│   │   ├── 001_enable_rls_policies.sql
│   │   ├── 002_add_link_code_to_profiles.sql
│   │   ├── 003_expense_summary_view.sql
│   │   └── 004_fix_view_security_invoker.sql
│   └── .env.example
├── n8n-workflows/                     # ⚠️ DECOMMISSIONED — kept as reference
│   └── MyExpenseBot.json             # Old n8n workflow export (inactive)
├── expense-autopilot-api/            # ⚠️ DECOMMISSIONED — old Express API
└── README.md
```

---

## 🤝 Connect

Built by **Thangeda Shashider**
