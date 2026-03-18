import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const EMPTY_PARAM = { name: '', type: 'string', required: false };

export default function McpPanel() {
  const [status, setStatus] = useState({ connected: false });
  const [tools, setTools] = useState([]);
  const [config, setConfig] = useState({
    user: '',
    password: '',
    host: 'localhost',
    port: '1521',
    serviceName: 'ORCL',
    sqlclPath: '',
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  // Selected tool
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolArgs, setToolArgs] = useState({});
  const [toolResult, setToolResult] = useState(null);
  const [toolLoading, setToolLoading] = useState(false);
  const [toolError, setToolError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('connect');

  // Custom tools state
  const [customTools, setCustomTools] = useState([]);
  const [editingTool, setEditingTool] = useState(null); // null = add mode, object = editing
  const [customForm, setCustomForm] = useState({
    name: '',
    description: '',
    parameters: [],
    sqlTemplate: '',
  });
  const [customSaving, setCustomSaving] = useState(false);
  const [customError, setCustomError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Check status on mount + load custom tools
  useEffect(() => {
    api.mcpGetStatus().then(setStatus).catch(() => {});
    loadCustomTools();
  }, []);

  const loadCustomTools = async () => {
    try {
      const res = await api.customToolsList();
      if (res.tools) setCustomTools(res.tools);
    } catch {}
  };

  const handleConnect = useCallback(async (e) => {
    e.preventDefault();
    setConnecting(true);
    setError('');
    try {
      const res = await api.mcpConnect(config);
      if (res.error) {
        setError(res.error);
        return;
      }
      setStatus({ connected: true, connectionInfo: res.connectionInfo });
      setActiveTab('tools');

      // Fetch tools
      const toolsRes = await api.mcpListTools();
      if (toolsRes.tools) setTools(toolsRes.tools);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }, [config]);

  const handleDisconnect = useCallback(async () => {
    await api.mcpDisconnect();
    setStatus({ connected: false });
    setTools([]);
    setSelectedTool(null);
    setToolResult(null);
    setActiveTab('connect');
  }, []);

  const handleSelectTool = useCallback((tool) => {
    setSelectedTool(tool);
    setToolArgs({});
    setToolResult(null);
    setToolError('');
  }, []);

  const handleCallTool = useCallback(async () => {
    if (!selectedTool) return;
    setToolLoading(true);
    setToolError('');
    setToolResult(null);
    try {
      let res;
      if (selectedTool._custom) {
        // Custom tool execution
        res = await api.customToolsExecute(selectedTool.id, toolArgs);
      } else {
        res = await api.mcpCallTool(selectedTool.name, toolArgs);
      }
      if (res.error) {
        setToolError(res.error);
      } else {
        setToolResult(res);
      }
    } catch (err) {
      setToolError(err.message);
    } finally {
      setToolLoading(false);
    }
  }, [selectedTool, toolArgs]);

  const handleArgChange = (key, value) => {
    setToolArgs(prev => ({ ...prev, [key]: value }));
  };

  // Get input fields from tool schema (built-in) or parameters (custom)
  const getToolInputFields = (tool) => {
    if (tool._custom) {
      return (tool.parameters || []).map(p => ({
        key: p.name,
        type: p.type || 'string',
        description: p.name,
        required: p.required || false,
        enumValues: null,
      }));
    }
    if (!tool?.inputSchema?.properties) return [];
    const required = tool.inputSchema.required || [];
    return Object.entries(tool.inputSchema.properties).map(([key, schema]) => ({
      key,
      type: schema.type || 'string',
      description: schema.description || key,
      required: required.includes(key),
      enumValues: schema.enum || null,
    }));
  };

  // Merge built-in and custom tools, grouped by category
  const allToolsByCategory = (() => {
    const acc = {};
    // Built-in tools
    tools.forEach(tool => {
      const cat = tool.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ ...tool, _custom: false });
    });
    // Custom tools
    if (customTools.length > 0) {
      acc['Custom'] = customTools.map(t => ({
        ...t,
        _custom: true,
        category: 'Custom',
      }));
    }
    return acc;
  })();

  // Custom tools form handlers
  const resetCustomForm = () => {
    setEditingTool(null);
    setCustomForm({ name: '', description: '', parameters: [], sqlTemplate: '' });
    setCustomError('');
  };

  const startEditTool = (tool) => {
    setEditingTool(tool);
    setCustomForm({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters.length > 0 ? tool.parameters : [],
      sqlTemplate: tool.sqlTemplate,
    });
    setCustomError('');
  };

  const addParamRow = () => {
    setCustomForm(prev => ({
      ...prev,
      parameters: [...prev.parameters, { ...EMPTY_PARAM }],
    }));
  };

  const removeParamRow = (idx) => {
    setCustomForm(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== idx),
    }));
  };

  const updateParam = (idx, field, value) => {
    setCustomForm(prev => ({
      ...prev,
      parameters: prev.parameters.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleSaveCustomTool = async () => {
    if (!customForm.name.trim() || !customForm.sqlTemplate.trim()) {
      setCustomError('Name and SQL template are required');
      return;
    }
    setCustomSaving(true);
    setCustomError('');
    try {
      const payload = {
        name: customForm.name.trim(),
        description: customForm.description.trim(),
        parameters: customForm.parameters.filter(p => p.name.trim()),
        sqlTemplate: customForm.sqlTemplate,
      };
      if (editingTool) {
        const res = await api.customToolsUpdate(editingTool.id, payload);
        if (res.error) { setCustomError(res.error); return; }
      } else {
        const res = await api.customToolsCreate(payload);
        if (res.error) { setCustomError(res.error); return; }
      }
      resetCustomForm();
      await loadCustomTools();
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setCustomSaving(false);
    }
  };

  const handleDeleteCustomTool = async (id) => {
    try {
      await api.customToolsDelete(id);
      setDeletingId(null);
      await loadCustomTools();
      // If the deleted tool was selected, deselect
      if (selectedTool?.id === id) {
        setSelectedTool(null);
      }
    } catch (err) {
      setCustomError(err.message);
    }
  };

  return (
    <div className="mcp-panel">
      <div className="mcp-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3>Oracle SQLcl MCP</h3>
          {status.connected && (
            <span className="sql-type-badge plsql">Connected</span>
          )}
        </div>
        {status.connected && (
          <button className="btn btn-danger btn-sm" onClick={handleDisconnect}>
            Stop
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mcp-tabs">
        <button
          className={`mcp-tab ${activeTab === 'connect' ? 'active' : ''}`}
          onClick={() => setActiveTab('connect')}
        >
          Connection
        </button>
        <button
          className={`mcp-tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
          disabled={!status.connected && customTools.length === 0}
        >
          Tools ({tools.length + customTools.length})
        </button>
        <button
          className={`mcp-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </button>
        <button
          className={`mcp-tab ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
          disabled={!toolResult && !toolError}
        >
          Output
        </button>
      </div>

      <div className="mcp-body">
        {/* Connection Tab */}
        {activeTab === 'connect' && (
          <form className="connection-form" onSubmit={handleConnect}>
            <div className="form-group">
              <label>SQLcl Path</label>
              <input
                value={config.sqlclPath}
                onChange={e => setConfig(p => ({ ...p, sqlclPath: e.target.value }))}
                placeholder="sql (auto-detect from PATH)"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Host</label>
                <input
                  value={config.host}
                  onChange={e => setConfig(p => ({ ...p, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>
              <div className="form-group" style={{ maxWidth: 80 }}>
                <label>Port</label>
                <input
                  value={config.port}
                  onChange={e => setConfig(p => ({ ...p, port: e.target.value }))}
                  placeholder="1521"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Service Name</label>
              <input
                value={config.serviceName}
                onChange={e => setConfig(p => ({ ...p, serviceName: e.target.value }))}
                placeholder="ORCL"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                value={config.user}
                onChange={e => setConfig(p => ({ ...p, user: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={config.password}
                onChange={e => setConfig(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
            {error && <div className="error-box">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={connecting}>
              {connecting ? <><span className="loading-spinner" /> Starting MCP...</> : 'Start MCP Server'}
            </button>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Requires Oracle SQLcl 24.3+ installed with MCP support
            </span>
          </form>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="mcp-tools-layout">
            <div className="mcp-tools-list">
              {Object.entries(allToolsByCategory).map(([category, catTools]) => (
                <div key={category} className="mcp-tool-category">
                  <div className="mcp-tool-category-label">{category}</div>
                  {catTools.map(tool => (
                    <div
                      key={tool._custom ? tool.id : tool.name}
                      className={`mcp-tool-item ${selectedTool && (tool._custom ? selectedTool.id === tool.id : selectedTool.name === tool.name) ? 'active' : ''}`}
                      onClick={() => handleSelectTool(tool)}
                      title={tool.description}
                    >
                      {tool.name}
                      <span className={`tool-badge ${tool._custom ? 'custom' : 'builtin'}`}>
                        {tool._custom ? 'Custom' : 'Built-in'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {tools.length === 0 && customTools.length === 0 && (
                <div style={{ padding: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  No tools available. Connect to the MCP server or create custom tools.
                </div>
              )}
            </div>

            <div className="mcp-tool-detail">
              {selectedTool ? (
                <>
                  <div className="mcp-tool-name">
                    {selectedTool.name}
                    <span className={`tool-badge ${selectedTool._custom ? 'custom' : 'builtin'}`} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                      {selectedTool._custom ? 'Custom' : 'Built-in'}
                    </span>
                  </div>
                  <div className="mcp-tool-desc">{selectedTool.description}</div>

                  {selectedTool._custom && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>SQL Template:</div>
                      <pre className="mcp-result-text" style={{ fontSize: 11 }}>{selectedTool.sqlTemplate}</pre>
                    </div>
                  )}

                  {/* Tool arguments form */}
                  <div className="mcp-tool-args">
                    {getToolInputFields(selectedTool).map(field => (
                      <div className="form-group" key={field.key}>
                        <label>
                          {field.description}
                          {field.required && <span style={{ color: 'var(--error)' }}> *</span>}
                        </label>
                        {field.enumValues ? (
                          <select
                            className="form-select"
                            value={toolArgs[field.key] || ''}
                            onChange={e => handleArgChange(field.key, e.target.value)}
                          >
                            <option value="">Select...</option>
                            {field.enumValues.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <select
                            className="form-select"
                            value={toolArgs[field.key] ?? ''}
                            onChange={e => handleArgChange(field.key, e.target.value === 'true')}
                          >
                            <option value="">Default</option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : (
                          <input
                            value={toolArgs[field.key] || ''}
                            onChange={e => handleArgChange(field.key, e.target.value)}
                            placeholder={field.key}
                          />
                        )}
                      </div>
                    ))}
                    {getToolInputFields(selectedTool).length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        This tool takes no arguments.
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleCallTool();
                      setActiveTab('result');
                    }}
                    disabled={toolLoading || (!status.connected && selectedTool._custom)}
                    style={{ marginTop: 12 }}
                  >
                    {toolLoading ? <><span className="loading-spinner" /> Running...</> : 'Run Tool'}
                  </button>
                  {!status.connected && selectedTool._custom && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Connect to MCP server to execute custom tools
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: 20, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Select a tool from the list to configure and run it
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="custom-tools-tab">
            {/* Form */}
            <div className="custom-tool-form">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {editingTool ? 'Edit Custom Tool' : 'Create Custom Tool'}
              </div>
              <div className="form-group">
                <label>Tool Name</label>
                <input
                  value={customForm.name}
                  onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. check-user-count"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={customForm.description}
                  onChange={e => setCustomForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this tool do?"
                />
              </div>

              {/* Parameters */}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Parameters
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addParamRow}>+ Add</button>
                </label>
                {customForm.parameters.map((param, idx) => (
                  <div className="param-row" key={idx}>
                    <input
                      value={param.name}
                      onChange={e => updateParam(idx, 'name', e.target.value)}
                      placeholder="name"
                      style={{ flex: 2 }}
                    />
                    <select
                      className="form-select"
                      value={param.type}
                      onChange={e => updateParam(idx, 'type', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={param.required}
                        onChange={e => updateParam(idx, 'required', e.target.checked)}
                      />
                      Req
                    </label>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeParamRow(idx)}>×</button>
                  </div>
                ))}
              </div>

              {/* SQL template */}
              <div className="form-group">
                <label>SQL Template</label>
                <textarea
                  className="sql-template-textarea"
                  value={customForm.sqlTemplate}
                  onChange={e => setCustomForm(p => ({ ...p, sqlTemplate: e.target.value }))}
                  placeholder={"SELECT * FROM users WHERE role = '{{role}}'"}
                  rows={4}
                />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {"Use {{paramName}} for parameter placeholders"}
                </span>
              </div>

              {customError && <div className="error-box">{customError}</div>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveCustomTool}
                  disabled={customSaving}
                >
                  {customSaving ? <><span className="loading-spinner" /> Saving...</> : editingTool ? 'Update Tool' : 'Save Tool'}
                </button>
                {editingTool && (
                  <button className="btn btn-secondary" onClick={resetCustomForm}>Cancel</button>
                )}
              </div>
            </div>

            {/* List of existing custom tools */}
            {customTools.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Saved Tools ({customTools.length})
                </div>
                {customTools.map(tool => (
                  <div key={tool.id} className="custom-tool-list-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{tool.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tool.description || tool.sqlTemplate.substring(0, 60)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {deletingId === tool.id ? (
                        <div className="confirm-delete">
                          <span style={{ fontSize: 11 }}>Delete?</span>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCustomTool(tool.id)}>Yes</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setDeletingId(null)}>No</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEditTool(tool)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeletingId(tool.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && (
          <div className="mcp-result">
            {toolError && <div className="error-box">{toolError}</div>}
            {toolResult && (
              <div className="mcp-result-content">
                {toolResult.sql && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Executed SQL:</div>
                    <pre className="mcp-result-text" style={{ fontSize: 11 }}>{toolResult.sql}</pre>
                  </div>
                )}
                {toolResult.output?.map((item, i) => (
                  <div key={i}>
                    {typeof item === 'string' ? (
                      <pre className="mcp-result-text">{item}</pre>
                    ) : item?.type === 'image' ? (
                      <img
                        src={`data:${item.mimeType};base64,${item.data}`}
                        alt="MCP tool output"
                        style={{ maxWidth: '100%', borderRadius: 6 }}
                      />
                    ) : (
                      <pre className="mcp-result-text">{JSON.stringify(item, null, 2)}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!toolResult && !toolError && (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                Run a tool to see its output here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
