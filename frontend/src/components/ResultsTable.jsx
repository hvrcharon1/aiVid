export default function ResultsTable({ result, error }) {
  if (error) {
    return (
      <div className="results-panel">
        <div className="results-header">
          <h3>Error</h3>
        </div>
        <div className="error-box" style={{ margin: 16, borderRadius: 6 }}>
          {error}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="results-header">
          <h3>Results</h3>
        </div>
        <div className="results-empty">
          Execute a query to see results here
        </div>
      </div>
    );
  }

  // DML result (no rows)
  if (!result.columns || result.columns.length === 0) {
    return (
      <div className="results-panel">
        <div className="results-header">
          <h3>Result</h3>
          <div className="results-meta">
            <span>{result.duration}</span>
          </div>
        </div>
        <div className="results-message">
          {result.rowsAffected !== undefined
            ? `${result.rowsAffected} row(s) affected`
            : 'Statement executed successfully'}
          {' '}({result.duration})
        </div>
      </div>
    );
  }

  // SELECT result with rows
  return (
    <div className="results-panel">
      <div className="results-header">
        <h3>Results</h3>
        <div className="results-meta">
          <span>{result.rowCount} row(s)</span>
          <span>{result.duration}</span>
        </div>
      </div>
      <div className="results-table-wrapper">
        {result.rows.length === 0 ? (
          <div className="results-empty">Query returned no rows</div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                {result.columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>
                  {result.columns.map(col => (
                    <td key={col} title={String(row[col] ?? '')}>
                      {row[col] === null ? <span style={{ color: 'var(--text-muted)' }}>NULL</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
