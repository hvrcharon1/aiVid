import { useState } from 'react';

export default function ConnectionForm({ onConnect, onDisconnect, isConnected, connectionInfo }) {
  const [config, setConfig] = useState({
    host: 'localhost',
    port: '1521',
    serviceName: 'ORCL',
    user: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config.user || !config.password) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConnect(config);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="connection-form">
        <div className="connection-status">
          <span className="status-dot connected" />
          <span>Connected to {connectionInfo}</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <form className="connection-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Host</label>
          <input
            value={config.host}
            onChange={e => handleChange('host', e.target.value)}
            placeholder="localhost"
          />
        </div>
        <div className="form-group" style={{ maxWidth: 80 }}>
          <label>Port</label>
          <input
            value={config.port}
            onChange={e => handleChange('port', e.target.value)}
            placeholder="1521"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Service Name</label>
        <input
          value={config.serviceName}
          onChange={e => handleChange('serviceName', e.target.value)}
          placeholder="ORCL"
        />
      </div>
      <div className="form-group">
        <label>Username</label>
        <input
          value={config.user}
          onChange={e => handleChange('user', e.target.value)}
          placeholder="Enter username"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={config.password}
          onChange={e => handleChange('password', e.target.value)}
          placeholder="Enter password"
        />
      </div>
      {error && <div className="error-box">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? <><span className="loading-spinner" /> Connecting...</> : 'Connect'}
      </button>
    </form>
  );
}
