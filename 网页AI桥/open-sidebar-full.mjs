import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
// 关掉刚才那个白屏的新标签
for (const p of pages) {
  if (p.url() === 'https://p.quark.cn/quark-ai-siderbar/index?entry=frame&entry_l2=up_right&type=website') {
    await p.close().catch(() => {});
  }
}
const p = await ctx.newPage();
await p.goto('https://p.quark.cn/quark-ai-siderbar/index?entry=frame&tab_id=1831217370&entry_l2=up_right&type=website', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
await p.waitForTimeout(7000);
console.log('url:', p.url());
const txt = await p.evaluate(() => document.body.innerText.slice(0, 600)).catch(() => '');
console.log('TEXT:', JSON.stringify(txt));
await p.screenshot({ path: 'sidebar-full.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
process.exit(0);
