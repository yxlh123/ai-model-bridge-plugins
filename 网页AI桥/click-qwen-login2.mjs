import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const q = ctx.pages().find(p => p.url().includes('chat.qwen.ai'));
if (!q) { console.log('no qwen page'); process.exit(0); }
await q.bringToFront();

const els = await q.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('button, a, div, span')) {
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if ((t === '登录' || t === '注册') && r.width > 0 && r.height > 0) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), text: t, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], href: el.getAttribute('href') || '' });
    }
  }
  return out;
});
console.log('ELs:', JSON.stringify(els, null, 1));

for (const e of els) {
  const [x, y, w, h] = e.rect;
  await q.mouse.click(x + w / 2, y + h / 2);
  await q.waitForTimeout(2500);
  const u = q.url();
  const txt = await q.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
  console.log('click', e.text, '-> url:', u, 'text:', JSON.stringify(txt.slice(0, 120)));
  if (/auth|login|signin/i.test(u)) break;
}
process.exit(0);
