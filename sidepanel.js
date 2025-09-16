const frame = document.getElementById('chatFrame');
const setSrc = (url) => { if (url) frame.src = url; };
const extractSrc = (text) => {
  const match = text.match(/<iframe[^>]*src=["']([^"']+)["']/i);
  return match ? match[1] : '';
};
const url = chrome.runtime.getURL('Ïndex.html');
fetch(url).then(r => r.text()).then(t => setSrc(extractSrc(t))).catch(() => {});


