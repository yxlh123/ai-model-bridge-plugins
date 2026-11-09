import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const target = pages.find(p => p.url().includes('quark-ai-siderbar'));
if (!target) { console.log('sidebar page not found'); process.exit(0); }
console.log('URL:', target.url());
console.log('TITLE:', await target.title());
const info = await target.evaluate(() => {
  const eds = [...document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')].map(el => ({
    tag: el.tagName, cls: (el.className || '').toString().slice(0, 80),
    placeholder: el.getAttribute('placeholder') || '', text: (el.innerText || '').slice(0, 60),
    visible: !!(el.offsetWidth || el.offsetHeight),
  }));
  const btns = [...document.querySelectorAll('button')].map(b => ({ text: (b.innerText || '').trim().slice(0, 40), cls: (b.className || '').toString().slice(0, 60), visible: !!(b.offsetWidth || b.offsetHeight) })).filter(b => b.visible);
  return { eds, btns: btns.slice(0, 20), body: document.body.innerText.slice(0, 600) };
});
console.log(JSON.stringify(info, null, 2));
