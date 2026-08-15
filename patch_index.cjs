const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace favicon
html = html.replace(
    /<!-- Favicon & PWA App Icons -->[\s\S]*?(?=<!-- SEO Meta Tags -->)/,
    `<!-- Favicon & PWA App Icons -->
    <link rel="icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="shortcut icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="apple-touch-icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#4F46E5">
    
    `
);

// Replace Open Graph and Twitter
html = html.replace(
    /<!-- Open Graph \/ Facebook -->[\s\S]*?(?=<!-- Structured Data \(JSON-LD\) -->)/,
    `<!-- Open Graph / Facebook -->
    <meta property="og:title" content="Aura Learning – Education & Learning App">
    <meta property="og:description" content="Explore Aura Learning for educational books, videos, search, profiles, announcements, support, and learning resources.">
    <meta property="og:image" content="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://aura.auralearning.workers.dev/">
    <meta property="og:site_name" content="Aura Learning">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Aura Learning – Education & Learning App">
    <meta name="twitter:description" content="Explore Aura Learning for educational books, videos, search, profiles, announcements, support, and learning resources.">
    <meta name="twitter:image" content="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    
    `
);

// Replace structured data
html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aura Learning",
  "url": "https://aura.auralearning.workers.dev/",
  "description": "Aura Learning is an education and learning platform for books, educational videos, search, profiles, announcements, support, and useful learning resources.",
  "image": "https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg"
}
</script>
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Aura Learning",
  "url": "https://aura.auralearning.workers.dev/",
  "logo": "https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg"
}
</script>`
);

html = html.replace(
    /<title>.*?<\/title>/s,
    `<title>Aura Learning – Education & Learning App</title>`
);

html = html.replace(
    /<meta name="description" content="[^"]*">/s,
    `<meta name="description" content="Aura Learning is an education and learning platform for books, educational videos, search, profiles, announcements, support, and useful learning resources.">`
);

html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/s,
    `<link rel="canonical" href="https://aura.auralearning.workers.dev/">`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success index.html");
