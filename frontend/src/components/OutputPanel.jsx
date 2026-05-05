import React, { useState, useRef, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';
import ScoreGauge from './ScoreGauge';
import CopyButton from './CopyButton';
import CompareView from './CompareView';

// ── Tab groups ───────────────────────────────────────────────
const CORE_TABS = [
  { id: 'bugs',        label: 'Bugs',    icon: '🐛', color: 'var(--error)' },
  { id: 'fixedCode',   label: 'Fix',     icon: '🔧', color: 'var(--success)' },
  { id: 'explanation', label: 'Explain', icon: '💡', color: 'var(--warning)' },
  { id: 'score',       label: 'Score',   icon: '📊', color: 'var(--orange)' },
];

const MORE_TABS = [
  { id: 'compare',              label: 'Compare View',      icon: '🔀', color: 'var(--accent)' },
  { id: 'optimization',        label: 'Optimizations',     icon: '⚡', color: 'var(--accent)' },
  { id: 'testCases',           label: 'Test Cases',        icon: '🧪', color: 'var(--purple)' },
  { id: 'complexity',          label: 'Complexity',        icon: '⏱️', color: '#38bdf8' },
  { id: 'complexityComparison',label: 'Compare Complexity',icon: '📋', color: '#34d399' },
  { id: 'realWorldImpact',     label: 'Real-World Impact', icon: '🌍', color: '#fb923c' },
  { id: 'roast',               label: 'Roast 🔥',          icon: '😈', color: '#f87171' },
  { id: 'interviewMode',       label: 'Interview',         icon: '🎯', color: '#818cf8' },
  { id: 'badge',               label: 'Dev Badge',         icon: '🏅', color: 'var(--warning)' },
];

const NO_COPY = ['compare', 'badge', 'score', 'complexity', 'interviewMode'];

// ── Utility panels ───────────────────────────────────────────
const EmptyPanel = () => (
  <div style={misc.center}>
    <div style={{ opacity: 0.35 }}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path d="M8 3L4 7l4 4M16 3l4 4-4 4M14 3l-4 18" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <p style={misc.title}>Awaiting analysis</p>
    <p style={misc.sub}>Paste code on the left and click <strong style={{ color: 'var(--accent)' }}>Analyze Code</strong></p>
    <div style={misc.chips}>
      {['Bugs','Auto-fix','Compare','Explain','Optimize','Tests','Score','Complexity','Impact','Roast','Badge'].map(f => (
        <span key={f} style={misc.chip}>{f}</span>
      ))}
    </div>
  </div>
);

const LoadingPanel = () => (
  <div style={misc.center}>
    <div style={misc.spinner} />
    <p style={misc.title}>Analyzing your code…</p>
    <p style={misc.sub}>Usually takes 5–20 seconds</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      {['Parsing structure', 'Detecting bugs', 'Analyzing complexity', 'Generating fixes', 'Writing explanations'].map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-secondary)', animation: 'fadeIn 0.5s ease forwards', opacity: 0, animationDelay: `${i * 0.4}s` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <span>{step}</span>
        </div>
      ))}
    </div>
  </div>
);

const ErrorPanel = ({ error }) => {
  const isRateLimit = error === 'rate_limit';
  return (
    <div style={misc.center}>
      <div style={{ fontSize: '2rem' }}>{isRateLimit ? '⏳' : '⚠️'}</div>
      <p style={{ ...misc.title, color: isRateLimit ? 'var(--warning)' : 'var(--error)' }}>
        {isRateLimit ? 'Rate Limit Reached' : 'Analysis Failed'}
      </p>
      <p style={misc.sub}>
        {isRateLimit
          ? 'Groq API is rate-limited. The button will re-enable automatically — please wait a moment.'
          : error}
      </p>
    </div>
  );
};

