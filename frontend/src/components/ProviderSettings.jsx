import { useState, useEffect } from 'react';
import * as api from '../services/api';

const STORAGE_KEY = 'oracle-nlp-provider-config';

function loadSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { provider: 'anthropic', model: '', apiKey: '' };
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function ProviderSettings({ onConfigChange }) {
  const [providers, setProviders] = useState([]);
  const [config, setConfig] = useState(loadSaved);
  const [showKey, setShowKey] = useState(false);

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

  const currentProvider = providers.find(p => p.name === config.provider);
  const models = currentProvider?.models || [];

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    const newProvider = providers.find(p => p.name === provider);
    setConfig({
      provider,
      model: newProvider?.models?.[0]?.id || '',
      apiKey: '',
    });
  };

  const handleModelChange = (e) => {
    setConfig(prev => ({ ...prev, model: e.target.value }));
  };

  const handleApiKeyChange = (e) => {
    setConfig(prev => ({ ...prev, apiKey: e.target.value }));
  };

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
        <label>Model</label>
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
    </div>
  );
}
