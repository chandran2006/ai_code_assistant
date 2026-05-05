import React from 'react';
import CopyButton from './CopyButton';

const extractCode = (raw) => {
  if (!raw) return '';
  const match = raw.match(/```[\w]*\n([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
};

const CompareView = ({ originalCode, fixedCode }) => {
  const original = originalCode || '';
  const fixed = extractCode(fixedCode);

  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');
  const maxLines = Math.max(originalLines.length, fixedLines.length);

  return (
    <div style={s.wrapper}>
      <div style={s.pane}>
        <div style={s.paneHeader}>
          <span style={s.paneLabel}>⬅ Original</span>
          <CopyButton text={original} />
        </div>
        <pre style={s.pre}>
          {Array.from({ length: maxLines }, (_, i) => (
            <div
              key={i}
              style={{
                ...s.line,
                ...(originalLines[i] !== fixedLines[i] && originalLines[i] !== undefined
                  ? s.lineRemoved
                  : {}),
              }}
            >
              <span style={s.lineNum}>{i + 1}</span>
              <span>{originalLines[i] ?? ''}</span>
            </div>
          ))}
        </pre>
      </div>

      <div style={s.divider} />

      <div style={s.pane}>
        <div style={s.paneHeader}>
          <span style={{ ...s.paneLabel, color: 'var(--success)' }}>➡ Fixed</span>
          <CopyButton text={fixed} />
        </div>
        <pre style={s.pre}>
          {Array.from({ length: maxLines }, (_, i) => (
            <div
              key={i}
              style={{
                ...s.line,
                ...(originalLines[i] !== fixedLines[i] && fixedLines[i] !== undefined
                  ? s.lineAdded
                  : {}),
              }}
            >
              <span style={s.lineNum}>{i + 1}</span>
              <span>{fixedLines[i] ?? ''}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

const s = {
  wrapper: {
    display: 'flex',
    height: '100%',
    gap: 0,
    overflow: 'hidden',
    animation: 'fadeIn 0.25s ease',
  },
  pane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  paneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  paneLabel: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-code)',
    color: 'var(--error)',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  pre: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    margin: 0,
    padding: 0,
    fontSize: '0.8rem',
    lineHeight: 1.6,
    fontFamily: 'var(--font-code)',
    background: '#0d0d14',
  },
  line: {
    display: 'flex',
    gap: 12,
    padding: '1px 12px',
    color: '#cdd6f4',
    minHeight: '1.6em',
  },
  lineAdded: {
    background: 'rgba(74, 222, 128, 0.08)',
    borderLeft: '3px solid var(--success)',
  },
  lineRemoved: {
    background: 'rgba(248, 113, 113, 0.08)',
    borderLeft: '3px solid var(--error)',
  },
  lineNum: {
    color: 'var(--text-muted)',
    userSelect: 'none',
    minWidth: 28,
    textAlign: 'right',
    flexShrink: 0,
  },
  divider: {
    width: 1,
    background: 'var(--border)',
    flexShrink: 0,
  },
};

export default CompareView;
