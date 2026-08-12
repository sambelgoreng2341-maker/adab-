const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const headersCode = `headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },`;

code = code.replace(
  /const response = await fetch\(\`\$\{API_URL\}\?action=getData\&_t=\$\{Date\.now\(\)\}\`, \{\n        method: 'GET',\n        redirect: 'follow'\n      \}\);/,
  `const response = await fetch(\`\${API_URL}?action=getData&_t=\${Date.now()}\`, {
        method: 'GET',
        ${headersCode}
        redirect: 'follow'
      });`
);

code = code.replace(
  /const response = await fetch\(\`\$\{API_URL\}\?_t=\$\{Date\.now\(\)\}\`, \{\n        method: 'POST',\n        headers: \{\n          'Content-Type': 'text\/plain;charset=utf-8',\n        \},\n        body: bodyStr,\n        redirect: 'follow'\n      \}\);/,
  `const response = await fetch(\`\${API_URL}?_t=\${Date.now()}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: bodyStr,
        redirect: 'follow'
      });`
);

fs.writeFileSync(file, code);
