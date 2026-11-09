import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-profile'), {
  executablePath: EDGE,
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => console.log('goto err:', e.message));
await page.waitForTimeout(6000);

const txt0 = await page.evaluate(() => document.body.innerText.slice(0, 300));
console.log('INITIAL:', JSON.stringify(txt0));

// 点击登录
const btn = page.locator('button:has-text("登录")').first();
if (await btn.count()) {
  await btn.click({ timeout: 8000 }).catch(e => console.log('click err:', e.message));
  await page.waitForTimeout(3500);
}
const txt1 = await page.evaluate(() => document.body.innerText.slice(0, 500));
console.log('AFTER LOGIN CLICK:', JSON.stringify(txt1));
const imgs = await page.evaluate(() => [...document.querySelectorAll('img, canvas, iframe')].filter(e => e.offsetWidth > 50).map(e => ({ tag: e.tagName, w: e.offsetWidth, h: e.offsetHeight, src: (e.src || '').slice(0, 80) })));
console.log('IMGS:', JSON.stringify(imgs));
await page.screenshot({ path: 'qwen-login-dialog.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));

// 轮询登录状态 90 秒
for (let i = 0; i < 30; i++) {
  await page.waitForTimeout(3000);
  const t = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
  const logged = !/登录/.test(t) || !/注册/.test(t);
  if (logged && !/登录/.test(t)) {
    console.log('LOGGED IN at ' + ((i + 1) * 3) + 's:', JSON.stringify(t));
    break;
  }
  if (i % 3 === 0) console.log('waiting...', i * 3 + 's', JSON.stringify(t.slice(0, 80)));
}
await page.screenshot({ path: 'qwen-after-login.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
console.log('DONE');
await ctx.close();
