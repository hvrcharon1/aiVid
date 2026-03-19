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
      extraFields: providerConfig.extraFields,
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
      extraFields: providerConfig.extraFields,
    }),
  });
  return res.json();
}

export async function testProvider(providerConfig) {
  const res = await fetch(`${API_BASE}/query/test-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(providerConfig),
  });
  return res.json();
}

// ========== MCP Tools API ==========

export async function mcpGetStatus() {
  const res = await fetch(`${API_BASE}/mcp/status`);
  return res.json();
}

export async function mcpConnect(config) {
  const res = await fetch(`${API_BASE}/mcp/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function mcpDisconnect() {
  const res = await fetch(`${API_BASE}/mcp/disconnect`, {
    method: 'POST',
  });
  return res.json();
}

export async function mcpListTools() {
  const res = await fetch(`${API_BASE}/mcp/tools`);
  return res.json();
}

export async function mcpCallTool(toolName, args = {}) {
  const res = await fetch(`${API_BASE}/mcp/tools/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolName, args }),
  });
  return res.json();
}

// ========== Custom Tools API ==========

export async function customToolsList() {
  const res = await fetch(`${API_BASE}/tools/custom`);
  return res.json();
}

export async function customToolsCreate(tool) {
  const res = await fetch(`${API_BASE}/tools/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tool),
  });
  return res.json();
}

export async function customToolsUpdate(id, tool) {
  const res = await fetch(`${API_BASE}/tools/custom/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tool),
  });
  return res.json();
}

export async function customToolsDelete(id) {
  const res = await fetch(`${API_BASE}/tools/custom/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function customToolsExecute(id, args = {}) {
  const res = await fetch(`${API_BASE}/tools/custom/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args }),
  });
  return res.json();
}
