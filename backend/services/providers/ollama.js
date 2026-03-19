const OpenAI = require('openai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'qwen3-coder:30b', name: 'Qwen 3 Coder (30B)' },
  { id: 'gpt-oss:20b', name: 'GPT-OSS (20B)' },
  { id: 'deepseek-r1:8b', name: 'DeepSeek R1 (8B)' },
  { id: 'deepseek-r1', name: 'DeepSeek R1' },
  { id: 'llama3.1', name: 'Llama 3.1 (8B)' },
  { id: 'llama3.1:70b', name: 'Llama 3.1 (70B)' },
  { id: 'codellama', name: 'Code Llama' },
  { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2' },
  { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder (7B)' },
  { id: 'mistral', name: 'Mistral (7B)' },
  { id: 'mixtral', name: 'Mixtral (8x7B)' },
  { id: 'phi3', name: 'Phi-3 (3.8B)' },
  { id: 'gemma2', name: 'Gemma 2' },
];

const EXTRA_FIELDS = [
  {
    key: 'ollamaBaseUrl',
    label: 'Ollama Host URL',
    placeholder: 'http://localhost:11434',
    type: 'text',
  },
];

function createClient(options) {
  const baseURL = (options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/v1';

  return new OpenAI.default({
    baseURL,
    apiKey: 'ollama', // Ollama doesn't require a key, but the SDK needs a non-empty value
  });
}

async function convertToSQL(prompt, schema, options = {}) {
  const client = createClient(options);
  const model = options.model || MODELS[0].id;

  const completion = await client.chat.completions.create({
    model,
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
  const client = createClient(options);
  const model = options.model || MODELS[0].id;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'user', content: `Explain this Oracle SQL/PL*SQL in plain English. Be concise:\n\n${sql}` },
    ],
  });

  return completion.choices[0].message.content.trim();
}

module.exports = {
  convertToSQL,
  explainSQL,
  MODELS,
  EXTRA_FIELDS,
  name: 'ollama',
  label: 'Ollama (Local)',
};
