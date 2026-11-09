import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('PAGES:');
for (const p of pages) console.log(' -', JSON.stringify(p.url()), '|', JSON.stringify(await p.title().catch(() => '')));

const target = pages.find(p => /^http:\/\/data/.test(p.url()) || (p.url() === 'http://data/'));
console.log('target found:', !!target, target?.url());
if (target) {
  await target.bringToFront();
  await target.goto('https://www.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await target.waitForTimeout(4000);
  console.log('after goto:', target.url());
  await target.screenshot({ path: 'quark-home.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
  const txt = await target.evaluate(() => document.body.innerText.slice(0, 800)).catch(() => '');
  console.log('HOME TEXT:', JSON.stringify(txt));
  const loginBtns = await target.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a, button, div, span')) {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (/登录/.test(t) && t.length < 20 && r.width > 0 && r.height > 0) {
        out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), text: t, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
      }
    }
    return out.slice(0, 15);
  });
  console.log('LOGIN ELEMENTS:', JSON.stringify(loginBtns));
}
process.exit(0);
