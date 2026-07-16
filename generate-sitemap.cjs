const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qxoqflrqpwlythgqmjtq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4b3FmbHJxcHdseXRoZ3FtanRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODIxMTQsImV4cCI6MjA5Nzc1ODExNH0.cJ3hIsEyRtH1m_nmyzwjrdvzsbGIKIiChnmXAjgFRfo';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
  try {
    console.log('[Sitemap Generator] Fetching dynamic entries from Supabase...');
    
    // Select only 'id' since the tables do not contain 'slug' columns.
    const { data: books, error: booksError } = await supabaseClient.from('books').select('id');
    if (booksError) console.error('[Sitemap Generator] Error fetching books:', booksError);

    const { data: videos, error: videosError } = await supabaseClient.from('videos').select('id');
    if (videosError) console.error('[Sitemap Generator] Error fetching videos:', videosError);

    const { data: courses, error: coursesError } = await supabaseClient.from('courses').select('id');
    if (coursesError) console.error('[Sitemap Generator] Error fetching courses:', coursesError);

    const baseUrl = 'https://aura.auralearning.workers.dev';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. Homepage
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. General/Static pages
    const otherPages = [
      '/updates.html',
      '/admin.html',
      '/about',
      '/contact',
      '/privacy',
      '/terms'
    ];
    for (const page of otherPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // 3. Books
    if (books && books.length > 0) {
      for (const book of books) {
        if (book.id) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/book/${encodeURIComponent(book.id)}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    // 4. Videos
    if (videos && videos.length > 0) {
      for (const video of videos) {
        if (video.id) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/video/${encodeURIComponent(video.id)}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    // 5. Courses
    if (courses && courses.length > 0) {
      for (const course of courses) {
        if (course.id) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/course/${encodeURIComponent(course.id)}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>`;

    // Write to public folder (so Vite copies it to dist)
    const publicPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xml, 'utf8');
    console.log(`[Sitemap Generator] Static sitemap successfully written to ${publicPath}`);

    // Write to dist folder directly in case dist already exists
    const distFolder = path.join(__dirname, 'dist');
    if (fs.existsSync(distFolder)) {
      const distPath = path.join(distFolder, 'sitemap.xml');
      fs.writeFileSync(distPath, xml, 'utf8');
      console.log(`[Sitemap Generator] Static sitemap successfully written to ${distPath}`);
    }
  } catch (err) {
    console.error('[Sitemap Generator] Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();
