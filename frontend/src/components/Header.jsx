import React from 'react';
import { useNavigate } from 'react-router-dom';

const LANG_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'python',     label: 'Python',     icon: '🐍' },
  { value: 'java',       label: 'Java',       icon: '☕' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'c',          label: 'C',          icon: '🔵' },
  { value: 'cpp',        label: 'C++',        icon: '⚙️' },
  { value: 'go',         label: 'Go',         icon: '🐹' },
  { value: 'rust',       label: 'Rust',       icon: '🦀' },
];

const Header = ({
  language, onLanguageChange,
  explainLike5, onToggleExplain,
  roastMode, onToggleRoast,
  onAnalyze, onHome, loading, cooldown,
}) => {
  const navigate = useNavigate();
  return (
  <header style={styles.header}>
    <div style={{ ...styles.logo, cursor: 'pointer' }} onClick={onHome}>
      <div style={styles.logoIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 3L4 7l4 4M16 3l4 4-4 4M14 3l-4 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div style={styles.logoText}>AI Code Assistant Pro+</div>
        <div style={styles.logoTagline}>Fix, analyze, optimize &amp; understand deeply</div>
      </div>
    </div>

    <div style={styles.controls}>
      {/* Compiler nav */}
      <button
        onClick={() => navigate('/compiler')}
        style={styles.compilerBtn}
        title="Open Compiler"
      >
        <span>▶️</span>
        <span>Compiler</span>
      </button>

      {/* Roast Mode */}
      <button
        onClick={onToggleRoast}
        style={{ ...styles.toggleBtn, ...(roastMode ? styles.roastActive : {}) }}
        title={roastMode ? 'Savage Roast ON 🔥' : 'Enable Roast Mode'}
      >
        <span>{roastMode ? '🔥' : '😈'}</span>
        <span>{roastMode ? 'Savage' : 'Roast'}</span>
      </button>

      {/* ELI5 */}
      <button
        onClick={onToggleExplain}
        style={{ ...styles.toggleBtn, ...(explainLike5 ? styles.toggleActive : {}) }}
        title="Explain Like I'm 5"
      >
        <span>🧒</span>
        <span>ELI5</span>
      </button>

      {/* Language */}
      <div style={styles.selectWrapper}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={styles.select}
        >
          {LANG_OPTIONS.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.icon} {lang.label}
            </option>
          ))}
        </select>
        <span style={styles.selectArrow}>▾</span>
      </div>

      {/* Analyze */}
      <button
        onClick={onAnalyze}
        disabled={loading || cooldown > 0}
        style={{ ...styles.analyzeBtn, ...((loading || cooldown > 0) ? styles.analyzeBtnLoading : {}) }}
      >
        {loading ? (
          <><span style={styles.spinner} />Analyzing…</>
        ) : cooldown > 0 ? (
          <><span>⏳</span>Wait {cooldown}s</>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="var(--bg-primary)" stroke="var(--bg-primary)" strokeWidth="1"/>
            </svg>
            Analyze Code
          </>
        )}
      </button>
    </div>
  </header>
  );
};

const styles = {
  header: {
    height: 'var(--header-h)',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(8px)',
    flexShrink: 0,
  },
  logo:        { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36, height: 36,
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText:    { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  logoTagline: { fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' },
  controls:    { display: 'flex', alignItems: 'center', gap: 8 },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem', fontWeight: 500,
    fontFamily: 'var(--font-ui)',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  roastActive:     { background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.45)', color: '#f87171' },
  toggleActive:    { background: 'rgba(251,191,36,0.1)',   border: '1px solid rgba(251,191,36,0.4)',   color: '#fbbf24' },
  compilerBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    background: 'rgba(74,222,128,0.1)',
    border: '1px solid rgba(74,222,128,0.35)',
    borderRadius: 'var(--radius)',
    color: 'var(--success)',
    fontSize: '0.78rem', fontWeight: 600,
    fontFamily: 'var(--font-ui)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  selectWrapper:   { position: 'relative', display: 'flex', alignItems: 'center' },
  select: {
    appearance: 'none',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    padding: '6px 32px 6px 12px',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-ui)',
    cursor: 'pointer',
    outline: 'none',
  },
  selectArrow: { position: 'absolute', right: 10, fontSize: '0.65rem', color: 'var(--text-muted)', pointerEvents: 'none' },
  analyzeBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 18px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: 'var(--bg-primary)',
    fontSize: '0.85rem', fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '-0.01em',
    boxShadow: '0 0 16px var(--accent-glow)',
  },
  analyzeBtnLoading: { opacity: 0.7, cursor: 'not-allowed', boxShadow: 'none' },
  spinner: {
    width: 14, height: 14,
    border: '2px solid var(--bg-primary)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
};

export default Header;
export { LANG_OPTIONS };
