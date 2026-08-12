const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const response = await fetch\(`\$\{API_URL\}\?action=getData`, \{/g,
  `const response = await fetch(\`\${API_URL}?action=getData&_t=\${Date.now()}\`, {`
);

code = code.replace(
  /const result = await response.json\(\);/g,
  `const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse API response. Response was:", text.substring(0, 200));
          throw new Error("API returned invalid data (possibly HTML error page).");
        }`
);

fs.writeFileSync(file, code);
