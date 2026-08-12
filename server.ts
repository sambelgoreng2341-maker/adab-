import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const API_URL = 'https://script.google.com/macros/s/AKfycby0kWcycE3LXmehymFdlpQ0X0aS_A-L1sl6WxuGKHZGsI35ODpFqKNYUiyyXuNTzFyD/exec';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use raw body parser to just forward exactly what was sent
  app.use(express.text({ type: '*/*' })); 
  app.use(express.json());

  // API proxy routes
  app.get("/api/gas/getData", async (req, res) => {
    try {
      const response = await fetch(`${API_URL}?action=getData&_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'follow'
      });
      const text = await response.text();
      res.send(text);
    } catch (e: any) {
      console.error('Error fetching data from GAS:', e);
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  app.post("/api/gas/saveRecords", async (req, res) => {
    try {
      let bodyStr = req.body;
      if (typeof bodyStr === 'object') {
         bodyStr = JSON.stringify(bodyStr);
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        body: bodyStr,
        redirect: 'follow'
      });
      const text = await response.text();
      res.send(text);
    } catch (e: any) {
      console.error('Error saving data to GAS:', e);
      res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
