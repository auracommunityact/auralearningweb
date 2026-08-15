const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldLogo = 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/IMG_20260702_103051.png';
const newLogo = 'https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/covers/website_1783850788360.jpg';

html = html.replace(
    new RegExp(oldLogo.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'),
    newLogo
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Success JS img patch");
