const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSystemPrompt, parseResult } = require('./common');

const MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
];

async function convertToSQL(prompt, schema, options = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Google Gemini API key is required');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: options.model || MODELS[0].id,
    systemInstruction: buildSystemPrompt(schema),
  });

  const response = await model.generateContent(prompt);
  const text = response.response.text();

  const result = parseResult(text);
  return {
    ...result,
    model: options.model || MODELS[0].id,
    usage: response.response.usageMetadata,
  };
}

async function explainSQL(sql, options = {}) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Google Gemini API key is required');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: options.model || MODELS[0].id,
  });

  const response = await model.generateContent(
    `Explain this Oracle SQL/PL*SQL in plain English. Be concise:\n\n${sql}`
  );

  return response.response.text().trim();
}

module.exports = { convertToSQL, explainSQL, MODELS, name: 'gemini', label: 'Google (Gemini)' };
