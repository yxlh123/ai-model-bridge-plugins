import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();

let target = pages.find(p => /www\.quark\.cn/.test(p.url())) || pages.find(p => p.url() === 'about:blank') || pages.find(p => p.url().startsWith('chrome-error'));
console.log('target:', target?.url());
if (target) {
  await target.bringToFront();
  await target.goto('https://pan.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await target.waitForTimeout(6000);
  console.log('now:', target.url());
  const txt = await target.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
  console.log('PAN TEXT:', JSON.stringify(txt));
  const btns = await target.evaluate(() => {
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
  console.log('LOGIN BTNS:', JSON.stringify(btns));
  await target.screenshot({ path: 'pan-home.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
}
process.exit(0);
