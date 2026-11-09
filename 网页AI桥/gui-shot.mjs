import { chromium } from 'playwright-core';
import crypto from 'node:crypto';
import path from 'node:path';

const secretB64 = '-PiLo4jDr_H3vExJysLOv6mpaqHWkLGaGPkGWmIdggQ';
const secret = Buffer.from(secretB64.replace(/-/g, '+').replace(/_/g, '/') + '=', 'base64');
console.log('secret bytes:', secret.length);

const authority = '127.0.0.1:49706';
const name = 'dsh-auth-' + crypto.createHash('sha256').update(authority).digest('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const now = Date.now();
const payload = { version: 1, authority, issuedAt: now, expiresAt: now + 24 * 3600 * 1000 };
const body = Buffer.from(JSON.stringify(payload)).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const sig = crypto.createHmac('sha256', secret).update(body).digest('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const value = `v1.${body}.${sig}`;
console.log('cookie name:', name);

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ctx = await chromium.launchPersistentContext(path.join(process.cwd(), 'edge-gui'), {
  executablePath: EDGE,
  headless: true,
  viewport: { width: 1400, height: 900 },
});
await ctx.addCookies([{ name, value, domain: '127.0.0.1', path: '/' }]);
const page = await ctx.newPage();
const resp = await page.goto('http://127.0.0.1:49706', { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log('status:', resp.status());
await page.waitForTimeout(6000);
const info = await page.evaluate(() => ({
  title: document.title,
  text: document.body.innerText.slice(0, 1500),
  buttons: [...document.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(0, 40),
}));
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: 'gui-main.png' });
await ctx.close();
