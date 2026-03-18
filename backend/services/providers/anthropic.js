const Anthropic = require('@anthropic-ai/sdk');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
];

async function convertToSQL(prompt, schema, options = {}) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic API key is required');

  const client = new Anthropic.default({ apiKey });
  const model = options.model || MODELS[0].id;

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: buildSystemPrompt(schema),
    messages: [{ role: 'user', content: prompt }],
  });

  const result = parseResult(message.content[0].text);
  return { ...result, model: message.model, usage: message.usage };
}

async function explainSQL(sql, options = {}) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic API key is required');

  const client = new Anthropic.default({ apiKey });
  const model = options.model || MODELS[0].id;

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: `Explain this Oracle SQL/PL*SQL in plain English. Be concise:\n\n${sql}` }],
  });

  return message.content[0].text.trim();
}

module.exports = { convertToSQL, explainSQL, MODELS, name: 'anthropic', label: 'Anthropic (Claude)' };
