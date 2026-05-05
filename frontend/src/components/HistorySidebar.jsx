import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const LANG_ICONS = {
  javascript: '⚡',
  python: '🐍',
  java: '☕',
  typescript: '🔷',
  c: '🔵',
  cpp: '⚙️',
  go: '🐹',
  rust: '🦀',
};

const scoreColor = (score) => {
  if (!score) return 'var(--text-muted)';
  if (score >= 80) return 'var(--score-high)';
  if (score >= 50) return 'var(--score-mid)';
  return 'var(--score-low)';
};

const HistorySidebar = ({ history, loading, onSelect, isOpen, onToggle }) => {
  return (
    <>
      {/* Toggle button */}
      <button onClick={onToggle} style={styles.toggleBtn} title="Toggle history">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {!isOpen && <span style={styles.toggleLabel}>History</span>}
      </button>

      {/* Sidebar drawer */}
      <aside style={{ ...styles.sidebar, ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed) }}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarTitle}>Query History</span>
          <button onClick={onToggle} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.list}>
          {loading && (
            <div style={styles.loading}>Loading history…</div>
          )}

          {!loading && history.length === 0 && (
            <div style={styles.empty}>
              <p>No previous queries</p>
              <p style={styles.emptySub}>Your analyzed code will appear here</p>
            </div>
          )}

          {history.map((item) => (
            <button
              key={item._id}
              onClick={() => { onSelect(item); onToggle(); }}
              style={styles.item}
            >
              <div style={styles.itemTop}>
                <span style={styles.lang}>
                  {LANG_ICONS[item.language] || '📄'} {item.language}
                </span>
                {item.result?.score !== undefined && item.result?.score !== null && (
                  <span style={{ ...styles.score, color: scoreColor(item.result.score) }}>
                    {item.result.score}/100
                  </span>
                )}
              </div>
              <div style={styles.preview}>
                {item.code?.split('\n')[0]?.slice(0, 55) || 'No preview'}
              </div>
              <div style={styles.time}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </div>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

const styles = {
  toggleBtn: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-bright)',
    borderRadius: 24,
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'all 0.15s ease',
  },
  toggleLabel: {
    fontSize: '0.78rem',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 300,
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border)',
    zIndex: 300,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    transform: 'translateX(100%)',
  },
  sidebarHeader: {
    height: 'var(--header-h)',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 4,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  loading: {
    padding: 16,
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    textAlign: 'center',
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    lineHeight: 1.7,
  },
  emptySub: {
    fontSize: '0.75rem',
    marginTop: 4,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    padding: '10px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.12s ease',
    width: '100%',
    fontFamily: 'var(--font-ui)',
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lang: {
    fontSize: '0.75rem',
    color: 'var(--accent)',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  score: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-code)',
    fontWeight: 600,
  },
  preview: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-code)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  time: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
};

export default HistorySidebar;
