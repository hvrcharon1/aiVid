const { getProvider } = require('./providers');

async function convertToSQL(prompt, schema, providerConfig = {}) {
  const providerName = providerConfig.provider || 'anthropic';
  const provider = getProvider(providerName);

  const { provider: _, ...options } = providerConfig;
  return provider.convertToSQL(prompt, schema, options);
}

async function explainSQL(sql, providerConfig = {}) {
  const providerName = providerConfig.provider || 'anthropic';
  const provider = getProvider(providerName);

  const { provider: _, ...options } = providerConfig;
  return provider.explainSQL(sql, options);
}

module.exports = { convertToSQL, explainSQL };
