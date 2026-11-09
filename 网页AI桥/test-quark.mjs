import { chromium } from 'playwright-core';
import path from 'node:path';

const QUARK = 'D:\\夸克\\Quark\\quark.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'quark-test-profile'), {
  executablePath: QUARK,
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);
console.log('URL:', page.url());
console.log('TITLE:', await page.title());
console.log('BODY:', (await page.evaluate(() => document.body.innerText)).slice(0, 400));
await page.screenshot({ path: path.join(process.cwd(), 'quark-test.png') });
await ctx.close();
