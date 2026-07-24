import express from "express";
import path from "path";
import fs from "fs";
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

// Helper to determine index.html location depending on environment
function getIndexHtmlPath(): string {
  if (process.env.NODE_ENV === "production") {
    return path.join(process.cwd(), 'dist', 'index.html');
  } else {
    return path.join(process.cwd(), 'index.html');
  }
}

// Controller for handling dynamic path routes with server-side metadata and pre-injection
async function handleDynamicRoute(req: any, res: any, type: string, slugOverride?: string) {
  const slug = slugOverride || req.params.slug;
  console.log(`[DynamicRoute] Server rendering ${type}/${slug}`);
  
  let data: any = null;
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (type === 'book') {
      if (uuidRegex.test(slug)) {
        const { data: list } = await supabaseClient.from('books').select('*').eq('id', slug);
        if (list && list.length > 0) data = list[0];
      } else {
        const { data: list } = await supabaseClient.from('books').select('*').eq('slug', slug);
        if (list && list.length > 0) {
          data = list[0];
        } else {
          const { data: listByName } = await supabaseClient.from('books').select('*').ilike('bookName', slug);
          if (listByName && listByName.length > 0) data = listByName[0];
        }
      }
    } else if (type === 'video') {
      if (uuidRegex.test(slug)) {
        const { data: list } = await supabaseClient.from('videos').select('*').eq('id', slug);
        if (list && list.length > 0) data = list[0];
      } else {
        const { data: listByTitle } = await supabaseClient.from('videos').select('*').ilike('title', slug);
        if (listByTitle && listByTitle.length > 0) {
          data = listByTitle[0];
        } else {
          const { data: listByChapter } = await supabaseClient.from('videos').select('*').ilike('chapter', slug);
          if (listByChapter && listByChapter.length > 0) data = listByChapter[0];
        }
      }
    } else if (type === 'course') {
      if (uuidRegex.test(slug)) {
        const { data: list } = await supabaseClient.from('courses').select('*').eq('id', slug);
        if (list && list.length > 0) data = list[0];
      } else {
        const { data: listByName } = await supabaseClient.from('courses').select('*').ilike('name', slug);
        if (listByName && listByName.length > 0) data = listByName[0];
      }
    } else if (type === 'announcement' || type === 'upload' || type === 'post') {
      // Both announcements and uploads come from updates_amusement table
      if (uuidRegex.test(slug)) {
        const { data: list } = await supabaseClient.from('updates_amusement').select('*').eq('id', slug);
        if (list && list.length > 0) data = list[0];
      } else {
        const { data: listByTitle } = await supabaseClient.from('updates_amusement').select('*').ilike('title', slug);
        if (listByTitle && listByTitle.length > 0) data = listByTitle[0];
      }
    } else if (type === 'page') {
      if (slug === 'privacy-policy') {
        data = { title: 'Privacy Policy', description: 'Review our privacy practices and how we protect your data.' };
      } else if (slug === 'terms-of-use' || slug === 'terms') {
        data = { title: 'Terms of Use', description: 'Read our terms of service for using Aura Learning.' };
      } else if (slug === 'books') {
        data = { title: 'Books & Resources', description: 'Explore our collection of educational books and study notes on Aura Learning.' };
      } else if (slug === 'videos') {
        data = { title: 'Video Lessons', description: 'Watch interactive video tutorials and lessons on Aura Learning.' };
      } else if (slug === 'about') {
        data = { title: 'About Aura Learning', description: 'Learn more about Aura Learning, our mission, and distraction-free learning.' };
      } else if (slug === 'contact') {
        data = { title: 'Contact Us', description: 'Get in touch with the Aura Learning team.' };
      }
    }
  } catch (dbError) {
    console.error(`[DynamicRoute] Supabase error fetching ${type}/${slug}:`, dbError);
  }

  // Redirect to home with a query parameter if content is not found
  if (!data) {
    console.log(`[DynamicRoute] Content not found for ${type}/${slug}, redirecting to homepage.`);
    return res.redirect('/?content-not-found=true');
  }

  // Content found! Set up dynamic SEO tags
  const title = data.title || data.bookName || data.name || "Untitled Resource";
  const description = data.description || `Access this ${type} on the Aura Learning mobile app.`;
  const defaultCover = 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/IMG_20260702_103051.png';
  const coverUrl = data.thumbnail || data.coverImage || data.cover_image || data.cover_url || data.image_url || data.cover || defaultCover;
  
  const absoluteUrl = `https://aura.auralearning.workers.dev/${type}/${slug}`;

  try {
    const htmlPath = getIndexHtmlPath();
    if (!fs.existsSync(htmlPath)) {
      console.warn(`[DynamicRoute] index.html not found at ${htmlPath}`);
      return res.redirect('/?content-not-found=true');
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Substitute page title
    html = html.replace(
      /<title>Aura Learning – Learn Anytime, Anywhere<\/title>/,
      `<title>${title} - Aura Learning</title>`
    );

    // Substitute canonical and og:url
    html = html.replace(
      /href="https:\/\/aura\.auralearning\.workers\.dev"/g,
      `href="${absoluteUrl}"`
    );
    html = html.replace(
      /content="https:\/\/aura\.auralearning\.workers\.dev"/g,
      `content="${absoluteUrl}"`
    );

    // Substitute description
    const shortDesc = description.length > 160 ? description.substring(0, 157) + '...' : description;
    html = html.replace(
      /content="Aura Learning is an educational platform offering books, notes, PDFs, videos, quizzes, and study materials\..*?"/g,
      `content="${shortDesc.replace(/"/g, '&quot;')}"`
    );

    // Substitute og:title and twitter:title
    html = html.replace(
      /content="Aura Learning – Learn Anytime, Anywhere"/g,
      `content="${title.replace(/"/g, '&quot;')}"`
    );

    // Substitute og:image and twitter:image
    const defaultCoverEscaped = defaultCover.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(
      new RegExp(`content="${defaultCoverEscaped}"`, 'g'),
      `content="${coverUrl}"`
    );

    // Inject Initial Data script for client-side hydration
    const initialDataScript = `
    <script>
      window.__AURA_INITIAL_DATA__ = {
        type: ${JSON.stringify(type)},
        data: ${JSON.stringify(data)}
      };
    </script>
    </head>`;

    html = html.replace('</head>', initialDataScript);

    res.header('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    console.error("[DynamicRoute] Error rendering index HTML:", err);
    return res.redirect('/?content-not-found=true');
  }
}

// Android App Links Dynamic Content Routes
app.get('/course/:slug', (req, res) => handleDynamicRoute(req, res, 'course'));
app.get('/video/:slug', (req, res) => handleDynamicRoute(req, res, 'video'));
app.get('/book/:slug', (req, res) => handleDynamicRoute(req, res, 'book'));
app.get('/page/:slug', (req, res) => handleDynamicRoute(req, res, 'page'));
app.get('/announcement/:slug', (req, res) => handleDynamicRoute(req, res, 'announcement'));
app.get('/upload/:slug', (req, res) => handleDynamicRoute(req, res, 'upload'));
app.get('/books', (req, res) => handleDynamicRoute(req, res, 'page', 'books'));
app.get('/videos', (req, res) => handleDynamicRoute(req, res, 'page', 'videos'));
app.get('/about', (req, res) => handleDynamicRoute(req, res, 'page', 'about'));
app.get('/contact', (req, res) => handleDynamicRoute(req, res, 'page', 'contact'));
app.get('/privacy-policy', (req, res) => handleDynamicRoute(req, res, 'page', 'privacy-policy'));
app.get('/terms-of-use', (req, res) => handleDynamicRoute(req, res, 'page', 'terms-of-use'));
app.get('/terms', (req, res) => handleDynamicRoute(req, res, 'page', 'terms'));

// Routes for robots.txt and /robot
const ROBOTS_TXT_CONTENT = `User-agent: *
Allow: /

Sitemap: https://aura.auralearning.workers.dev/sitemap.xml
`;

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.status(200).send(ROBOTS_TXT_CONTENT);
});

