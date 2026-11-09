import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url().slice(0, 80)).join('\n'));
let q = pages.find(p => p.url().includes('chat.qwen.ai'));
if (!q) { q = await ctx.newPage(); await q.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 }); await q.waitForTimeout(4000); }
await q.bringToFront();
const txt = await q.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
const logged = !/登录/.test(txt);
console.log('logged in:', logged);
if (!logged) {
  const btn = q.locator('button:has-text("登录")').first();
  if (await btn.count()) {
    await btn.click({ timeout: 8000 }).catch(e => console.log('click err:', e.message));
    await q.waitForTimeout(3500);
  }
  const txt2 = await q.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
  console.log('AFTER CLICK:', JSON.stringify(txt2));
}
await q.screenshot({ path: 'qwen-9333.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
