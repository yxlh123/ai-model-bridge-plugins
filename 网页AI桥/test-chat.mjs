import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-profile'), {
  executablePath: EDGE,
  headless: false,
  viewport: { width: 1280, height: 800 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(5000);

const ta = page.locator('textarea.message-input-textarea');
await ta.fill('用一句话介绍你自己');
await page.waitForTimeout(300);
await ta.press('Enter');
await page.waitForTimeout(4000);

const info = await page.evaluate(() => {
  const body = document.body.innerText;
  const nodes = [];
  const all = [...document.querySelectorAll('div')];
  for (const el of all) {
    const cls = (el.className || '').toString();
    if (/message|markdown|assistant|response|chat-item/i.test(cls)) {
      nodes.push({ cls: cls.slice(0, 160), text: (el.innerText || '').slice(0, 200), visible: !!(el.offsetWidth || el.offsetHeight) });
    }
  }
  return { body: body.slice(0, 1200), nodes: nodes.slice(0, 30) };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: path.join(process.cwd(), 'chat.png') });
await ctx.close();
