const res = await fetch('http://127.0.0.1:18765/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hello world' }] }),
});
console.log('status:', res.status);
const data = await res.json();
console.log('answer:', data.choices?.[0]?.message?.content ?? JSON.stringify(data));
