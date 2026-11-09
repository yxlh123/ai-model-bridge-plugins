import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const p = ctx.pages().find(x => x.url().includes('quark-ai-siderbar'));
if (!p) { console.log('sidebar not found'); process.exit(0); }

// try clicking the login prompt
const login = p.locator('text=登录后畅享完整功能').first();
if (await login.count()) {
  await login.click({ timeout: 5000 }).catch(e => console.log('click err:', e.message));
  await p.waitForTimeout(4000);
}
const txt = await p.evaluate(() => document.body.innerText);
console.log('BODY:', JSON.stringify(txt.slice(0, 800)));
const extras = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img, canvas')].map(el => ({
    tag: el.tagName, src: (el.src || '').slice(0, 120), w: el.width, h: el.height,
    visible: !!(el.offsetWidth || el.offsetHeight),
  })).filter(x => x.visible && x.w > 60);
  const inputs = [...document.querySelectorAll('input, textarea')].map(el => ({
    tag: el.tagName, type: el.getAttribute('type') || '', placeholder: el.getAttribute('placeholder') || '',
    visible: !!(el.offsetWidth || el.offsetHeight),
  })).filter(x => x.visible);
  return { imgs: imgs.slice(0, 10), inputs: inputs.slice(0, 10) };
});
console.log(JSON.stringify(extras, null, 2));
try { await p.screenshot({ path: 'sidebar-login.png', timeout: 15000 }); console.log('shot ok'); } catch (e) { console.log('shot fail:', e.message); }
process.exit(0);
