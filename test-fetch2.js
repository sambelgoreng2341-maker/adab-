const API_URL = 'https://script.google.com/macros/s/AKfycby0kWcycE3LXmehymFdlpQ0X0aS_A-L1sl6WxuGKHZGsI35ODpFqKNYUiyyXuNTzFyD/exec';
fetch(`${API_URL}?action=getData`, {
  headers: {
    'Accept': 'application/json'
  }
})
  .then(r => r.text())
  .then(t => console.log(t.substring(0, 50)))
  .catch(e => console.error(e));