app.get('/robot', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.status(200).send(ROBOTS_TXT_CONTENT);
});

// API Route: Dynamic sitemap.xml according to sitemaps.org standards
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://aura.auralearning.workers.dev';
    const today = new Date().toISOString().split('T')[0];

    // Fetch dynamic content from Supabase
    const { data: books } = await supabaseClient.from('books').select('id, slug');
    const { data: videos } = await supabaseClient.from('videos').select('id');
    const { data: courses } = await supabaseClient.from('courses').select('id');
    const { data: posts } = await supabaseClient.from('updates_amusement').select('id, title');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Primary pages required by spec
    const mainPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'books', priority: '0.8', changefreq: 'weekly' },
      { path: 'videos', priority: '0.8', changefreq: 'weekly' },
      { path: 'about', priority: '0.7', changefreq: 'monthly' },
      { path: 'contact', priority: '0.7', changefreq: 'monthly' },
      { path: 'privacy-policy', priority: '0.5', changefreq: 'monthly' },
      { path: 'terms', priority: '0.5', changefreq: 'monthly' }
    ];

    for (const page of mainPages) {
      const loc = page.path ? `${baseUrl}/${page.path}` : `${baseUrl}/`;
      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Dynamic book pages
    if (books && books.length > 0) {
      books.forEach(b => {
        const slug = b.slug || b.id;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/book/${encodeURIComponent(slug)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 3. Dynamic video pages
    if (videos && videos.length > 0) {
      videos.forEach(v => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/video/${encodeURIComponent(v.id)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 4. Dynamic course pages
    if (courses && courses.length > 0) {
      courses.forEach(c => {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/course/${encodeURIComponent(c.id)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    // 5. Dynamic announcements and uploads
    if (posts && posts.length > 0) {
      posts.forEach(p => {
        const type = p.title && p.title.startsWith('[Announcement] ') ? 'announcement' : 'upload';
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/${type}/${encodeURIComponent(p.id)}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap XML generation error:", error);
    res.status(500).header('Content-Type', 'application/xml; charset=utf-8').send('<?xml version="1.0" encoding="UTF-8"?><error>Error generating sitemap</error>');
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
