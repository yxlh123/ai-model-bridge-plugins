import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-profile'), {
  executablePath: EDGE,
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
const ta = page.locator('textarea.message-input-textarea');
await ta.waitFor({ state: 'visible', timeout: 60000 });
await page.waitForTimeout(6000);
console.log('BEFORE:', JSON.stringify((await page.evaluate(() => document.body.innerText)).slice(0, 300)));

await ta.click();
await ta.fill('用一句话介绍你自己');
await page.waitForTimeout(500);
await ta.press('Enter');
console.log('sent, waiting...');

for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(2500);
  const t = await page.evaluate(() => document.body.innerText);
  console.log(`t=${(i + 1) * 2.5}s len=${t.length} head=${JSON.stringify(t.slice(0, 160))}`);
  if (t.includes('Qwen3') && t.split('\n').length > 6) break;
}
await page.screenshot({ path: path.join(process.cwd(), 'chat2.png'), fullPage: true });
const nodes = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('div[class*="message"], div[class*="markdown"], div[class*="chat-item"], div[class*="response"]')) {
    const cls = (el.className || '').toString();
    const t = (el.innerText || '').slice(0, 150);
    if (t.trim()) out.push({ cls: cls.slice(0, 100), text: t });
  }
  return out.slice(0, 40);
});
console.log(JSON.stringify(nodes, null, 2));
await ctx.close();
