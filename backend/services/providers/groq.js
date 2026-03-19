const OpenAI = require('openai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B' },
  { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
  { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
  { id: 'compound-beta', name: 'Compound Beta' },
  { id: 'compound-beta-mini', name: 'Compound Beta Mini' },
];

function createClient(apiKey) {
  return new OpenAI.default({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

async function convertToSQL(prompt, schema, options = {}) {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq API key is required');

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
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq API key is required');

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

module.exports = { convertToSQL, explainSQL, MODELS, name: 'groq', label: 'Groq' };
