import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const target = ctx.pages().find(p => p.url().includes('quark-ai-siderbar'));
if (!target) { console.log('sidebar not found'); process.exit(0); }
const ta = target.locator('textarea').first();
console.log('TA visible:', await ta.isVisible());
await ta.fill('用一句话介绍你自己');
await target.waitForTimeout(500);
await ta.press('Enter');
console.log('sent');
for (let i = 0; i < 10; i++) {
  await target.waitForTimeout(2500);
  const t = await target.evaluate(() => document.body.innerText);
  console.log(`t=${(i + 1) * 2.5}s len=${t.length} head=${JSON.stringify(t.slice(0, 220))}`);
  if (t.includes('Qwen') && t.length > 120) break;
}
const nodes = await target.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('div[class*="message"], div[class*="markdown"], div[class*="chat"], div[class*="answer"]')) {
    const t = (el.innerText || '').slice(0, 120);
    if (t.trim()) out.push({ cls: (el.className || '').toString().slice(0, 80), text: t });
  }
  return out.slice(0, 25);
});
console.log(JSON.stringify(nodes, null, 2));
process.exit(0);
