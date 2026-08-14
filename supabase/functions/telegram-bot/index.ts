// Supabase Edge Function: Telegram Bot Webhook
// Path: supabase/functions/telegram-bot/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Retrieve Environment Variables
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Initialize Supabase Client with Service Role Key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Types for Telegram Updates
interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

// Main Request Handler
Deno.serve(async (req: Request) => {
  // Handle GET for health checks / webhook verification
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Aura Learning Telegram Bot Webhook is active and running!",
        timestamp: new Date().toISOString(),
        has_token: Boolean(TELEGRAM_BOT_TOKEN),
        has_supabase: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Only allow POST for Webhook updates
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const update: TelegramUpdate = await req.json();

    // 1. Process Message Update
    if (update.message) {
      await handleMessage(update.message);
    } 
    // 2. Process Callback Query (Inline Keyboard Buttons)
    else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing Telegram update:", error);
    return new Response(
      JSON.stringify({ ok: false, error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper: Send message to Telegram
async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: any,
  parseMode: string = "HTML"
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
    return;
  }

  const payload: any = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const res = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Telegram sendMessage Error: ${res.status}`, errText);
  }
}

// Helper: Edit message text in Telegram
async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  replyMarkup?: any,
  parseMode: string = "HTML"
) {
  if (!TELEGRAM_BOT_TOKEN) return;

  const payload: any = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const res = await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Telegram editMessageText Error: ${res.status}`, errText);
  }
}

// Helper: Answer Callback Query
async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!TELEGRAM_BOT_TOKEN) return;

  await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text || "",
    }),
  });
}

// Sync Telegram user info to Supabase `users` table
async function saveUserToSupabase(user?: TelegramUser) {
  if (!user) return;

  try {
    const telegramId = user.id.toString();
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

    // Check if user exists or upsert
    const { error } = await supabase.from("users").upsert(
      {
        telegram_id: telegramId,
        first_name: user.first_name,
        last_name: user.last_name || null,
        full_name: fullName,
        username: user.username || null,
        language_code: user.language_code || "en",
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "telegram_id" }
    );

    if (error) {
      // Fallback: If table uses `id` as text/uuid or custom schema, try alternative structure
      console.warn("Supabase user save notice:", error.message);
    }
  } catch (err) {
    console.error("Error saving user to Supabase:", err);
  }
}

// Generate Main Menu Keyboard
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📚 Books", callback_data: "cb:books:0" },
        { text: "🎥 Videos", callback_data: "cb:videos:0" },
      ],
      [
        { text: "🎓 Courses", callback_data: "cb:courses:0" },
        { text: "🔍 Search", callback_data: "cb:search_prompt" },
      ],
      [
        { text: "👤 My Profile", callback_data: "cb:profile" },
        { text: "📥 Download App", callback_data: "cb:download" },
      ],
      [{ text: "❓ Help & Guide", callback_data: "cb:help" }],
    ],
  };
}

