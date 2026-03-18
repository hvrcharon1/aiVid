export default function SqlPreview({ sql, type, onSqlChange, onExecute, onClear, loading }) {
  if (!sql) return null;

  return (
    <div className="sql-panel">
      <div className="sql-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3>Generated SQL</h3>
          <span className={`sql-type-badge ${type}`}>{type}</span>
        </div>
        <div className="sql-panel-actions">
          <button className="btn btn-secondary btn-sm" onClick={onClear}>
            Clear
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={onExecute}
            disabled={loading}
          >
            {loading ? <><span className="loading-spinner" /> Running...</> : 'Execute'}
          </button>
        </div>
      </div>
      <textarea
        className="sql-editor"
        value={sql}
        onChange={e => onSqlChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
