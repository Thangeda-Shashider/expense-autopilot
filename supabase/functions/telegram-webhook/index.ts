import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

// Service role client — bypasses RLS for bot writes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- helpers ----------

async function sendTelegram(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Ported from the old n8n "Code in JavaScript" node, enhanced with Groq categorization
function parseExpense(text) {
  const lower = text.toLowerCase();
  const parts = lower.split(' ');
  let amount = null;
  let description = lower;

  if (lower.includes('spent') && lower.includes('on')) {
    amount = parseFloat(parts[1]);
  } else if (!isNaN(parts[0])) {
    amount = parseFloat(parts[0]);
  }

  const valid = amount !== null && !isNaN(amount) && amount > 0;
  const today = new Date().toISOString().split('T')[0];

  return { amount, description, date: today, valid };
}

async function categorize(description) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `Categorize this expense into ONE word from: food, transport, entertainment, shopping, health, bills, education, travel, other. Expense: '${description}'. Reply with only the category word, lowercase.`,
      }],
      max_tokens: 10,
    }),
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim().toLowerCase() ?? 'other';
}

// Returns user_id for a given telegram_chat_id, or null if not linked
async function getUserIdByChatId(chatId) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_chat_id', String(chatId))
    .single();
  return data?.id ?? null;
}

// Find existing category by name for a user, or create it
async function findOrCreateCategory(userId, name) {
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('categories')
    .insert({ user_id: userId, name })
    .select('id')
    .single();

  return created.id;
}

// ---------- /connect handler ----------

async function handleConnect(chatId, code) {
  const now = new Date().toISOString();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('link_code', code)
    .gt('link_code_expires_at', now)
    .single();

  if (!profile) {
    await sendTelegram(chatId, 'Code not found or expired. Generate a new one from the dashboard.');
    return;
  }

  await supabase
    .from('profiles')
    .update({
      telegram_chat_id: String(chatId),
      link_code: null,
      link_code_expires_at: null,
    })
    .eq('id', profile.id);

  await sendTelegram(chatId, 'Telegram connected! You can now log expenses. Try: "spent 200 on food" or "150 groceries"');
}

// ---------- expense handler ----------

async function handleExpense(chatId, text) {
  const userId = await getUserIdByChatId(chatId);

  if (!userId) {
    await sendTelegram(chatId, 'Your Telegram is not linked yet. Go to Settings -> Connect Telegram and use /connect <code>');
    return;
  }

  const { amount, description, date, valid } = parseExpense(text);

  if (!valid) {
    await sendTelegram(chatId, 'Could not parse that. Try: "spent 200 on food" or "150 food"');
    return;
  }

  const categoryName = await categorize(description);
  const categoryId = await findOrCreateCategory(userId, categoryName);

  const { error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      amount,
      description,
      expense_date: date,
      category_id: categoryId,
      source: 'telegram',
    });

  if (error) {
    await sendTelegram(chatId, 'Failed to save expense. Please try again.');
    return;
  }

  await sendTelegram(chatId, `Logged Rs.${amount} under ${categoryName}\n\nView analytics: https://expense-autopilot.vercel.app`);
}

// ---------- entry point ----------

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('OK', { status: 200 });
  }

  const body = await req.json();
  const message = body?.message;

  if (!message?.text || !message?.chat?.id) {
    return new Response('OK', { status: 200 });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith('/connect ')) {
    const code = text.split(' ')[1]?.trim();
    if (code) await handleConnect(chatId, code);
  } else {
    await handleExpense(chatId, text);
  }

  return new Response('OK', { status: 200 });
});
