import { useState } from 'react';

export default function SchemaViewer({ schema }) {
  const [expanded, setExpanded] = useState(null);

  if (!schema || schema.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Connect to a database to browse tables
      </div>
    );
  }

  return (
    <ul className="schema-list">
      {schema.map(table => (
        <li key={table.tableName}>
          <div
            className={`schema-item ${expanded === table.tableName ? 'active' : ''}`}
            onClick={() => setExpanded(expanded === table.tableName ? null : table.tableName)}
          >
            {expanded === table.tableName ? '▾' : '▸'} {table.tableName}
          </div>
          {expanded === table.tableName && (
            <ul className="schema-columns">
              {table.columns.map(col => (
                <li key={col.name} className="schema-column">
                  {col.name} <span className="col-type">{col.type}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
