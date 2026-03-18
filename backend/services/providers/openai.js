const OpenAI = require('openai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'o3-mini', name: 'o3-mini' },
];

async function convertToSQL(prompt, schema, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is required');

  const client = new OpenAI.default({ apiKey });
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
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is required');

  const client = new OpenAI.default({ apiKey });
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

module.exports = { convertToSQL, explainSQL, MODELS, name: 'openai', label: 'OpenAI (GPT)' };
