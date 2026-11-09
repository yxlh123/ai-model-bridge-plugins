import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url().slice(0, 80)).join('\n'));

let q = pages.find(p => p.url().includes('chat.qwen.ai'));
if (!q) { console.log('no qwen page'); process.exit(0); }
await q.bringToFront();
await q.waitForTimeout(2000);
const txt = await q.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
const logged = !/登录/.test(txt) || !/验证码/.test(txt);
console.log('logged in:', logged);
if (!logged) process.exit(0);

// 找到输入框并发送测试消息
const ta = q.locator('textarea').first();
await ta.waitFor({ timeout: 15000 }).catch(e => console.log('ta err:', e.message));
await ta.fill('用一句话介绍你自己');
await q.waitForTimeout(500);
await ta.press('Enter');
console.log('sent, waiting for answer...');

let last = '';
for (let i = 0; i < 30; i++) {
  await q.waitForTimeout(2000);
  const body = await q.evaluate(() => document.body.innerText).catch(() => '');
  // 抓最后的消息块
  const info = await q.evaluate(() => {
    const cands = [];
    for (const el of document.querySelectorAll('div')) {
      const cls = (el.className || '').toString();
      if (/markdown|assistant|answer|message-content|chat-message/i.test(cls) && el.offsetWidth > 0) {
        cands.push({ cls: cls.slice(0, 100), text: (el.innerText || '').slice(0, 300) });
      }
    }
    return cands.slice(-8);
  }).catch(() => []);
  if (i % 3 === 0) console.log('t=' + ((i + 1) * 2) + 's cands:', JSON.stringify(info));
  const sent = await q.evaluate(() => {
    const b = document.querySelector('textarea');
    return b ? b.value : '';
  }).catch(() => '');
  if (!sent && info.length && i > 2) {
    // 也许回复中
  }
  await q.screenshot({ path: 'qwen-chat-test.png', timeout: 5000 }).catch(() => {});
  if (i % 5 === 4) {
    console.log('--- body tail ---');
    console.log(body.slice(-600));
  }
}
console.log('final body tail:', (await q.evaluate(() => document.body.innerText).catch(() => '')).slice(-800));
process.exit(0);
