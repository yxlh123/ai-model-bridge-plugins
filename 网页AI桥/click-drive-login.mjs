import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages now:', pages.map(p => p.url().slice(0, 80)).join('\n'));

const drive = pages.find(p => p.url().includes('clouddrive/renderer/index.html'));
if (drive) {
  await drive.bringToFront();
  await drive.waitForTimeout(800);
  const btn = drive.locator('.member-login').first();
  const cnt = await btn.count().catch(() => 0);
  console.log('login button count:', cnt);
  if (cnt) {
    await btn.click({ timeout: 8000 }).catch(e => console.log('click err:', e.message));
    await drive.waitForTimeout(4000);
  }
  const txt = await drive.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('DRIVE AFTER:', JSON.stringify(txt));
  const modal = await drive.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('div, img, canvas, iframe')) {
      const r = el.getBoundingClientRect();
      const cls = (el.className || '').toString();
      if (r.width > 100 && r.height > 100 && /login|modal|dialog|qrcode|qr/i.test(cls)) {
        out.push({ tag: el.tagName, cls: cls.slice(0, 80), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
      }
    }
    return out.slice(0, 20);
  });
  console.log('MODALS:', JSON.stringify(modal));
}
process.exit(0);
