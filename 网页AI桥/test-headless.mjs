import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile = path.join(process.cwd(), 'edge-profile');

const ctx = await chromium.launchPersistentContext(profile, {
  executablePath: EDGE,
  headless: true,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => console.log('goto err:', e.message));
await page.waitForTimeout(6000);
const txt = await page.evaluate(() => document.body.innerText.slice(0, 250)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
console.log('logged in:', !/登录/.test(txt));

// 发消息
const ta = page.locator('textarea').first();
await ta.waitFor({ timeout: 15000 }).catch(e => console.log('ta err:', e.message));
await ta.fill('用一句话介绍你自己');
await page.waitForTimeout(500);
await ta.press('Enter');

let ans = '';
let stable = 0;
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(1500);
  const t = await page.evaluate(() => {
    const els = document.querySelectorAll('.qwen-chat-message-assistant .qwen-markdown');
    if (!els.length) return '';
    return els[els.length - 1].innerText;
  }).catch(() => '');
  if (t && t.length > 3) {
    if (t === ans) { stable++; if (stable >= 3) break; }
    else { ans = t; stable = 0; }
  }
}
console.log('ANSWER:', JSON.stringify(ans));
await ctx.close();
