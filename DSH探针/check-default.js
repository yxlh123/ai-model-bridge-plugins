const yaml = require('C:/Users/<用户名>/.dsh/profiles/desktop/node_modules/yaml');
const fs = require('fs');
const d = yaml.parse(fs.readFileSync('C:/Users/<用户名>/.dsh/profiles/desktop/cordis.patch.yml','utf8'));
const entry = d.find(e => e.id === 'agent-default-model');
console.log('entries:', d.length);
console.log('default provider:', entry.config.provider, 'model:', entry.config.model);
const llm = d.find(e => e.id === 'llm-pi-ai');
console.log('providers:', Object.keys(llm.config.providers).join(','));
