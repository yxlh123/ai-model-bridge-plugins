import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA = path.join(process.cwd(), 'edge-profile');

const ctx = await chromium.launchPersistentContext(USER_DATA, {
  executablePath: EDGE,
  headless: false,
  viewport: { width: 1280, height: 800 },
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
try {
  await page.goto('https://chat.qwen.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
} catch (e) {
  console.log('goto error:', e.message);
}
await page.waitForTimeout(8000);
console.log('URL:', page.url());
console.log('TITLE:', await page.title());

const info = await page.evaluate(() => {
  const pick = (el) => ({
    tag: el.tagName,
    id: el.id || '',
    cls: (el.className || '').toString().slice(0, 120),
    placeholder: el.getAttribute('placeholder') || '',
    aria: el.getAttribute('aria-label') || '',
    text: (el.innerText || '').slice(0, 80),
    visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
  });
  const editable = [...document.querySelectorAll('textarea, [contenteditable="true"], input[type="text"]')].map(pick);
  const buttons = [...document.querySelectorAll('button')].map(pick).filter(b => b.visible);
  return { editable, buttons, bodyText: document.body.innerText.slice(0, 600) };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: path.join(process.cwd(), 'probe.png'), fullPage: false });
await ctx.close();