// ---------------- Handle Message Updates ----------------
async function handleMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const user = msg.from;
  const text = msg.text?.trim() || "";

  // 1. Sync User to Supabase
  await saveUserToSupabase(user);

  // 2. Command Router
  if (text.startsWith("/start")) {
    const welcomeText =
      `✨ <b>Welcome to Aura Learning Bot!</b>\n\n` +
      `Hello ${user?.first_name || "Learner"}! 👋\n` +
      `Your smart companion for books, educational videos, courses, and study resources.\n\n` +
      `<b>Quick Commands:</b>\n` +
      `• /books - Browse learning books & PDFs\n` +
      `• /videos - Explore educational videos\n` +
      `• /courses - Browse structured courses\n` +
      `• /search [query] - Search anything in real time\n` +
      `• /profile - View your saved user profile\n` +
      `• /download - Get official Aura Learning App\n` +
      `• /help - View detailed guide\n\n` +
      `Select an option below to start exploring 👇`;

    await sendMessage(chatId, welcomeText, getMainMenuKeyboard());
  } else if (text.startsWith("/help")) {
    await sendHelpMessage(chatId);
  } else if (text.startsWith("/books")) {
    await sendBooksList(chatId, 0);
  } else if (text.startsWith("/videos")) {
    await sendVideosList(chatId, 0);
  } else if (text.startsWith("/courses")) {
    await sendCoursesList(chatId, 0);
  } else if (text.startsWith("/search")) {
    const query = text.replace("/search", "").trim();
    if (query.length > 0) {
      await performRealtimeSearch(chatId, query);
    } else {
      await sendMessage(
        chatId,
        `🔍 <b>Search Aura Learning Library</b>\n\n` +
          `Please provide a keyword to search.\n` +
          `Example:\n` +
          `<code>/search Physics</code>\n` +
          `<code>/search Algebra</code>\n` +
          `<code>/search Chemistry</code>`,
        {
          inline_keyboard: [
            [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
          ],
        }
      );
    }
  } else if (text.startsWith("/profile")) {
    await sendUserProfile(chatId, user);
  } else if (text.startsWith("/download")) {
    await sendDownloadLinks(chatId);
  } else {
    // Treat plain text as search query if longer than 2 chars
    if (text.length >= 2) {
      await performRealtimeSearch(chatId, text);
    } else {
      await sendMessage(
        chatId,
        `🤖 Command not recognized. Please use /help or select an option from the menu below:`,
        getMainMenuKeyboard()
      );
    }
  }
}

// ---------------- Handle Callback Queries (Inline Keyboard) ----------------
async function handleCallbackQuery(cq: TelegramCallbackQuery) {
  const chatId = cq.message?.chat.id;
  const messageId = cq.message?.message_id;
  const data = cq.data || "";
  const user = cq.from;

  await answerCallbackQuery(cq.id);

  if (!chatId || !messageId) return;

  await saveUserToSupabase(user);

  const parts = data.split(":");
  const action = parts[1] || "";
  const param = parts[2] || "0";

  if (action === "main_menu") {
    const text = `✨ <b>Aura Learning Main Menu</b>\n\nChoose a category below to explore real-time resources from our library:`;
    await editMessageText(chatId, messageId, text, getMainMenuKeyboard());
  } else if (action === "books") {
    const page = parseInt(param, 10) || 0;
    await sendBooksList(chatId, page, messageId);
  } else if (action === "book_detail") {
    await sendBookDetail(chatId, param, messageId);
  } else if (action === "videos") {
    const page = parseInt(param, 10) || 0;
    await sendVideosList(chatId, page, messageId);
  } else if (action === "courses") {
    const page = parseInt(param, 10) || 0;
    await sendCoursesList(chatId, page, messageId);
  } else if (action === "search_prompt") {
    const text =
      `🔍 <b>Real-Time Library Search</b>\n\n` +
      `To search our library, type <code>/search &lt;keyword&gt;</code> in chat or simply type any topic name directly.\n\n` +
      `<i>Examples:</i>\n` +
      `• <code>/search Mathematics</code>\n` +
      `• <code>/search Class 10</code>\n` +
      `• <code>Physics Notes</code>`;
    await editMessageText(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
      ],
    });
  } else if (action === "profile") {
    await sendUserProfile(chatId, user, messageId);
  } else if (action === "download") {
    await sendDownloadLinks(chatId, messageId);
  } else if (action === "help") {
    await sendHelpMessage(chatId, messageId);
  }
}

// ---------------- Command Implementations ----------------

