const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'custom-tools.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readTools() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeTools(tools) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(tools, null, 2), 'utf-8');
}

function list() {
  return readTools();
}

function get(id) {
  return readTools().find(t => t.id === id) || null;
}

function create(tool) {
  const tools = readTools();
  const now = new Date().toISOString();
  const newTool = {
    id: randomUUID(),
    name: tool.name,
    description: tool.description || '',
    parameters: tool.parameters || [],
    sqlTemplate: tool.sqlTemplate || '',
    createdAt: now,
    updatedAt: now,
  };
  tools.push(newTool);
  writeTools(tools);
  return newTool;
}

function update(id, updates) {
  const tools = readTools();
  const idx = tools.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tools[idx] = {
    ...tools[idx],
    name: updates.name ?? tools[idx].name,
    description: updates.description ?? tools[idx].description,
    parameters: updates.parameters ?? tools[idx].parameters,
    sqlTemplate: updates.sqlTemplate ?? tools[idx].sqlTemplate,
    updatedAt: new Date().toISOString(),
  };
  writeTools(tools);
  return tools[idx];
}

function remove(id) {
  const tools = readTools();
  const idx = tools.findIndex(t => t.id === id);
  if (idx === -1) return false;
  tools.splice(idx, 1);
  writeTools(tools);
  return true;
}

function renderTemplate(sqlTemplate, args) {
  return sqlTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return args[key] !== undefined ? args[key] : `{{${key}}}`;
  });
}

async function execute(id, args, mcpService) {
  const tool = get(id);
  if (!tool) throw new Error('Custom tool not found');

  // Validate required parameters before rendering
  const missing = (tool.parameters || [])
    .filter(p => p.required && (args == null || args[p.name] === undefined || args[p.name] === ''))
    .map(p => p.name);
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }

  const sql = renderTemplate(tool.sqlTemplate, args || {});

  // Try known SQL execution tool names
  const sqlToolNames = ['execute_sql', 'run-sql', 'execute_query', 'run_query'];
  let lastError;

  for (const toolName of sqlToolNames) {
    try {
      const result = await mcpService.callTool(toolName, { sql });
      if (!result.success) {
        const errorText = (result.output || []).join('\n').trim();
        throw new Error(errorText || 'SQL execution failed');
      }
      return { success: true, sql, output: result.output, raw: result.raw };
    } catch (err) {
      // If MCP is disconnected, fail immediately
      if (err.message && err.message.includes('not connected')) throw err;
      // If the error indicates the tool name doesn't exist, try the next one
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('unknown tool') || msg.includes('not found') || msg.includes('not a valid tool')) {
        lastError = err;
        continue;
      }
      // Any other error (SQL syntax, permission, etc.) is a real execution error — throw it
      throw err;
    }
  }

  throw new Error(`Could not find a SQL execution tool. Last error: ${lastError?.message}`);
}

module.exports = { list, get, create, update, remove, execute };
