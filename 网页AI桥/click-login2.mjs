import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const p = ctx.pages().find(x => x.url().includes('quark-ai-siderbar'));
if (!p) { console.log('sidebar not found'); process.exit(0); }

const candidates = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const t = (el.textContent || '').trim();
    if (t.length < 30 && /登录/.test(t)) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), text: t, rect: (() => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => Math.round(v)); })() });
    }
  }
  return out.slice(0, 20);
});
console.log(JSON.stringify(candidates, null, 2));

const clicked = await p.evaluate(() => {
  const els = [...document.querySelectorAll('a, button, [role="button"], span, div')];
  const el = els.find(e => /登录后畅享完整功能/.test(e.textContent || '') && e.getBoundingClientRect().width > 0);
  if (!el) return 'none';
  el.click();
  return el.tagName + '.' + (el.className || '');
});
console.log('clicked:', clicked);
await p.waitForTimeout(5000);
console.log('BODY:', JSON.stringify((await p.evaluate(() => document.body.innerText)).slice(0, 600)));
const ui = await p.evaluate(() => ({
  inputs: [...document.querySelectorAll('input, textarea')].filter(e => e.offsetWidth).map(e => ({ tag: e.tagName, type: e.getAttribute('type') || '', ph: e.getAttribute('placeholder') || '', cls: (e.className || '').toString().slice(0, 60) })),
  imgs: [...document.querySelectorAll('img, canvas')].filter(e => e.offsetWidth > 60).map(e => ({ tag: e.tagName, src: (e.src || '').slice(0, 100), w: e.width, h: e.height })),
  iframes: [...document.querySelectorAll('iframe')].map(f => ({ src: (f.src || '').slice(0, 120), w: f.offsetWidth, h: f.offsetHeight })),
}));
console.log(JSON.stringify(ui, null, 2));
try { await p.screenshot({ path: 'sidebar-login2.png', timeout: 15000 }); console.log('shot ok'); } catch (e) { console.log('shot fail:', e.message); }
process.exit(0);
