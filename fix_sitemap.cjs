const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

const sitemapCode = `    for (const page of mainPages) {
      const loc = page.path ? \`\${baseUrl}/\${page.path}\` : \`\${baseUrl}/\`;
      xml += \`  <url>\\n\`;
      xml += \`    <loc>\${loc}</loc>\\n\`;
      xml += \`    <lastmod>\${today}</lastmod>\\n\`;
      xml += \`    <changefreq>\${page.changefreq}</changefreq>\\n\`;
      xml += \`    <priority>\${page.priority}</priority>\\n\`;
      xml += \`  </url>\\n\`;
    }

    // Add Aura Learning Official Guide PDF
    xml += \`  <url>\\n\`;
    xml += \`    <loc>https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/books/Aura-Learning-Guide.pdf</loc>\\n\`;
    xml += \`    <lastmod>\${today}</lastmod>\\n\`;
    xml += \`    <changefreq>monthly</changefreq>\\n\`;
    xml += \`    <priority>0.9</priority>\\n\`;
    xml += \`  </url>\\n\`;
`;

serverTs = serverTs.replace(
    /for \(const page of mainPages\) \{[\s\S]*?\}\n/,
    sitemapCode
);

fs.writeFileSync('server.ts', serverTs, 'utf8');
console.log("Updated sitemap in server.ts");
