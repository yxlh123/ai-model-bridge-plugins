const yaml = require('C:/Users/<用户名>/.dsh/profiles/desktop/node_modules/yaml');
const fs = require('fs');
const d = yaml.parse(fs.readFileSync('C:/Users/<用户名>/.dsh/profiles/desktop/cordis.patch.yml','utf8'));
const llm = d.find(e => e.id === 'llm-pi-ai');
console.log('YAML ok, entries:', d.length, 'providers:', Object.keys(llm.config.providers).join(','));
const q = llm.config.providers['qwen-web'];
console.log('qwen-web model:', q.models[0].id, 'ctx:', q.models[0].contextWindow, 'max:', q.models[0].maxTokens);
