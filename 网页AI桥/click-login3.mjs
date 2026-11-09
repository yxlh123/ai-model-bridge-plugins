import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const p = ctx.pages().find(x => x.url().includes('quark-ai-siderbar'));
if (!p) { console.log('sidebar not found'); process.exit(0); }
await p.bringToFront();
const box = await p.evaluate(() => {
  const el = [...document.querySelectorAll('div.loginCard-rFqdN')][0];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
});
console.log('box:', JSON.stringify(box));
if (box) {
  await p.mouse.click(box.x, box.y);
  await p.waitForTimeout(4000);
}
console.log('BODY:', JSON.stringify((await p.evaluate(() => document.body.innerText)).slice(0, 500)));
const loginEls = await p.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('div, a, button, span')) {
    const t = (el.textContent || '').trim();
    const r = el.getBoundingClientRect();
    if (t.length < 40 && /登录|扫码|手机号|验证码/.test(t) && r.width > 0) {
      out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), text: t.slice(0, 40), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
    }
  }
  return out.slice(0, 25);
});
console.log(JSON.stringify(loginEls, null, 2));
try { await p.screenshot({ path: 'sidebar-login3.png', timeout: 15000 }); console.log('shot ok'); } catch (e) { console.log('shot fail:', e.message); }
process.exit(0);
