import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const STORAGE_KEY = 'oracle-nlp-provider-config';

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { provider: 'anthropic', model: '', apiKey: '', extraFields: {} };
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function ProviderSettings({ onConfigChange }) {
  const [providers, setProviders] = useState([]);
  const [config, setConfig] = useState(loadSaved);
  const [showKey, setShowKey] = useState(false);

  // Connection test state: null | 'testing' | 'connected' | 'error'
  const [testStatus, setTestStatus] = useState(null);
  const [testError, setTestError] = useState('');

  // Fetch providers list on mount
  useEffect(() => {
    api.fetchProviders().then(res => {
      if (res.providers) setProviders(res.providers);
    }).catch(() => {});
  }, []);

  // Notify parent whenever config changes
  useEffect(() => {
    saveConfig(config);
    onConfigChange(config);
  }, [config, onConfigChange]);

  // Reset test status when provider, model, apiKey, or extra fields change
  useEffect(() => {
    setTestStatus(null);
    setTestError('');
  }, [config.provider, config.model, config.apiKey, config.extraFields]);

  const currentProvider = providers.find(p => p.name === config.provider);
  const models = currentProvider?.models || [];
  const extraFields = currentProvider?.extraFields || [];

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    const newProvider = providers.find(p => p.name === provider);
    setConfig({
      provider,
      model: newProvider?.models?.[0]?.id || '',
      apiKey: '',
      extraFields: {},
    });
  };

  const handleModelChange = (e) => {
    setConfig(prev => ({ ...prev, model: e.target.value }));
  };

  const handleApiKeyChange = (e) => {
    setConfig(prev => ({ ...prev, apiKey: e.target.value }));
  };

  const handleExtraFieldChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      extraFields: { ...prev.extraFields, [key]: value },
    }));
  };

  const handleTestConnection = useCallback(async () => {
    setTestStatus('testing');
    setTestError('');
    try {
      const res = await api.testProvider({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        extraFields: config.extraFields,
      });
      if (res.success) {
        setTestStatus('connected');
      } else {
        setTestStatus('error');
        setTestError(res.error || 'Connection failed');
      }
    } catch (err) {
      setTestStatus('error');
      setTestError(err.message);
    }
  }, [config]);

  return (
    <div className="connection-form">
      {/* Provider Select */}
      <div className="form-group">
        <label>AI Provider</label>
        <select
          className="form-select"
          value={config.provider}
          onChange={handleProviderChange}
        >
          {providers.map(p => (
            <option key={p.name} value={p.name}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Model Select */}
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Model
          {testStatus === 'connected' && (
            <span className="status-dot connected" title="Connected" />
          )}
          {testStatus === 'error' && (
            <span className="status-dot disconnected" title={testError} />
          )}
        </label>
        <select
          className="form-select"
          value={config.model}
          onChange={handleModelChange}
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Extra Fields (e.g. Azure Endpoint for Copilot, Ollama Host URL) */}
      {extraFields.map(field => (
        <div className="form-group" key={field.key}>
          <label>{field.label}</label>
          <input
            type={field.type || 'text'}
            value={config.extraFields?.[field.key] || ''}
            onChange={e => handleExtraFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </div>
      ))}

      {/* API Key */}
      <div className="form-group">
        <label>
          API Key
          <span
            style={{ marginLeft: 8, cursor: 'pointer', fontSize: 11, color: 'var(--accent)' }}
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? 'hide' : 'show'}
          </span>
        </label>
        <input
          type={showKey ? 'text' : 'password'}
          value={config.apiKey}
          onChange={handleApiKeyChange}
          placeholder={`Enter ${currentProvider?.label || ''} API key (or set in .env)`}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          Optional if set in server .env
        </span>
      </div>

      {/* Test Connection */}
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleTestConnection}
        disabled={testStatus === 'testing'}
        style={{ width: '100%' }}
      >
        {testStatus === 'testing'
          ? <><span className="loading-spinner" /> Testing...</>
          : testStatus === 'connected'
            ? 'Connected'
            : 'Test Connection'}
      </button>
      {testStatus === 'error' && (
        <div style={{ fontSize: 11, color: 'var(--error)', marginTop: 2, wordBreak: 'break-word' }}>
          {testError}
        </div>
      )}
    </div>
  );
}
