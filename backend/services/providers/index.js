const anthropic = require('./anthropic');
const openai = require('./openai');
const gemini = require('./gemini');
const grok = require('./grok');
const deepseek = require('./deepseek');
const copilot = require('./copilot');

const providers = {
  anthropic,
  openai,
  gemini,
  grok,
  deepseek,
  copilot,
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
    extraFields: p.EXTRA_FIELDS || [],
  }));
}

module.exports = { getProvider, listProviders };
