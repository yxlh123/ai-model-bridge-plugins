import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();

const errPage = pages.find(p => p.url().startsWith('chrome-error'));
console.log('err page:', errPage?.url());
if (errPage) {
  await errPage.bringToFront();
  await errPage.goto('https://www.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await errPage.waitForTimeout(4000);
  console.log('now:', errPage.url());
  await errPage.screenshot({ path: 'quark-home.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
  const txt = await errPage.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
  console.log('HOME TEXT:', JSON.stringify(txt));
  const els = await errPage.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a, button, div, span')) {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (/^(登录|立即登录|登录\/注册)$/.test(t) && r.width > 0 && r.height > 0) {
        out.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), text: t, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] });
      }
    }
    return out;
  });
  console.log('LOGIN:', JSON.stringify(els));
  if (els.length) {
    const b = els[0].rect;
    await errPage.mouse.click(b[0] + b[2] / 2, b[1] + b[3] / 2);
    await errPage.waitForTimeout(4000);
    console.log('after click url:', errPage.url());
    const txt2 = await errPage.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
    console.log('AFTER CLICK TEXT:', JSON.stringify(txt2));
    await errPage.screenshot({ path: 'quark-login.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
  }
}
process.exit(0);
