import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url().slice(0, 90)).join('\n'));

const p = await ctx.newPage();
await p.goto('https://pan.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
await p.waitForTimeout(6000);
console.log('url:', p.url());
const txt = await p.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
const btns = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('a, button, div, span')) {
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if (/^(登录|立即登录|登录\/注册)$/.test(t) && r.width > 0 && r.height > 0) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), text: t, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
    }
  }
  return out;
});
console.log('BTNS:', JSON.stringify(btns));
await p.screenshot({ path: 'pan-home.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
