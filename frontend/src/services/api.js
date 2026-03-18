const API_BASE = '/api';

export async function connectDB(sessionId, config) {
  const res = await fetch(`${API_BASE}/database/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, ...config }),
  });
  return res.json();
}

export async function disconnectDB(sessionId) {
  const res = await fetch(`${API_BASE}/database/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return res.json();
}

export async function fetchSchema(sessionId) {
  const res = await fetch(`${API_BASE}/database/schema/${sessionId}`);
  return res.json();
}

export async function fetchTableDetails(sessionId, tableName) {
  const res = await fetch(`${API_BASE}/database/table/${sessionId}/${tableName}`);
  return res.json();
}

export async function fetchProviders() {
  const res = await fetch(`${API_BASE}/query/providers`);
  return res.json();
}

export async function convertToSQL(sessionId, prompt, providerConfig = {}) {
  const res = await fetch(`${API_BASE}/query/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      prompt,
      provider: providerConfig.provider,
      model: providerConfig.model,
      apiKey: providerConfig.apiKey,
    }),
  });
  return res.json();
}

export async function executeQuery(sessionId, sql, type) {
  const res = await fetch(`${API_BASE}/query/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, sql, type }),
  });
  return res.json();
}

export async function explainSQL(sql, providerConfig = {}) {
  const res = await fetch(`${API_BASE}/query/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sql,
      provider: providerConfig.provider,
      model: providerConfig.model,
      apiKey: providerConfig.apiKey,
    }),
  });
  return res.json();
}
