const { AzureOpenAI } = require('openai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o (Azure)' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Azure)' },
  { id: 'gpt-4', name: 'GPT-4 (Azure)' },
  { id: 'gpt-35-turbo', name: 'GPT-3.5 Turbo (Azure)' },
];

// Extra fields the frontend needs to collect for this provider
const EXTRA_FIELDS = [
  {
    key: 'azureEndpoint',
    label: 'Azure Endpoint',
    placeholder: 'https://your-resource.openai.azure.com',
    type: 'text',
  },
];

function createClient(options) {
  const apiKey = options.apiKey || process.env.AZURE_OPENAI_API_KEY;
  const endpoint = options.azureEndpoint || process.env.AZURE_OPENAI_ENDPOINT;

  if (!apiKey) throw new Error('Azure OpenAI API key is required');
  if (!endpoint) throw new Error('Azure OpenAI endpoint is required (e.g. https://your-resource.openai.azure.com)');

  return new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
  });
}

async function convertToSQL(prompt, schema, options = {}) {
  const client = createClient(options);
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
  const client = createClient(options);
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

module.exports = {
  convertToSQL,
  explainSQL,
  MODELS,
  EXTRA_FIELDS,
  name: 'copilot',
  label: 'Microsoft Copilot (Azure)',
};
