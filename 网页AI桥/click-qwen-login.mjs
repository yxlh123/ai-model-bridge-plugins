import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const q = ctx.pages().find(p => p.url().includes('chat.qwen.ai'));
if (!q) { console.log('no qwen page'); process.exit(0); }
await q.bringToFront();
await q.mouse.click(350, 30);
await q.waitForTimeout(4000);
const txt = await q.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
console.log('AFTER LOGIN CLICK:', JSON.stringify(txt));
const imgs = await q.evaluate(() => [...document.querySelectorAll('img, canvas, iframe')].filter(e => e.offsetWidth > 50).map(e => ({ tag: e.tagName, src: (e.src || '').slice(0, 100), w: e.offsetWidth, h: e.offsetHeight })));
console.log('IMGS:', JSON.stringify(imgs));
const inputs = await q.evaluate(() => [...document.querySelectorAll('input, textarea')].filter(e => e.offsetWidth).map(e => ({ tag: e.tagName, type: e.getAttribute('type') || '', ph: e.getAttribute('placeholder') || '' })));
console.log('INPUTS:', JSON.stringify(inputs));
process.exit(0);
