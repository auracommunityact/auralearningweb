const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /<title>.*?<\/title>/s,
    `<title>Aura Learning Official Guide – Version 1.0 | Aura Learning</title>`
);

html = html.replace(
    /<meta name="description" content="[^"]*">/s,
    `<meta name="description" content="Read and download the Aura Learning Official Guide Version 1.0 by Shaan Mohammad. Learn about the Aura Learning App, books, videos, search, profile, security, support, privacy, and more.">`
);

fs.writeFileSync('index.html', html, 'utf8');
console.log("Meta updated");