// 1. /books List
async function sendBooksList(chatId: number, page: number = 0, messageId?: number) {
  const pageSize = 4;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: books, error, count } = await supabase
    .from("books")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching books from Supabase:", error);
    const errText = `❌ <b>Failed to load books.</b>\n<i>${error.message}</i>`;
    if (messageId) {
      await editMessageText(chatId, messageId, errText, {
        inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]],
      });
    } else {
      await sendMessage(chatId, errText);
    }
    return;
  }

  if (!books || books.length === 0) {
    const emptyText = `📚 <b>Books Library</b>\n\nNo books found at the moment.`;
    const keyboard = {
      inline_keyboard: [
        [{ text: "🔄 Refresh", callback_data: "cb:books:0" }],
        [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
      ],
    };
    if (messageId) {
      await editMessageText(chatId, messageId, emptyText, keyboard);
    } else {
      await sendMessage(chatId, emptyText, keyboard);
    }
    return;
  }

  let text = `📚 <b>Aura Learning Books Library</b> (Page ${page + 1})\n\n`;

  const inlineKeyboard: any[] = [];

  books.forEach((book: any, idx: number) => {
    const title = book.bookName || book.title || "Untitled Book";
    const author = book.author ? `\n👤 <i>${book.author}</i>` : "";
    const category = book.category ? ` | 🏷️ ${book.category}` : "";
    
    text += `<b>${from + idx + 1}. ${title}</b>${author}${category}\n`;
    if (book.description) {
      const shortDesc = book.description.length > 80 ? `${book.description.substring(0, 80)}...` : book.description;
      text += `<i>${shortDesc}</i>\n`;
    }
    text += `\n`;

    // Add button for details if ID exists
    const bookId = book.id || book.slug;
    if (bookId) {
      inlineKeyboard.push([
        { text: `📖 View "${title.substring(0, 24)}"`, callback_data: `cb:book_detail:${bookId}` }
      ]);
    }
  });

  // Pagination buttons
  const paginationRow: any[] = [];
  if (page > 0) {
    paginationRow.push({ text: "⬅️ Previous", callback_data: `cb:books:${page - 1}` });
  }
  if (count && to + 1 < count) {
    paginationRow.push({ text: "Next ➡️", callback_data: `cb:books:${page + 1}` });
  }
  if (paginationRow.length > 0) {
    inlineKeyboard.push(paginationRow);
  }

  inlineKeyboard.push([{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]);

  if (messageId) {
    await editMessageText(chatId, messageId, text, { inline_keyboard: inlineKeyboard });
  } else {
    await sendMessage(chatId, text, { inline_keyboard: inlineKeyboard });
  }
}

// Book Detail View
async function sendBookDetail(chatId: number, bookId: string, messageId?: number) {
  const { data: book, error } = await supabase
    .from("books")
    .select("*")
    .or(`id.eq.${bookId},slug.eq.${bookId},bookName.ilike.${bookId}`)
    .maybeSingle();

  if (error || !book) {
    const notFoundText = `❌ Book not found or removed.`;
    if (messageId) {
      await editMessageText(chatId, messageId, notFoundText, {
        inline_keyboard: [[{ text: "⬅️ Back to Books", callback_data: "cb:books:0" }]],
      });
    } else {
      await sendMessage(chatId, notFoundText);
    }
    return;
  }

  const title = book.bookName || book.title || "Untitled Book";
  const downloadUrl = book.pdf_url || book.download_url || book.file_url || `https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app/book/${book.id || book.slug || ''}`;

  let detailText = `📖 <b>${title}</b>\n\n`;
  if (book.author) detailText += `✍️ <b>Author:</b> ${book.author}\n`;
  if (book.category) detailText += `🏷️ <b>Category:</b> ${book.category}\n`;
  if (book.language) detailText += `🌐 <b>Language:</b> ${book.language}\n`;
  if (book.pages) detailText += `📄 <b>Pages:</b> ${book.pages}\n`;
  detailText += `\n📝 <b>Description:</b>\n${book.description || 'No description available.'}\n`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📥 Open / Download Book", url: downloadUrl }],
      [{ text: "⬅️ Back to Books", callback_data: "cb:books:0" }],
      [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
    ],
  };

  if (messageId) {
    await editMessageText(chatId, messageId, detailText, keyboard);
  } else {
    await sendMessage(chatId, detailText, keyboard);
  }
}

