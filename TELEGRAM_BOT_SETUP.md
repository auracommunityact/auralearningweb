# 🤖 Production-Ready Telegram Bot with Supabase Edge Functions

This directory contains the production-ready Telegram Bot built using **Supabase Edge Functions** (Deno/TypeScript) and **Supabase Database (PostgreSQL)**.

---

## ⚡ Features & Capabilities
- **Serverless Edge Webhook**: Built specifically for Supabase Edge Functions (`deno` runtime).
- **Commands Implemented**:
  - `/start` - Interactive welcome menu with inline keyboard buttons.
  - `/help` - Usage guide and command list.
  - `/books` - Real-time paginated list of books from Supabase `books` table.
  - `/videos` - Educational video resources from Supabase `videos` table.
  - `/courses` - Structured courses from Supabase `courses` table.
  - `/search <query>` - Instant real-time search across books, videos, and courses.
  - `/profile` - Displays Telegram user account info stored in Supabase `users` table.
  - `/download` - Official mobile application download links.
- **Automatic User Registration**: Automatically upserts user profile (`telegram_id`, `first_name`, `last_name`, `username`, `language_code`) into the Supabase `users` table upon interaction.
- **Inline Keyboards**: Responsive inline buttons for seamless menu navigation and deep linking.

---

## 🚀 Setup & Deployment Instructions

### Step 1: Create Your Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a name and username.
3. Copy the **HTTP API Bot Token** (e.g., `7123456789:AAFg...`).

---

### Step 2: Set Up Supabase Database Tables
Run the contents of [`supabase/telegram-bot-schema.sql`](./supabase/telegram-bot-schema.sql) in your **Supabase SQL Editor**:
- Creates `users`, `books`, `videos`, and `courses` tables.
- Configures Row Level Security (RLS) policies and indexes.
- Inserts optional sample seed data.

---

### Step 3: Configure Supabase Secrets
In your terminal, use the Supabase CLI to configure secrets:

```bash
# Set your Telegram Bot Token
supabase secrets set TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"

# Set your Supabase Service Role Key (Found in Supabase Project Settings -> API -> service_role)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Set your Supabase URL
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
```

---

### Step 4: Deploy the Edge Function
Deploy the function using the Supabase CLI:

```bash
supabase functions deploy telegram-bot --no-verify-jwt
```

Your function endpoint will be live at:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/telegram-bot`

---

### Step 5: Register the Webhook with Telegram
Run the following `curl` command in your terminal (replace `<YOUR_TELEGRAM_BOT_TOKEN>` and `<YOUR_PROJECT_REF>`):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/telegram-bot"}'
```

**Verify Webhook Registration:**
```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## 🛠️ Testing Your Bot
1. Open your Telegram Bot and send `/start`.
2. Tap inline buttons (`📚 Books`, `🎥 Videos`, `🎓 Courses`, `🔍 Search`, `👤 Profile`).
3. Send a search request like `/search Physics` or type `Math` directly.
4. Check your Supabase `users` table in the Dashboard to see real-time user entries!
