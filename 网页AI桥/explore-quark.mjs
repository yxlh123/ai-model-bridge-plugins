import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.length);
for (const p of pages) {
  console.log('-', p.url(), '|', await p.title().catch(() => ''));
}
const page = pages[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(7000);
console.log('QWEN URL:', page.url());
console.log('QWEN BODY:', (await page.evaluate(() => document.body.innerText)).slice(0, 500));
await page.screenshot({ path: 'quark-qwen.png' });
// do not close the browser we are attached to
