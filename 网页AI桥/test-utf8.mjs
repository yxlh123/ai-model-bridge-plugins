const r = await fetch('http://127.0.0.1:18765/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'qwen3.7-plus', messages: [{ role: 'user', content: '只回一个字：好' }] }),
});
const j = await r.json();
console.log('status:', r.status);
console.log('content:', JSON.stringify(j.choices?.[0]?.message?.content));