// ── Rich panels ──────────────────────────────────────────────
const ComplexityPanel = ({ timeComplexity, spaceComplexity }) => {
  const extractNotation = (str) => str?.match(/O\([^)]+\)/)?.[0] || str?.split('\u2014')[0]?.trim() || str?.split('—')[0]?.trim() || '';

  const parseTime = (raw) => raw ? {
    best:  raw.match(/\*{0,2}Best Case\*{0,2}:?\s*(.*)/i)?.[1]?.trim() || '',
    avg:   raw.match(/\*{0,2}Average Case\*{0,2}:?\s*(.*)/i)?.[1]?.trim() || '',
    worst: raw.match(/\*{0,2}Worst Case\*{0,2}:?\s*(.*)/i)?.[1]?.trim() || '',
    deriv: raw.match(/\*{0,2}Derivation\*{0,2}:?\s*([\s\S]*?)(?=\n\*{0,2}(?:Best|Average|Worst|Space)\b|$)/i)?.[1]?.trim() || '',
  } : {};

  const parseSpace = (raw) => raw ? {
    space:   raw.match(/\*{0,2}Space Used\*{0,2}:?\s*(.*)/i)?.[1]?.trim() || '',
    details: raw.match(/\*{0,2}Details\*{0,2}:?\s*([\s\S]*?)(?=\n\*{0,2}\w|$)/i)?.[1]?.trim() || '',
  } : {};

  const t  = parseTime(timeComplexity);
  const sp = parseSpace(spaceComplexity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.25s ease' }}>
      {/* Time */}
      <div style={cxS.section}>
        <div style={cxS.sectionTitle}>⏱️ Time Complexity</div>
        <div style={cxS.grid}>
          {[
            { label: 'Best Case',    value: t.best,  color: '#4ade80' },
            { label: 'Average Case', value: t.avg,   color: '#fbbf24' },
            { label: 'Worst Case',   value: t.worst, color: '#f87171' },
          ].filter(c => c.value).map(({ label, value, color }) => (
            <div key={label} style={{ ...cxS.card, borderColor: color + '55' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, opacity: 0.9 }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-code)', color }}>{extractNotation(value)}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value.replace(/O\([^)]+\)\s*[—-]?\s*/i, '').trim()}</div>
            </div>
          ))}
        </div>
        {!t.best && !t.avg && !t.worst && timeComplexity && <MarkdownContent content={timeComplexity} />}
        {t.deriv && (
          <div style={cxS.box}>
            <div style={cxS.boxTitle}>📐 Derivation</div>
            <MarkdownContent content={t.deriv} />
          </div>
        )}
      </div>

      {/* Space */}
      <div style={cxS.section}>
        <div style={cxS.sectionTitle}>🗂️ Space Complexity</div>
        {sp.space ? (
          <>
            <div style={{ ...cxS.card, borderColor: '#818cf855', maxWidth: 260 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', opacity: 0.9 }}>Memory Usage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-code)', color: '#818cf8' }}>{extractNotation(sp.space)}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sp.space.replace(/O\([^)]+\)\s*[—-]?\s*/i, '').trim()}</div>
            </div>
            {sp.details && (
              <div style={cxS.box}>
                <div style={cxS.boxTitle}>📦 Memory Details</div>
                <MarkdownContent content={sp.details} />
              </div>
            )}
          </>
        ) : spaceComplexity ? (
          <MarkdownContent content={spaceComplexity} />
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No space complexity data.</p>
        )}
      </div>
    </div>
  );
};

const InterviewPanel = ({ content }) => {
  if (!content || content.trim().toLowerCase() === 'interview mode is currently disabled.')
    return (
      <div style={misc.center}>
        <div style={{ fontSize: '2rem' }}>🎯</div>
        <p style={misc.title}>Interview Mode is off</p>
        <p style={misc.sub}>Interview analysis will appear here after you analyze your code.</p>
      </div>
    );
  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>🎯</span>
        <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>Interview Mode — explain your code like you're in a coding interview</span>
      </div>
      <MarkdownContent content={content} />
    </div>
  );
};

const RoastPanel = ({ roast }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '24px 8px', animation: 'fadeIn 0.3s ease' }}>
    <div style={{ fontSize: '2.5rem' }}>🔥</div>
    <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '16px 20px', maxWidth: 460 }}>
      <p style={{ fontSize: '0.93rem', color: 'var(--text-primary)', lineHeight: 1.75, fontStyle: 'italic', margin: 0 }}>
        {roast || 'Your code might actually be decent 🤔'}
      </p>
    </div>
    <CopyButton text={roast || ''} />
  </div>
);

const BadgePanel = ({ badge, score }) => {
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--error)';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 44px', background: 'var(--bg-card)', border: `2px solid ${color}`, borderRadius: 14, boxShadow: `0 0 24px ${color}33` }}>
        <div style={{ fontSize: '3rem' }}>🏅</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color, textAlign: 'center' }}>{badge || 'Code Warrior 🛡️'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Earned based on your code analysis</div>
      </div>
    </div>
  );
};

