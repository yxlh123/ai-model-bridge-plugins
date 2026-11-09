import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();

const drive = pages.find(p => p.url().includes('clouddrive/renderer/index.html'));
console.log('drive url:', drive?.url());
if (drive) {
  await drive.bringToFront();
  await drive.waitForTimeout(1000);
  await drive.screenshot({ path: 'quark-drive.png', timeout: 15000 }).catch(e => console.log('shot err:', e.message));
  const txt = await drive.evaluate(() => document.body.innerText.slice(0, 700)).catch(() => '');
  console.log('DRIVE TEXT:', JSON.stringify(txt));
  const acc = await drive.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('div, span, img, button')) {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (/登录|头像|会员|VIP|我的|账号/.test(t) || /avatar/i.test((el.className || '').toString()))) {
        out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), text: t.slice(0, 30), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
      }
    }
    return out.slice(0, 20);
  });
  console.log('ACC:', JSON.stringify(acc));
}

const sidebar = pages.find(p => p.url().includes('quark-ai-siderbar'));
if (sidebar) {
  await sidebar.waitForTimeout(500);
  const txt = await sidebar.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
  console.log('SIDEBAR TEXT:', JSON.stringify(txt));
}

process.exit(0);
