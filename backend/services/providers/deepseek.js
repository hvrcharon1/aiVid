const OpenAI = require('openai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'deepseek-coder', name: 'DeepSeek Coder' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)' },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
];

// DeepSeek uses OpenAI-compatible API
function createClient(apiKey) {
  return new OpenAI.default({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });
}

async function convertToSQL(prompt, schema, options = {}) {
  const apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DeepSeek API key is required');

  const client = createClient(apiKey);
  const model = options.model || MODELS[0].id;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: buildSystemPrompt(schema) },
      { role: 'user', content: prompt },
    ],
  });

  const result = parseResult(completion.choices[0].message.content);
  return {
    ...result,
    model: completion.model,
    usage: completion.usage,
  };
}

async function explainSQL(sql, options = {}) {
  const apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DeepSeek API key is required');

  const client = createClient(apiKey);
  const model = options.model || MODELS[0].id;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: [
      { role: 'user', content: `Explain this Oracle SQL/PL*SQL in plain English. Be concise:\n\n${sql}` },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { convertToSQL, explainSQL, MODELS, name: 'deepseek', label: 'DeepSeek (Coder)' };
