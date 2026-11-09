import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const p = await ctx.newPage();
await p.goto('https://p.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
await p.waitForTimeout(6000);
console.log('url:', p.url());
const txt = await p.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
await p.screenshot({ path: 'pquark.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
const btns = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('a, button, div, span')) {
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if (/登录|立即登录/.test(t) && t.length < 12 && r.width > 0 && r.height > 0) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), text: t, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
    }
  }
  return out.slice(0, 10);
});
console.log('BTNS:', JSON.stringify(btns));
process.exit(0);
