import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url()).join('\n'));
let q = pages.find(p => p.url().includes('chat.qwen.ai')) || (await ctx.newPage());
if (!q.url().includes('chat.qwen.ai')) {
  await q.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await q.waitForTimeout(5000);
}
await q.bringToFront();
const txt = await q.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
if (/登录/.test(txt) && !/验证码登录/.test(txt)) {
  const btn = q.locator('button:has-text("登录")').first();
  if (await btn.count()) {
    await btn.click({ timeout: 8000 }).catch(e => console.log('click err:', e.message));
    await q.waitForTimeout(3500);
  }
}
const txt2 = await q.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
console.log('AFTER:', JSON.stringify(txt2));
await q.screenshot({ path: 'qwen-login-form.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
