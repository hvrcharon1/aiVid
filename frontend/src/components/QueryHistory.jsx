export default function QueryHistory({ history, onSelect }) {
  if (history.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Your query history will appear here
      </div>
    );
  }

  return (
    <ul className="history-list">
      {history.map((item, i) => (
        <li key={i} className="history-item" onClick={() => onSelect(item)}>
          <div className="history-prompt">{item.prompt}</div>
          <div className="history-time">{item.time}</div>
        </li>
      ))}
    </ul>
  );
}
