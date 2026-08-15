const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newHead = `<title>Aura Learning — Education Hub</title>
    
    <!-- Favicon & PWA App Icons -->
    <link rel="icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="shortcut icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="apple-touch-icon" href="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#4F46E5">
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Aura Learning is an education hub for discovering educational books, videos and learning resources.">
    <meta name="keywords" content="Aura Learning, Aura Learning App, Aura Learning APK, Education App, Study App, PDF Reader, Learning Platform, APKPure">
    <meta name="author" content="Aura Learning">
    <link rel="canonical" href="https://aura.auralearning.workers.dev/">
    <meta name="google-site-verification" content="-2Tur20XsdLaKQOp1LHz2J8Cgc2eF3FYYAZjBcdPt4s" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="Aura Learning — Education Hub">
    <meta property="og:description" content="Aura Learning is an education hub for discovering educational books, videos and learning resources.">
    <meta property="og:image" content="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://aura.auralearning.workers.dev/">
    <meta property="og:site_name" content="Aura Learning">
    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Aura Learning — Education Hub">
    <meta name="twitter:description" content="Aura Learning is an education hub for discovering educational books, videos and learning resources.">
    <meta name="twitter:image" content="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg">
    
    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aura Learning",
  "alternateName": "Aura Learning Education Hub",
  "url": "https://aura.auralearning.workers.dev/"
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
</script>`;

html = html.replace(/<title>Aura Learning – Education & Learning App<\/title>[\s\S]*?<\/script>\n    <script type="application\/ld\+json">\n\{\n  "@context": "https:\/\/schema\.org",\n  "@type": "Organization",\n  "name": "Aura Learning",\n  "url": "https:\/\/aura\.auralearning\.workers\.dev\/",\n  "logo": "https:\/\/qxoqflrqpwlythgqmjtq\.supabase\.co\/storage\/v1\/object\/public\/covers\/website_1783850788360\.jpg"\n\}\n<\/script>/, newHead);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Replaced");
