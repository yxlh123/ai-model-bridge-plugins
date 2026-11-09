const yaml = require('C:/Users/<用户名>/.dsh/profiles/desktop/node_modules/yaml');
const fs = require('fs');
const t = fs.readFileSync('C:/Users/<用户名>/.dsh/profiles/desktop/cordis.patch.yml', 'utf8');
const d = yaml.parse(t);
console.log('entries:', d.length);
const llm = d.find(e => e.id === 'llm-pi-ai');
console.log('models:', llm ? llm.config.providers['ollama-local'].models.map(m => m.id + '|' + JSON.stringify(Object.keys(m).slice(1))).join('; ') : 'none');
console.log('bili-native:', d.some(e => e.id === 'bili-native'));