// 2. /videos List
async function sendVideosList(chatId: number, page: number = 0, messageId?: number) {
  const pageSize = 4;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: videos, error, count } = await supabase
    .from("videos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching videos:", error);
    const errText = `❌ <b>Failed to load videos.</b>\n<i>${error.message}</i>`;
    if (messageId) {
      await editMessageText(chatId, messageId, errText, {
        inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]],
      });
    } else {
      await sendMessage(chatId, errText);
    }
    return;
  }

  if (!videos || videos.length === 0) {
    const emptyText = `🎥 <b>Video Tutorials</b>\n\nNo videos currently available.`;
    const keyboard = {
      inline_keyboard: [
        [{ text: "🔄 Refresh", callback_data: "cb:videos:0" }],
        [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
      ],
    };
    if (messageId) {
      await editMessageText(chatId, messageId, emptyText, keyboard);
    } else {
      await sendMessage(chatId, emptyText, keyboard);
    }
    return;
  }

  let text = `🎥 <b>Aura Learning Video Library</b> (Page ${page + 1})\n\n`;
  const inlineKeyboard: any[] = [];

  videos.forEach((vid: any, idx: number) => {
    const title = vid.title || "Educational Video";
    const videoUrl = vid.url || vid.video_url || "https://youtube.com/@auralearningofficialy";
    text += `<b>${from + idx + 1}. ${title}</b>\n`;
    if (vid.category) text += `🏷️ <i>${vid.category}</i>\n`;
    if (vid.description) text += `<i>${vid.description.substring(0, 75)}...</i>\n`;
    text += `🔗 <a href="${videoUrl}">Watch Video</a>\n\n`;

    inlineKeyboard.push([{ text: `▶️ Watch "${title.substring(0, 24)}"`, url: videoUrl }]);
  });

  const paginationRow: any[] = [];
  if (page > 0) {
    paginationRow.push({ text: "⬅️ Previous", callback_data: `cb:videos:${page - 1}` });
  }
  if (count && to + 1 < count) {
    paginationRow.push({ text: "Next ➡️", callback_data: `cb:videos:${page + 1}` });
  }
  if (paginationRow.length > 0) {
    inlineKeyboard.push(paginationRow);
  }

  inlineKeyboard.push([{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]);

  if (messageId) {
    await editMessageText(chatId, messageId, text, { inline_keyboard: inlineKeyboard });
  } else {
    await sendMessage(chatId, text, { inline_keyboard: inlineKeyboard });
  }
}

// 3. /courses List
async function sendCoursesList(chatId: number, page: number = 0, messageId?: number) {
  const pageSize = 4;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: courses, error, count } = await supabase
    .from("courses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching courses:", error);
    const errText = `❌ <b>Failed to load courses.</b>\n<i>${error.message}</i>`;
    if (messageId) {
      await editMessageText(chatId, messageId, errText, {
        inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]],
      });
    } else {
      await sendMessage(chatId, errText);
    }
    return;
  }

  if (!courses || courses.length === 0) {
    const emptyText = `🎓 <b>Structured Courses</b>\n\nNo courses currently available.`;
    const keyboard = {
      inline_keyboard: [
        [{ text: "🔄 Refresh", callback_data: "cb:courses:0" }],
        [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
      ],
    };
    if (messageId) {
      await editMessageText(chatId, messageId, emptyText, keyboard);
    } else {
      await sendMessage(chatId, emptyText, keyboard);
    }
    return;
  }

  let text = `🎓 <b>Aura Learning Courses</b> (Page ${page + 1})\n\n`;
  const inlineKeyboard: any[] = [];

  courses.forEach((course: any, idx: number) => {
    const title = course.title || "Course Program";
    const instructor = course.instructor ? ` | 👨‍🏫 ${course.instructor}` : "";
    const courseUrl = course.link || course.url || "https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app";

    text += `<b>${from + idx + 1}. ${title}</b>${instructor}\n`;
    if (course.description) text += `<i>${course.description.substring(0, 80)}...</i>\n`;
    text += `\n`;

    inlineKeyboard.push([{ text: `🎓 Start "${title.substring(0, 24)}"`, url: courseUrl }]);
  });

  const paginationRow: any[] = [];
  if (page > 0) {
    paginationRow.push({ text: "⬅️ Previous", callback_data: `cb:courses:${page - 1}` });
  }
  if (count && to + 1 < count) {
    paginationRow.push({ text: "Next ➡️", callback_data: `cb:courses:${page + 1}` });
  }
  if (paginationRow.length > 0) {
    inlineKeyboard.push(paginationRow);
  }

  inlineKeyboard.push([{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]);

  if (messageId) {
    await editMessageText(chatId, messageId, text, { inline_keyboard: inlineKeyboard });
  } else {
    await sendMessage(chatId, text, { inline_keyboard: inlineKeyboard });
  }
}

// 4. Real-time Search across Books, Videos, Courses
async function performRealtimeSearch(chatId: number, query: string) {
  const cleanQuery = query.trim();

  // Parallel search across tables
  const [booksRes, videosRes, coursesRes] = await Promise.all([
    supabase
      .from("books")
      .select("*")
      .or(`bookName.ilike.%${cleanQuery}%,title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
      .limit(3),
    supabase
      .from("videos")
      .select("*")
      .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
      .limit(3),
    supabase
      .from("courses")
      .select("*")
      .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
      .limit(3),
  ]);

  const books = booksRes.data || [];
  const videos = videosRes.data || [];
  const courses = coursesRes.data || [];

  const totalResults = books.length + videos.length + courses.length;

  if (totalResults === 0) {
    await sendMessage(
      chatId,
      `🔍 <b>Search Results for:</b> "${cleanQuery}"\n\n` +
        `❌ No matching books, videos, or courses found.\n` +
        `Try searching with another keyword like <code>Physics</code>, <code>Math</code>, or <code>Class 10</code>.`,
      {
        inline_keyboard: [
          [{ text: "🔍 Try New Search", callback_data: "cb:search_prompt" }],
          [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
        ],
      }
    );
    return;
  }

  let text = `🔍 <b>Search Results for:</b> "${cleanQuery}" (${totalResults} found)\n\n`;
  const inlineKeyboard: any[] = [];

  if (books.length > 0) {
    text += `📚 <b>Books (${books.length}):</b>\n`;
    books.forEach((b: any) => {
      const bTitle = b.bookName || b.title || "Book";
      text += `• <b>${bTitle}</b> ${b.author ? `(${b.author})` : ""}\n`;
      const bookId = b.id || b.slug;
      if (bookId) {
        inlineKeyboard.push([
          { text: `📖 Read Book: ${bTitle.substring(0, 22)}`, callback_data: `cb:book_detail:${bookId}` },
        ]);
      }
    });
    text += `\n`;
  }

  if (videos.length > 0) {
    text += `🎥 <b>Videos (${videos.length}):</b>\n`;
    videos.forEach((v: any) => {
      const vTitle = v.title || "Video";
      const vUrl = v.url || v.video_url || "https://youtube.com/@auralearningofficialy";
      text += `• <b>${vTitle}</b>\n`;
      inlineKeyboard.push([{ text: `▶️ Watch Video: ${vTitle.substring(0, 22)}`, url: vUrl }]);
    });
    text += `\n`;
  }

  if (courses.length > 0) {
    text += `🎓 <b>Courses (${courses.length}):</b>\n`;
    courses.forEach((c: any) => {
      const cTitle = c.title || "Course";
      const cUrl = c.link || c.url || "https://ais-dev-md445vldjd7jquxyou3ama-1062068490011.asia-southeast1.run.app";
      text += `• <b>${cTitle}</b>\n`;
      inlineKeyboard.push([{ text: `🎓 Start Course: ${cTitle.substring(0, 22)}`, url: cUrl }]);
    });
    text += `\n`;
  }

  inlineKeyboard.push([{ text: "🔍 Search Again", callback_data: "cb:search_prompt" }]);
  inlineKeyboard.push([{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }]);

  await sendMessage(chatId, text, { inline_keyboard: inlineKeyboard });
}

// 5. User Profile View
async function sendUserProfile(chatId: number, user?: TelegramUser, messageId?: number) {
  if (!user) return;

  const telegramId = user.id.toString();

  // Query database for stored user info
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const username = user.username ? `@${user.username}` : "Not set";
  const language = user.language_code ? user.language_code.toUpperCase() : "EN";
  const joinedDate = dbUser?.created_at ? new Date(dbUser.created_at).toLocaleDateString() : "Just now";

  const profileText =
    `👤 <b>Your Telegram Profile & Account</b>\n\n` +
    `• <b>Full Name:</b> ${fullName}\n` +
    `• <b>Telegram ID:</b> <code>${telegramId}</code>\n` +
    `• <b>Username:</b> ${username}\n` +
    `• <b>Language:</b> ${language}\n` +
    `• <b>First Registered:</b> ${joinedDate}\n` +
    `• <b>Status:</b> 🟢 Active Learner\n\n` +
    `<i>Your user data is securely synchronized with Aura Learning Supabase database.</i>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📚 Browse Books", callback_data: "cb:books:0" }],
      [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
    ],
  };

  if (messageId) {
    await editMessageText(chatId, messageId, profileText, keyboard);
  } else {
    await sendMessage(chatId, profileText, keyboard);
  }
}

// 6. Download Links
async function sendDownloadLinks(chatId: number, messageId?: number) {
  const downloadText =
    `📱 <b>Download Official Aura Learning App</b>\n\n` +
    `Get the full Aura Learning experience on your Android smartphone!\n\n` +
    `✨ <b>App Highlights:</b>\n` +
    `• Complete offline & online book reader\n` +
    `• Interactive AI Study Assistant (Aura AI)\n` +
    `• Educational videos, quizzes, and live announcements\n` +
    `• Light & Dark modern theme\n\n` +
    `Choose your preferred store below 👇`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: "🟢 Download on APKPure",
          url: "https://apkpure.com/aura-learning/com.auracommunityact.auralearning",
        },
      ],
      [
        {
          text: "🟢 Download on Uptodown",
          url: "https://aura-learning.en.uptodown.com/android",
        },
      ],
      [
        {
          text: "🟠 Download on Amazon Appstore",
          url: "https://www.amazon.in/Social-service-Aura-Learning/dp/B0HB3NW6XC",
        },
      ],
      [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
    ],
  };

  if (messageId) {
    await editMessageText(chatId, messageId, downloadText, keyboard);
  } else {
    await sendMessage(chatId, downloadText, keyboard);
  }
}

