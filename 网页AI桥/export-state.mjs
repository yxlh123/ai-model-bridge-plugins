import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const state = await ctx.storageState({ path: 'qwen-state.json' });
console.log('cookies:', state.cookies.length, 'origins:', state.origins.length);
for (const o of state.origins) console.log('origin:', o.origin, 'keys:', o.localStorage.map(x => x.name).join(','));
process.exit(0);
