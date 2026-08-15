const fs = require('fs');
let html = fs.readFileSync('updates.html', 'utf8');

const oldLogo = 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/IMG_20260702_103051.png';
const newLogo = 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg';

// Replace exact matches of old logo
html = html.replace(new RegExp(oldLogo.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newLogo);

// Update title and meta description just in case, though the prompt mainly focused on the main site.
// Let's at least ensure the favicon matches.
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

// Update img alt text to "Aura Learning official logo"
html = html.replace(/alt="Aura Learning Logo"/g, 'alt="Aura Learning official logo"');

fs.writeFileSync('updates.html', html, 'utf8');
console.log("Success updates.html patch");
