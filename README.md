# Telegram Expense Tracker

> Log expenses via Telegram. Visualise spending via a React dashboard.
> Built with n8n · Google Sheets · PostgreSQL · Node.js · React

Telegram Bot Demo ==> (screenshots/telegram-demo.png),

Google Sheet Logging ==> (screenshots/sheets-data.png),

n8n Workflow ==> (screenshots/workflow.png)

## The problem
Manually opening apps to log expenses kills the habit.
This bot lets you log "spent 150 on food" in 2 seconds — wherever you are.

## How it works

Architecture ==> (screenshots/architecture.png)

Telegram Bots
    ↓
n8n Workflow (parse + validate)
    ↓
Google Sheets (Phase 1 — live now)
    ↓
PostgreSQL + Node.js API (Phase 2 — in progress)
    ↓
React Dashboard (Phase 3 — coming soon)

1. Send a message to Telegram bot
2. n8n parses and validates it
3. Logs to Google Sheets (Phase 1) / PostgreSQL (Phase 2)
4. React dashboard shows analytics

## Current status
- [x] Telegram bot live
- [x] n8n parsing workflow
- [x] Google Sheets logging
- [x] Weekly summary automation
- [ ] PostgreSQL schema (in progress)
- [ ] Node.js REST API
- [ ] React analytics dashboard

## Tech stack
| Layer | Tech |
|-------|------|
| Automation | n8n |
| Bot | Telegram Bot API |
| Database | PostgreSQL |
| Backend | Node.js + Express |
| Frontend | React + Recharts |

## Setup guide

### Prerequisites
- n8n account (cloud or self-hosted)
- Telegram bot token from @BotFather
- Google Sheets API connected to n8n

### Steps
1. Clone this repo
2. Import `/n8n-workflows/main-workflow.json` into your n8n
3. Import `/n8n-workflows/weekly-summary.json` into your n8n
4. Add your Telegram bot token as credential in n8n
5. Connect your Google Sheet
6. Activate both workflows
7. Message your bot: `spent 150 on food`
