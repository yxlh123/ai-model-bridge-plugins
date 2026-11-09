import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const member = pages.find(p => p.url().includes('member.html'));
console.log('member url:', member?.url());
if (member) {
  const info = await member.evaluate(() => {
    const body = document.body.innerText;
    const imgs = [...document.querySelectorAll('img, canvas, iframe')].map(e => ({ tag: e.tagName, src: (e.src || '').slice(0, 120), w: e.offsetWidth, h: e.offsetHeight, visible: !!(e.offsetWidth || e.offsetHeight) }));
    const inputs = [...document.querySelectorAll('input, textarea, button')].filter(e => e.offsetWidth).map(e => ({ tag: e.tagName, type: e.getAttribute('type') || '', ph: e.getAttribute('placeholder') || '', text: (e.textContent || '').slice(0, 30) }));
    return { body: body.slice(0, 500), imgs, inputs, htmlLen: document.documentElement.outerHTML.length };
  });
  console.log(JSON.stringify(info, null, 2));
  await member.screenshot({ path: 'member-now.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
}
process.exit(0);
