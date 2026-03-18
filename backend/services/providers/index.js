const anthropic = require('./anthropic');
const openai = require('./openai');
const gemini = require('./gemini');
const grok = require('./grok');
const deepseek = require('./deepseek');

const providers = {
  anthropic,
  openai,
  gemini,
  grok,
  deepseek,
};

function getProvider(name) {
  const provider = providers[name];
  if (!provider) {
    const available = Object.keys(providers).join(', ');
    throw new Error(`Unknown provider "${name}". Available: ${available}`);
  }
  return provider;
}

function listProviders() {
  return Object.values(providers).map(p => ({
    name: p.name,
    label: p.label,
    models: p.MODELS,
  }));
}

module.exports = { getProvider, listProviders };
