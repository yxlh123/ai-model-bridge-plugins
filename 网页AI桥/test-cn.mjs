import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-profile'), {
  executablePath: EDGE,
  headless: true,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 });
await page.waitForSelector('textarea', { timeout: 30000 });
await page.waitForTimeout(3000);

async function setText(text) {
  await page.evaluate((t) => {
    const ta = document.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, t);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
}

await setText('用一句话介绍你自己');
await page.waitForTimeout(500);
const v = await page.evaluate(() => document.querySelector('textarea').value);
console.log('value:', JSON.stringify(v), 'len:', v.length);
await page.locator('textarea').first().press('Enter');
await page.waitForTimeout(2000);
const lu = await page.evaluate(() => {
  const els = document.querySelectorAll('.qwen-chat-message-user');
  return els.length ? els[els.length - 1].innerText : '';
});
console.log('last user:', JSON.stringify(lu));

let ans = '', stable = 0;
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(1500);
  const t = await page.evaluate(() => {
    const els = document.querySelectorAll('.qwen-chat-message-assistant .qwen-markdown');
    return els.length ? els[els.length - 1].innerText : '';
  }).catch(() => '');
  if (t && t.length > 3) { if (t === ans) { if (++stable >= 3) break; } else { ans = t; stable = 0; } }
}
console.log('ANSWER:', JSON.stringify(ans));
await ctx.close();
