import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url().slice(0, 70)).join('\n'));

let q = pages.find(p => p.url().includes('chat.qwen.ai'));
if (!q) {
  q = await ctx.newPage();
  await q.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await q.waitForTimeout(5000);
}
const txt = await q.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
const loggedIn = !/登录/.test(txt) && !/注册/.test(txt);
console.log('logged in:', loggedIn);
if (!loggedIn) {
  // 找登录按钮坐标
  const btn = await q.evaluate(() => {
    for (const el of document.querySelectorAll('button, a, div, span')) {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (t === '登录' && r.width > 0) return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    }
    return null;
  });
  console.log('login btn:', JSON.stringify(btn));
  await q.screenshot({ path: 'qwen-login-state.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
}
process.exit(0);
