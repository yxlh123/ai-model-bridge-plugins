import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
let closed = 0;
for (const p of [...pages]) {
  const u = p.url();
  const kill = (u === 'https://p.quark.cn/') || u.includes('quark-ai-siderbar') || u === 'about:blank' || u.startsWith('chrome-error');
  if (kill) {
    console.log('closing:', u.slice(0, 80));
    await p.close().catch(e => console.log('close err:', e.message));
    closed++;
  }
}
console.log('closed', closed);
const left = ctx.pages().map(p => p.url());
console.log('remaining:', JSON.stringify(left, null, 1));
process.exit(0);
