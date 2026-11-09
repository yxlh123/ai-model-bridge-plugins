import { chromium } from 'playwright-core';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-profile'), {
  executablePath: EDGE,
  headless: true,
  viewport: { width: 1280, height: 900 },
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 });
for (let i = 0; i < 5; i++) {
  await page.waitForTimeout(2000);
  const t = await page.evaluate(() => document.body.innerText.slice(0, 250)).catch(() => '');
  console.log('t=' + ((i + 1) * 2) + 's:', JSON.stringify(t));
  if (!/登录/.test(t) && t.length > 20) break;
}
await ctx.close();
