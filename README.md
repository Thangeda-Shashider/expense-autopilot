# 💸 Expense Autopilot

> **Log expenses in 2 seconds via Telegram. Visualise spending with a React analytics dashboard.**  
> An end-to-end automation project — from Telegram message to PostgreSQL to live dashboard.

---

## 🚀 Live Deployments

| Service | URL |
|---------|-----|
| 🌐 **Frontend Dashboard** | [expense-autopilot.vercel.app](https://expense-autopilot.vercel.app) |
| ⚙️ **Backend REST API** | [expense-autopilot-api.onrender.com](https://expense-autopilot-api.onrender.com) |

---

## 🧠 The Problem

Manually opening a finance app to log every expense kills the habit. Most people give up within a week.

**Expense Autopilot solves this** — just send a Telegram message like `spent 150 on food` and it's logged, categorised, and visible on your dashboard instantly.

---

## ✨ Features

- 📲 **Telegram Bot** — log expenses in plain English, no app switching
- 🤖 **n8n Automation** — parses, validates, and routes messages intelligently
- 📊 **Google Sheets Logging** — real-time spreadsheet backup for every entry
- 🗄️ **PostgreSQL Database** — structured, queryable expense storage
- 🔌 **Node.js REST API** — secure JWT-authenticated endpoints
- 📈 **React Dashboard** — interactive charts and analytics with Recharts
- 📅 **Weekly Summary** — automated digest sent to Telegram every week

---

## 🏗️ Architecture

```
Telegram Message
      ↓
n8n Workflow  ──→  Google Sheets (backup log)
      ↓
Node.js + Express API  (JWT Auth)
      ↓
PostgreSQL Database
      ↓
React Dashboard  (Recharts analytics)
```

**Flow:**
1. You send `spent 150 on food` to the Telegram bot
2. n8n parses the message and extracts amount, category, and date
3. Entry is logged to Google Sheets and PostgreSQL simultaneously
4. The React dashboard pulls from the REST API and renders charts in real time

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Automation** | n8n | Workflow orchestration & Telegram parsing |
| **Bot** | Telegram Bot API | User-facing interface |
| **Backend** | Node.js + Express | REST API with JWT authentication |
| **Database** | PostgreSQL | Persistent, relational expense storage |
| **Frontend** | React + Recharts | Analytics dashboard & data visualisation |
| **Sheets** | Google Sheets API | Real-time spreadsheet logging |
| **Deployment** | Vercel + Render | CI/CD for frontend and backend |

---

## ✅ Project Status

- [x] Telegram bot live & responding
- [x] n8n parsing workflow
- [x] Google Sheets logging
- [x] Weekly summary automation
- [x] PostgreSQL schema & migrations
- [x] Node.js REST API with JWT auth
- [x] React analytics dashboard
- [x] Frontend deployed on Vercel
- [x] Backend API deployed on Render

---

## ⚙️ Running Locally

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally
- n8n account (cloud or self-hosted)
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Google Sheets API credentials connected to n8n

### 1 — Clone the repo

```bash
git clone https://github.com/your-username/expense-autopilot.git
cd expense-autopilot
```

### 2 — Backend (Node.js API)

```bash
cd expense-autopilot-api
npm install
```

Create a `.env` file inside `expense-autopilot-api/`:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

```bash
node index.js
# API starts on http://localhost:3000
```

### 3 — Frontend (React Dashboard)

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm run dev
# Dashboard starts on http://localhost:5173
```

> ⚠️ Both the backend and frontend must be running simultaneously for the dashboard to work.

### 4 — n8n Workflows

1. Import `/n8n-workflows/main-workflow.json` into your n8n instance
2. Import `/n8n-workflows/weekly-summary.json` into your n8n instance
3. Add your Telegram bot token as a credential in n8n
4. Connect your Google Sheet
5. Activate both workflows
6. Message your bot: `spent 150 on food` 🎉

---

## 📂 Project Structure

```
expense-autopilot/
├── expense-autopilot-api/    # Node.js + Express REST API
│   ├── index.js
│   └── .env.example
├── frontend/                 # React dashboard (Vite)
│   └── src/
├── n8n-workflows/            # Exportable n8n workflow JSON files
│   ├── main-workflow.json
│   └── weekly-summary.json
└── README.md
```

---

## 🤝 Connect

Built by **Thangeda Shashidhar** — feel free to reach out or explore the live demo!
