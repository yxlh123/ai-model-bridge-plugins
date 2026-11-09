import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const sb = pages.find(p => p.url().includes('quark-ai-siderbar'));
console.log('sidebar:', sb?.url());
if (!sb) process.exit(0);
await sb.bringToFront();

const before = await sb.evaluate(() => document.body.innerText.slice(0, 300));
console.log('BEFORE:', JSON.stringify(before));

const ta = sb.locator('textarea').first();
await ta.waitFor({ timeout: 10000 }).catch(e => console.log('ta wait err:', e.message));
await ta.fill('用一句话介绍你自己');
await sb.waitForTimeout(300);
await ta.press('Enter');
console.log('sent');

let ans = '';
for (let i = 0; i < 24; i++) {
  await sb.waitForTimeout(1500);
  const t = await sb.evaluate(() => {
    const el = document.querySelector('.chat-round.last-message-item .qk-markdown, .chat-answers-card-wrap .qk-markdown, .qk-markdown');
    return el ? el.innerText : '';
  });
  if (t && t.length > 5 && t !== ans) { ans = t; console.log('t=' + ((i + 1) * 1.5) + 's:', JSON.stringify(t.slice(0, 300))); }
  const body = await sb.evaluate(() => document.body.innerText);
  if (body.includes('登录后畅享')) { console.log('still login wall'); break; }
}
console.log('FINAL ANSWER:', JSON.stringify(ans));
await sb.screenshot({ path: 'sidebar-chat-test.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
