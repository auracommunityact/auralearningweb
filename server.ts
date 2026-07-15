import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize Supabase Client for dynamic sitemap and routing
const SUPABASE_URL = 'https://qxoqflrqpwlythgqmjtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b3FmbHJxcHdseXRoZ3FtanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODIxMTQsImV4cCI6MjA5Nzc1ODExNH0.cJ3hIsEyRtH1m_nmyzwjrdvzsbGIKIiChnmXAjgFRfo';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Gemini API
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// System instruction for the Aura chatbot
const AURA_SYSTEM_INSTRUCTION = `You are the Aura Learning App assistant. 
Aura is an upcoming minimalist, distraction-free learning platform designed to help users focus, retain information, and find calm in learning. 
You are helpful, calming, and minimalist in your responses. 
You answer questions about the app, pre-registration, and the upcoming launch. 
Key details you should know:
- Launch Date: September 1, 2026.
- Pre-registration: Users can sign up on the website with their email to join the waitlist and receive early access updates.
- Theme: Minimalist, distraction-free, calming colors.
Keep your responses relatively brief and supportive. Use formatting like bullet points or bold text to make your messages easy to read.`;

// API Route: Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ text: "Please add your Gemini API Key in the Settings > Secrets panel." });
    }

    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const contents = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: AURA_SYSTEM_INSTRUCTION,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// API Route: Signup and Email Notification
app.post('/api/signup', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`New signup: ${email}`);

    // Try to send email via Gmail API
    try {
      // In AI Studio workspace integration, auth can be initialized via ADC or environment variables.
      // We will attempt to use GoogleAuth to acquire a client.
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/gmail.send']
      });
      
      const authClient = await auth.getClient();
      const gmail = google.gmail({ version: 'v1', auth: authClient as any });

      const subject = "Welcome to the Aura Waitlist \u2728";
      const body = `
        <div style="font-family: sans-serif; color: #334155; max-w: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f766e; font-weight: normal;">Find your calm in learning.</h1>
          <p>Hi there,</p>
          <p>Thank you for signing up for the Aura Learning App waitlist! We are thrilled to have you with us.</p>
          <p>We are currently building a minimalist, distraction-free platform to help you focus and enjoy the learning process. We will notify you at this email address as soon as we launch our early access.</p>
          <br/>
          <p>Stay calm and keep learning,</p>
          <p><strong>The Aura Team</strong></p>
        </div>
      `;

      // Construct raw email
      const message = [
        `To: ${email}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log(`Welcome email sent to ${email}`);
    } catch (emailError: any) {
      console.error("Failed to send welcome email. This is normal if OAuth is not fully configured yet:", emailError.message);
      // We still return success to the frontend even if the email fails, 
      // so the user sees the success state during local development without credentials.
    }

    res.json({ success: true, message: "Signed up successfully" });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    res.status(500).json({ error: "Failed to process signup" });
  }
});

// API Route: Dynamic sitemap.xml that automatically updates with new books/pages
app.get('/sitemap.xml', async (req, res) => {
  try {
    const host = req.get('host') || 'aura.auralearning.workers.dev';
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Query books from Supabase to automatically reflect new books in the sitemap
    const { data: books } = await supabaseClient
      .from('books')
      .select('id, slug');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Homepage (priority 1.0, weekly change frequency)
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Static public pages (priority 0.8, monthly change frequency)
    const otherPages = ['/about', '/contact', '/privacy', '/terms', '/updates.html', '/admin.html'];
    for (const page of otherPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic book pages
    if (books && books.length > 0) {
      for (const book of books) {
        const bookSlug = book.slug || book.id;
        if (bookSlug) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/?book=${encodeURIComponent(bookSlug)}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap XML generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Explicitly handle /sitemap in dev mode
    app.get('/sitemap', (req, res) => {
      res.redirect('/sitemap.xml');
    });
    
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Enable browser caching for 1 day
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true
    }));
    
    // Explicitly handle /sitemap to redirect to /sitemap.xml
    app.get('/sitemap', (req, res) => {
      res.redirect('/sitemap.xml');
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
