import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = Number(process.env.WEBQWEN_PORT || 18765);
const PROFILE = process.env.WEBQWEN_PROFILE || path.join(process.cwd(), 'edge-profile');
const MODEL = process.env.WEBQWEN_MODEL || 'qwen3.7-plus';

let browser = null;
let page = null;
let ready = false;
let queue = Promise.resolve();

async function ensureBrowser() {
  if (browser) return;
  browser = await chromium.launchPersistentContext(PROFILE, {
    executablePath: EDGE,
    headless: true,
    viewport: { width: 1280, height: 900 },
  });
  page = browser.pages()[0] ?? (await browser.newPage());
  await page.goto('https://chat.qwen.ai/', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForSelector('textarea', { timeout: 30000 }).catch(() => {});
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1500);
    const t = await page.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
    if (/新建对话|QwenUser/.test(t)) break;
    if (/验证码登录/.test(t)) break;
  }
  ready = true;
  const t = await page.evaluate(() => document.body.innerText.slice(0, 200)).catch(() => '');
  console.log('[webqwen] browser ready, page:', JSON.stringify(t));
}

async function isLoggedIn() {
  const t = await page.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => '');
  if (/验证码登录/.test(t)) return false;
  if (/QwenUser|新建对话/.test(t)) return true;
  return !/登录/.test(t);
}

async function newChat() {
  const btn = page.locator('button', { hasText: '新建对话' }).first();
  if (await btn.count()) {
    await btn.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }
}

function buildPrompt(messages) {
  const sys = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
  const convo = messages.filter((m) => m.role !== 'system');
  if (!sys && convo.length <= 1) {
    const c = convo[0]?.content;
    return typeof c === 'string' ? c : JSON.stringify(c);
  }
  const parts = [];
  if (sys) parts.push('[系统指令]\n' + sys);
  for (const m of convo) {
    const c = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    parts.push((m.role === 'user' ? '[用户]' : '[助手]') + '\n' + c);
  }
  return parts.join('\n\n');
}

async function ask(prompt) {
  await ensureBrowser();
  if (!(await isLoggedIn())) throw new Error('NOT_LOGGED_IN');
  await newChat();
  const ta = page.locator('textarea').first();
  await ta.waitFor({ timeout: 15000 });
  await page.evaluate((t) => {
    const el = document.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, t);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, prompt);
  await page.waitForTimeout(400);
  const val = await ta.inputValue().catch(() => '');
  console.log('[webqwen] fill value:', JSON.stringify(val.slice(0, 40)));
  await ta.focus().catch(() => {});
  await page.waitForTimeout(150);
  await ta.press('Enter');
  await page.waitForTimeout(1500);
  const lastUser = await page
    .evaluate(() => {
      const els = document.querySelectorAll('.qwen-chat-message-user');
      return els.length ? els[els.length - 1].innerText : '';
    })
    .catch(() => '');
  console.log('[webqwen] last user:', JSON.stringify(lastUser.slice(0, 60)));

  let ans = '';
  let stable = 0;
  const start = Date.now();
  while (Date.now() - start < 180000) {
    await page.waitForTimeout(1500);
    const t = await page
      .evaluate(() => {
        const els = document.querySelectorAll('.qwen-chat-message-assistant .qwen-markdown');
        return els.length ? els[els.length - 1].innerText : '';
      })
      .catch(() => '');
    if (t && t.length > 0) {
      if (t === ans) {
        stable++;
        if (stable >= 3) break;
      } else {
        ans = t;
        stable = 0;
      }
    }
  }
  if (!ans) throw new Error('NO_ANSWER');
  return ans;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }
  if (req.url === '/health') {
    let logged = false;
    try {
      if (ready) logged = await isLoggedIn();
    } catch {}
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, ready, loggedIn: logged, model: MODEL }));
  }
  if (req.url === '/v1/models') {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ object: 'list', data: [{ id: MODEL, object: 'model', owned_by: 'qwen-web' }] }));
  }
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      res.writeHead(400, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: { message: 'bad json' } }));
    }
    const messages = Array.isArray(body.messages) ? body.messages : [];
    try {
      const prompt = buildPrompt(messages);
      const answer = await (queue = queue.then(() => ask(prompt)).catch((e) => { throw e; }));
      const payload = {
        id: 'chatcmpl-webqwen-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: MODEL,
        choices: [{ index: 0, message: { role: 'assistant', content: answer }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(payload));
    } catch (e) {
      const code = /NOT_LOGGED_IN/.test(e.message) ? 401 : 500;
      res.writeHead(code, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: { message: e.message, type: 'webqwen_error' } }));
    }
  }
  res.writeHead(404, { ...cors, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => console.log('[webqwen] bridge listening on ' + PORT));

process.on('SIGINT', async () => {
  try { await browser?.close(); } catch {}
  process.exit(0);
});
