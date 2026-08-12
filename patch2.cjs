const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /await fetch\(API_URL, \{/g,
  `await fetch(\`\${API_URL}?_t=\${Date.now()}\`, {`
);

fs.writeFileSync(file, code);
