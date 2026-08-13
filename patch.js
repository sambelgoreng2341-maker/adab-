const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /const response = await fetch\(API_URL, \{[\s\S]*?redirect: 'follow'\s*\}\);/,
  `const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: bodyStr,
        redirect: 'follow'
      });`
);
fs.writeFileSync('server.ts', code);
