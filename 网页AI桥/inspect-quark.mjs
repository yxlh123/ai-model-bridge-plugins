import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const pages = ctx.pages();

const dataPage = pages.find(p => p.url() === 'http://data/');
const memberPage = pages.find(p => p.url().includes('member.html'));
const blank = pages.find(p => p.url() === 'about:blank');

if (dataPage) {
  await dataPage.goto('https://www.quark.cn/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('goto err:', e.message));
  await dataPage.waitForTimeout(3000);
  console.log('data page now:', dataPage.url());
  await dataPage.screenshot({ path: 'quark-home.png', timeout: 20000 }).catch(e => console.log('shot err:', e.message));
  const txt = await dataPage.evaluate(() => document.body.innerText.slice(0, 800)).catch(() => '');
  console.log('HOME TEXT:', JSON.stringify(txt));
}

if (memberPage) {
  try {
    await memberPage.bringToFront();
    await memberPage.waitForTimeout(500);
    await memberPage.screenshot({ path: 'quark-member.png', timeout: 15000 });
    console.log('member shot ok');
    const txt = await memberPage.evaluate(() => document.body.innerText.slice(0, 800)).catch(() => '');
    console.log('MEMBER TEXT:', JSON.stringify(txt));
  } catch (e) { console.log('member err:', e.message); }
}

process.exit(0);
