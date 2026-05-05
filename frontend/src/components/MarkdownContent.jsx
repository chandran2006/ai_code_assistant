import React from 'react';
import CopyButton from './CopyButton';

/**
 * Renders LLM markdown output with styled code blocks.
 * Handles fenced code blocks and converts numbered lists.
 */
const MarkdownContent = ({ content }) => {
  if (!content) return <EmptyState />;

  // Split on fenced code blocks
  const parts = content.split(/(```[\w]*\n[\s\S]*?```)/g);

  return (
    <div style={styles.wrapper}>
      {parts.map((part, i) => {
        const codeMatch = part.match(/```([\w]*)\n([\s\S]*?)```/);
        if (codeMatch) {
          const lang = codeMatch[1] || 'code';
          const code = codeMatch[2].trim();
          return (
            <div key={i} style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLang}>{lang}</span>
                <CopyButton text={code} />
              </div>
              <pre style={styles.pre}>
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render text with basic formatting
        return (
          <div key={i} style={styles.text}>
            {part.split('\n').map((line, j) => {
              if (!line.trim()) return <br key={j} />;

              // Numbered list items
              const numMatch = line.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={j} style={styles.listItem}>
                    <span style={styles.listNum}>{numMatch[1]}.</span>
                    <span>{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Bullet items
              if (line.match(/^[-*]\s+/)) {
                return (
                  <div key={j} style={styles.bulletItem}>
                    <span style={styles.bullet}>•</span>
                    <span>{renderInline(line.replace(/^[-*]\s+/, ''))}</span>
                  </div>
                );
              }

              return <p key={j} style={styles.para}>{renderInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Render inline `code` and **bold** spans */
const renderInline = (text) => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={i} style={inlineStyles.code}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} style={inlineStyles.bold}>{token.slice(2, -2)}</strong>;
    }
    return token;
  });
};

const EmptyState = () => (
  <div style={styles.empty}>
    <span style={styles.emptyIcon}>—</span>
    <span>No content for this section</span>
  </div>
);

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    animation: 'fadeIn 0.25s ease',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  para: {
    color: 'var(--text-primary)',
    lineHeight: 1.7,
    fontSize: '0.875rem',
  },
  listItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: '4px 0',
  },
  listNum: {
    color: 'var(--accent)',
    fontFamily: 'var(--font-code)',
    fontSize: '0.8rem',
    fontWeight: 700,
    minWidth: 20,
    paddingTop: 2,
  },
  bulletItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: '3px 0',
  },
  bullet: {
    color: 'var(--accent)',
    fontSize: '0.8rem',
    minWidth: 14,
    paddingTop: 2,
  },
  codeBlock: {
    background: '#0d0d14',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  codeLang: {
    fontSize: '0.72rem',
    color: 'var(--accent)',
    fontFamily: 'var(--font-code)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  pre: {
    padding: '14px 16px',
    overflowX: 'auto',
    margin: 0,
    fontSize: '0.82rem',
    lineHeight: 1.65,
    color: '#cdd6f4',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    padding: '20px 0',
  },
  emptyIcon: {
    fontFamily: 'var(--font-code)',
  },
};

const inlineStyles = {
  code: {
    background: 'rgba(0, 212, 255, 0.1)',
    color: 'var(--accent)',
    fontFamily: 'var(--font-code)',
    fontSize: '0.82em',
    padding: '1px 6px',
    borderRadius: 4,
    border: '1px solid rgba(0, 212, 255, 0.2)',
  },
  bold: {
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
};

export default MarkdownContent;
