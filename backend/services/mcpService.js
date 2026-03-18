const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { spawn } = require('child_process');
const path = require('path');

let mcpClient = null;
let mcpTransport = null;
let mcpStatus = { connected: false, connectionInfo: '' };

// Well-known tool categories for the UI
const TOOL_CATEGORIES = {
  'execute_sql': 'Query',
  'execute_query': 'Query',
  'run_query': 'Query',
  'execute_plsql': 'PL/SQL',
  'run_plsql': 'PL/SQL',
  'execute_script': 'Script',
  'run_script': 'Script',
  'execute_sqlcl_command': 'SQLcl',
  'sqlcl_command': 'SQLcl',
  'list_tables': 'Schema',
  'list_objects': 'Schema',
  'describe_table': 'Schema',
  'describe_object': 'Schema',
  'get_table_info': 'Schema',
  'get_ddl': 'DDL',
  'get_metadata': 'DDL',
  'generate_er_diagram': 'Diagram',
  'er_diagram': 'Diagram',
  'export_data': 'Data',
  'import_data': 'Data',
  'get_db_info': 'Info',
  'get_object_count': 'Info',
};

function categorize(toolName) {
  const lower = toolName.toLowerCase();
  for (const [pattern, cat] of Object.entries(TOOL_CATEGORIES)) {
    if (lower.includes(pattern) || lower === pattern) return cat;
  }
  return 'Other';
}

async function connect(config = {}) {
  // Disconnect existing if any
  await disconnect();

  const sqlclPath = config.sqlclPath || process.env.SQLCL_PATH || 'sql';
  const connectString = config.connectString || '';

  // Build SQLcl args for MCP mode
  // SQLcl MCP server mode: sql -nomcp /nolog  OR  sql -mcp user/pass@connstr
  const args = [];

  if (config.mcpMode === 'stdio') {
    // Direct stdio MCP mode (SQLcl 24.3+)
    args.push('-mcp');
    if (connectString) {
      args.push(connectString);
    } else if (config.user && config.password) {
      const connStr = config.connectionString ||
        `${config.user}/${config.password}@${config.host || 'localhost'}:${config.port || 1521}/${config.serviceName || 'ORCL'}`;
      args.push(connStr);
    } else {
      args.push('/nolog');
    }
  } else {
    // Default: use -mcp flag
    args.push('-mcp');
    if (connectString) {
      args.push(connectString);
    } else if (config.user && config.password) {
      const connStr = `${config.user}/${config.password}@${config.host || 'localhost'}:${config.port || 1521}/${config.serviceName || 'ORCL'}`;
      args.push(connStr);
    } else {
      args.push('/nolog');
    }
  }

  // Create stdio transport to SQLcl MCP server
  mcpTransport = new StdioClientTransport({
    command: sqlclPath,
    args,
  });

  mcpClient = new Client({
    name: 'aiVid-mcp-client',
    version: '1.0.0',
  });

  await mcpClient.connect(mcpTransport);

  mcpStatus = {
    connected: true,
    connectionInfo: connectString || `${config.user || 'nolog'}@${config.host || 'localhost'}:${config.port || 1521}/${config.serviceName || 'ORCL'}`,
    sqlclPath,
  };

  return mcpStatus;
}

async function disconnect() {
  if (mcpClient) {
    try {
      await mcpClient.close();
    } catch {
      // ignore close errors
    }
    mcpClient = null;
    mcpTransport = null;
  }
  mcpStatus = { connected: false, connectionInfo: '' };
}

function getStatus() {
  return mcpStatus;
}

async function listTools() {
  if (!mcpClient) {
    throw new Error('MCP server is not connected. Start the SQLcl MCP server first.');
  }

  const result = await mcpClient.listTools();
  const tools = (result.tools || []).map(tool => ({
    name: tool.name,
    description: tool.description || '',
    category: categorize(tool.name),
    inputSchema: tool.inputSchema || {},
  }));

  return tools;
}

async function callTool(toolName, args = {}) {
  if (!mcpClient) {
    throw new Error('MCP server is not connected. Start the SQLcl MCP server first.');
  }

  const result = await mcpClient.callTool({
    name: toolName,
    arguments: args,
  });

  // Parse MCP tool result content
  const content = result.content || [];
  const output = content.map(item => {
    if (item.type === 'text') return item.text;
    if (item.type === 'image') return { type: 'image', data: item.data, mimeType: item.mimeType };
    return JSON.stringify(item);
  });

  return {
    success: !result.isError,
    output,
    raw: result,
  };
}

async function listResources() {
  if (!mcpClient) {
    throw new Error('MCP server is not connected.');
  }

  try {
    const result = await mcpClient.listResources();
    return result.resources || [];
  } catch {
    return [];
  }
}

module.exports = {
  connect,
  disconnect,
  getStatus,
  listTools,
  callTool,
  listResources,
};
