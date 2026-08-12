const fetch = require('node-fetch'); // we'll use native fetch

async function run() {
  const url = 'https://script.google.com/macros/s/AKfycby0kWcycE3LXmehymFdlpQ0X0aS_A-L1sl6WxuGKHZGsI35ODpFqKNYUiyyXuNTzFyD/exec?action=getData';
  
  const headers = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site'
  };

  try {
    const res = await globalThis.fetch(url, { headers, redirect: 'follow' });
    const text = await res.text();
    console.log(text.substring(0, 300));
  } catch (e) {
    console.error(e);
  }
}
run();
