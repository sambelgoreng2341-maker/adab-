const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const response = await fetch\(\`\$\{API_URL\}\?_t=\$\{Date\.now\(\)\}\`, \{[\s\S]*?redirect: 'follow'\s*\}\);/,
  `const response = await fetch(API_URL, {
        method: 'POST',
        body: bodyStr,
        redirect: 'follow'
      });`
);

fs.writeFileSync(file, code);
