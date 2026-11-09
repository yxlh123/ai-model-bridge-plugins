import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const sb = ctx.pages().find(p => p.url().includes('quark-ai-siderbar'));
if (!sb) { console.log('no sidebar'); process.exit(0); }
await sb.bringToFront();

for (let i = 0; i < 30; i++) {
  await sb.waitForTimeout(2000);
  const body = await sb.evaluate(() => document.body.innerText);
  const short = body.replace(/\s+/g, ' ').slice(0, 400);
  console.log('t=' + ((i + 1) * 2) + 's:', JSON.stringify(short));
  if (body.includes('登录后畅享')) { console.log('LOGIN WALL'); break; }
  if (!body.includes('停止') && !body.includes('■') && i > 2) {
    const hasAns = await sb.evaluate(() => {
      const els = document.querySelectorAll('.chat-round, .chat-answers-card-wrap, .qk-markdown');
      return els.length;
    });
    console.log('rounds:', hasAns);
    if (hasAns >= 2) { console.log('ANSWER LIKELY READY'); break; }
  }
}
await sb.screenshot({ path: 'sidebar-chat-test2.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
