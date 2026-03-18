const { getProvider } = require('./providers');

async function convertToSQL(prompt, schema, providerConfig = {}) {
  const providerName = providerConfig.provider || 'anthropic';
  const provider = getProvider(providerName);

  return provider.convertToSQL(prompt, schema, {
    apiKey: providerConfig.apiKey,
    model: providerConfig.model,
  });
}

async function explainSQL(sql, providerConfig = {}) {
  const providerName = providerConfig.provider || 'anthropic';
  const provider = getProvider(providerName);

  return provider.explainSQL(sql, {
    apiKey: providerConfig.apiKey,
    model: providerConfig.model,
  });
}

module.exports = { convertToSQL, explainSQL };
