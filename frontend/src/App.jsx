import { useState, useCallback, useRef } from 'react';
import ConnectionForm from './components/ConnectionForm';
import ProviderSettings from './components/ProviderSettings';
import QueryInput from './components/QueryInput';
import SqlPreview from './components/SqlPreview';
import ResultsTable from './components/ResultsTable';
import SchemaViewer from './components/SchemaViewer';
import QueryHistory from './components/QueryHistory';
import * as api from './services/api';

// Generate a unique session ID for this browser tab
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export default function App() {
  const [connected, setConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState('');
  const [schema, setSchema] = useState([]);

  const [sql, setSql] = useState('');
  const [sqlType, setSqlType] = useState('sql');
  const [result, setResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [history, setHistory] = useState([]);

  const [converting, setConverting] = useState(false);
  const [executing, setExecuting] = useState(false);

  // AI provider config
  const providerConfigRef = useRef({ provider: 'anthropic', model: '', apiKey: '' });

  const handleProviderConfigChange = useCallback((config) => {
    providerConfigRef.current = config;
  }, []);

  const handleConnect = useCallback(async (config) => {
    const res = await api.connectDB(SESSION_ID, config);
    if (res.error) throw new Error(res.error);

    setConnected(true);
    setConnectionInfo(`${config.user}@${config.host}:${config.port}/${config.serviceName}`);

    // Fetch schema in background
    try {
      const schemaRes = await api.fetchSchema(SESSION_ID);
      if (schemaRes.schema) setSchema(schemaRes.schema);
    } catch {
      // Schema fetch is non-critical
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    await api.disconnectDB(SESSION_ID);
    setConnected(false);
    setConnectionInfo('');
    setSchema([]);
    setResult(null);
    setSql('');
    setQueryError('');
  }, []);

  const handleConvert = useCallback(async (prompt) => {
    setConverting(true);
    setQueryError('');
    setResult(null);
    try {
      const res = await api.convertToSQL(
        connected ? SESSION_ID : null,
        prompt,
        providerConfigRef.current
      );
      if (res.error) {
        setQueryError(res.error);
        return;
      }
      setSql(res.sql);
      setSqlType(res.type);

      // Add to history
      setHistory(prev => [
        { prompt, sql: res.sql, type: res.type, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 49),
      ]);
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setConverting(false);
    }
  }, [connected]);

  const handleExecute = useCallback(async () => {
    if (!connected) {
      setQueryError('Please connect to a database before executing queries.');
      return;
    }
    setExecuting(true);
    setQueryError('');
    setResult(null);
    try {
      const res = await api.executeQuery(SESSION_ID, sql, sqlType);
      if (res.error) {
        setQueryError(res.error);
      } else {
        setResult(res);
      }
    } catch (err) {
      setQueryError(err.message);
    } finally {
      setExecuting(false);
    }
  }, [connected, sql, sqlType]);

  const handleHistorySelect = useCallback((item) => {
    setSql(item.sql);
    setSqlType(item.type);
    setResult(null);
    setQueryError('');
  }, []);

  const handleClearSql = useCallback(() => {
    setSql('');
    setSqlType('sql');
    setResult(null);
    setQueryError('');
  }, []);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Oracle NLP Query</h1>
          <p>Talk to your database in plain English</p>
        </div>

        <div className="sidebar-section">
          <h3>AI Provider</h3>
          <ProviderSettings onConfigChange={handleProviderConfigChange} />
        </div>

        <div className="sidebar-section">
          <h3>Connection</h3>
          <ConnectionForm
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={connected}
            connectionInfo={connectionInfo}
          />
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden' }}>
          <h3>Schema Browser</h3>
          <SchemaViewer schema={schema} />
        </div>

        <div className="sidebar-section">
          <h3>History</h3>
          <QueryHistory history={history} onSelect={handleHistorySelect} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="top-bar">
          <div className="connection-status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            {connected ? connectionInfo : 'Not connected'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {connected
              ? `${schema.length} table(s) loaded`
              : 'Connect to a database or just convert English to SQL'}
          </div>
        </div>

        <div className="workspace">
          {/* Query Input */}
          <QueryInput onSubmit={handleConvert} disabled={converting} />

          {/* Loading indicator for conversion */}
          {converting && (
            <div className="loading-overlay">
              <span className="loading-spinner" />
              Converting your English to SQL...
            </div>
          )}

          {/* SQL Preview & Editor */}
          <SqlPreview
            sql={sql}
            type={sqlType}
            onSqlChange={setSql}
            onExecute={handleExecute}
            onClear={handleClearSql}
            loading={executing}
          />

          {/* Results */}
          {(result || queryError || (!sql && !converting)) && (
            <ResultsTable result={result} error={queryError} />
          )}
        </div>
      </main>
    </div>
  );
}
