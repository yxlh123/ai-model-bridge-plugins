import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
console.log('pages:', pages.map(p => p.url().slice(0, 80)).join('\n'));

let sb = pages.find(p => p.url().includes('quark-ai-siderbar'));
if (!sb) {
  console.log('sidebar page missing, opening new tab');
  sb = await ctx.newPage();
  await sb.goto('https://p.quark.cn/quark-ai-siderbar/index?entry=frame&entry_l2=up_right&type=website', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await sb.waitForTimeout(5000);
}
console.log('sidebar url:', sb.url());
const txt = await sb.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
console.log('SIDEBAR TEXT:', JSON.stringify(txt));
const hasLogin = /登录/.test(txt);
console.log('has login prompt:', hasLogin);
await sb.screenshot({ path: 'sidebar-now.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
