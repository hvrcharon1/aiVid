import { useState } from 'react';

export default function QueryInput({ onSubmit, disabled }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="query-section">
      <div className="query-input-wrapper">
        <textarea
          className="query-input"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want in plain English... (e.g. 'Show all employees who joined after 2020 with salary above 50000')"
          disabled={disabled}
        />
        <button
          className="btn btn-primary query-submit-btn"
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
        >
          Convert to SQL
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Press Ctrl+Enter to submit
      </div>
    </div>
  );
}
