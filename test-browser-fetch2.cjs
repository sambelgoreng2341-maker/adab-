async function run() {
  const url = 'https://script.google.com/macros/s/AKfycby0kWcycE3LXmehymFdlpQ0X0aS_A-L1sl6WxuGKHZGsI35ODpFqKNYUiyyXuNTzFyD/exec?action=getData';
  
  const headers = {
    'Accept': '*/*',
    'Origin': 'https://ais-pre-3lg474vslqc5vptr3anjfs-730888781739.asia-southeast1.run.app',
    'Referer': 'https://ais-pre-3lg474vslqc5vptr3anjfs-730888781739.asia-southeast1.run.app/',
    'User-Agent': 'Mozilla/5.0'
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