// 7. Help & Guide
async function sendHelpMessage(chatId: number, messageId?: number) {
  const helpText =
    `❓ <b>Aura Learning Telegram Bot Help Guide</b>\n\n` +
    `Here is how you can use this bot to access study materials:\n\n` +
    `<b>Commands List:</b>\n` +
    `• <code>/start</code> - Return to the main menu\n` +
    `• <code>/books</code> - Browse all available books & PDF materials\n` +
    `• <code>/videos</code> - Watch video tutorials and lectures\n` +
    `• <code>/courses</code> - Explore structured courses\n` +
    `• <code>/search &lt;query&gt;</code> - Search books/courses/videos in real-time\n` +
    `• <code>/profile</code> - Check your synchronized user account\n` +
    `• <code>/download</code> - Get official mobile application download links\n` +
    `• <code>/help</code> - Show this guide\n\n` +
    `<b>Tip:</b> You can also directly type any subject name or topic in chat (e.g. <i>Mathematics</i>) to trigger an instant library search!`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "📚 Browse Books", callback_data: "cb:books:0" }],
      [{ text: "🏠 Main Menu", callback_data: "cb:main_menu" }],
    ],
  };

  if (messageId) {
    await editMessageText(chatId, messageId, helpText, keyboard);
  } else {
    await sendMessage(chatId, helpText, keyboard);
  }
}
