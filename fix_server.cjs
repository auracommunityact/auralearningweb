const fs = require('fs');
let serverTs = fs.readFileSync('server.ts', 'utf8');

serverTs = serverTs.replace(
    "/<title>Aura Learning – Learn Anytime, Anywhere<\\/title>/",
    "/<title>.*?<\\/title>/"
);

fs.writeFileSync('server.ts', serverTs, 'utf8');