// ── More dropdown ────────────────────────────────────────────
const MoreDropdown = ({ activeTab, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeMeta = MORE_TABS.find(t => t.id === activeTab);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          ...tabS.tab,
          ...(activeMeta ? { ...tabS.tabActive, borderBottomColor: activeMeta.color, color: activeMeta.color } : {}),
        }}
      >
        {activeMeta
          ? <><span>{activeMeta.icon}</span><span>{activeMeta.label}</span></>
          : <span>More ▾</span>
        }
      </button>

      {open && (
        <div style={dropS.menu}>
          {MORE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onSelect(tab.id); setOpen(false); }}
              style={{ ...dropS.item, ...(activeTab === tab.id ? { background: 'var(--bg-hover)' } : {}) }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{tab.icon}</span>
              <span style={{ color: activeTab === tab.id ? tab.color : 'var(--text-secondary)' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main OutputPanel ─────────────────────────────────────────
const OutputPanel = ({ result, loading, error, processingTime, originalCode }) => {
  const [activeTab, setActiveTab] = useState('bugs');

  const renderContent = () => {
    if (loading) return <LoadingPanel />;
    if (error)   return <ErrorPanel error={error} />;
    if (!result) return <EmptyPanel />;

    switch (activeTab) {
      case 'score':               return <ScoreGauge score={result.score} />;
      case 'compare':             return <CompareView originalCode={originalCode} fixedCode={result.fixedCode} />;
      case 'badge':               return <BadgePanel badge={result.badge} score={result.score} />;
      case 'roast':               return <RoastPanel roast={result.roast} />;
      case 'interviewMode':       return <InterviewPanel content={result.interviewMode} />;
      case 'complexity':          return <ComplexityPanel timeComplexity={result.timeComplexity} spaceComplexity={result.spaceComplexity} />;
      case 'complexityComparison': return <div style={{ animation: 'fadeIn 0.2s ease' }}><MarkdownContent content={result.complexityComparison} /></div>;
      case 'realWorldImpact':     return <div style={{ animation: 'fadeIn 0.2s ease' }}><MarkdownContent content={result.realWorldImpact} /></div>;
      default:                    return <div style={{ animation: 'fadeIn 0.2s ease' }}><MarkdownContent content={result[activeTab]} /></div>;
    }
  };

  const copyText = NO_COPY.includes(activeTab) ? '' : (result?.[activeTab] || '');

  return (
    <div style={panelS.panel}>
      {/* Header */}
      <div style={panelS.header}>
        <span style={panelS.title}>Analysis Output</span>
        {processingTime && <span style={panelS.timing}>⚡ {(processingTime / 1000).toFixed(1)}s</span>}
        {result && <CopyButton text={copyText} style={{ marginLeft: 'auto' }} />}
      </div>

      {/* Tab bar: Core tabs + divider + More dropdown */}
      {result && (
        <div style={tabS.bar}>
          {CORE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ ...tabS.tab, ...(activeTab === tab.id ? { ...tabS.tabActive, borderBottomColor: tab.color, color: tab.color } : {}) }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'score' && result.score != null && (
                <span style={{ padding: '1px 6px', borderRadius: 10, fontSize: '0.68rem', fontFamily: 'var(--font-code)', fontWeight: 700, background: tab.color + '22', color: tab.color }}>
                  {result.score}
                </span>
              )}
            </button>
          ))}
          <div style={tabS.divider} />
          <MoreDropdown activeTab={activeTab} onSelect={setActiveTab} />
        </div>
      )}

      {/* Content */}
      <div style={panelS.content}>{renderContent()}</div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────
const panelS = {
  panel:   { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', overflow: 'hidden' },
  header:  { height: 38, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, background: 'var(--bg-secondary)', flexShrink: 0 },
  title:   { fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  timing:  { fontSize: '0.72rem', color: 'var(--success)', fontFamily: 'var(--font-code)' },
  content: { flex: 1, overflowY: 'auto', padding: 16 },
};

const tabS = {
  bar:      { display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 },
  tab:      { display: 'flex', alignItems: 'center', gap: 5, padding: '9px 13px', background: 'transparent', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-ui)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease', flexShrink: 0 },
  tabActive:{ background: 'var(--bg-panel)' },
  divider:  { width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 },
};

const dropS = {
  menu: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 6, zIndex: 200, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: 2 },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-ui)', transition: 'background 0.1s', width: '100%', textAlign: 'left' },
};

const misc = {
  center:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 24, textAlign: 'center' },
  title:   { fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  sub:     { fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 320, margin: 0 },
  spinner: { width: 38, height: 38, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  chips:   { display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 4 },
  chip:    { padding: '3px 10px', background: 'var(--accent-dim)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, fontSize: '0.72rem', color: 'var(--accent)' },
};

const cxS = {
  section:      { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 6, borderBottom: '1px solid var(--border)' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 },
  card:         { display: 'flex', flexDirection: 'column', gap: 5, padding: 14, background: 'var(--bg-card)', border: '2px solid', borderRadius: 10 },
  box:          { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' },
  boxTitle:     { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' },
};

export default OutputPanel;
