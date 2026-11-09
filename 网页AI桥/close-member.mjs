import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();

const member = pages.find(p => p.url().includes('member.html'));
if (member) {
  console.log('closing member.html');
  await member.close().catch(e => console.log('close err:', e.message));
}

const qwen = ctx.pages().find(p => p.url().includes('chat.qwen.ai'));
if (qwen) {
  await qwen.bringToFront();
  console.log('brought qwen to front');
  await qwen.waitForTimeout(1500);
  const txt = await qwen.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
  console.log('QWEN TEXT:', JSON.stringify(txt));
  await qwen.screenshot({ path: 'qwen-active.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
}
console.log('remaining pages:', ctx.pages().map(p => p.url().slice(0, 60)).join('\n'));
process.exit(0);
