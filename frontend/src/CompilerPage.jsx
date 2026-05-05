import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { runCode } from './utils/api';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '⚡', ext: 'js',  comment: '// JavaScript\n' },
  { value: 'python',     label: 'Python',     icon: '🐍', ext: 'py',  comment: '# Python\n' },
  { value: 'java',       label: 'Java',       icon: '☕', ext: 'java', comment: '// Java\n' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷', ext: 'ts',  comment: '// TypeScript\n' },
  { value: 'c',          label: 'C',          icon: '🔵', ext: 'c',   comment: '// C\n' },
  { value: 'cpp',        label: 'C++',        icon: '⚙️', ext: 'cpp', comment: '// C++\n' },
  { value: 'go',         label: 'Go',         icon: '🐹', ext: 'go',  comment: '// Go\n' },
  { value: 'rust',       label: 'Rust',       icon: '🦀', ext: 'rs',  comment: '// Rust\n' },
];

const STARTER = {
  javascript: `// JavaScript — Hello World\nconsole.log("Hello, World!");\n\n// Try some code:\nconst nums = [1, 2, 3, 4, 5];\nconst sum = nums.reduce((a, b) => a + b, 0);\nconsole.log("Sum:", sum);`,
  python:     `# Python — Hello World\nprint("Hello, World!")\n\n# Try some code:\nnums = [1, 2, 3, 4, 5]\nprint("Sum:", sum(nums))`,
  java:       `// Java — Hello World\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  typescript: `// TypeScript — Hello World\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("World"));`,
  c:          `// C — Hello World\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp:        `// C++ — Hello World\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  go:         `// Go — Hello World\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  rust:       `// Rust — Hello World\nfn main() {\n    println!("Hello, World!");\n}`,
};

const STATUS_COLOR = {
  'Accepted':              'var(--success)',
  'Wrong Answer':          'var(--error)',
  'Time Limit Exceeded':   'var(--warning)',
  'Runtime Error':         'var(--error)',
  'Compilation Error':     'var(--error)',
  'Memory Limit Exceeded': 'var(--warning)',
};

export default function CompilerPage() {
  const navigate = useNavigate();
  const [language, setLanguage]   = useState('javascript');
  const [code, setCode]           = useState(STARTER['javascript']);
  const [stdin, setStdin]         = useState('');
  const [output, setOutput]       = useState(null);
  const [running, setRunning]     = useState(false);
  const [showStdin, setShowStdin] = useState(false);

  const langMeta = LANGUAGES.find(l => l.value === language);

  const handleLangChange = useCallback((lang) => {
    setLanguage(lang);
    setCode(STARTER[lang] || '');
    setOutput(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setOutput(null);
    try {
      const res = await runCode({ code, language, stdin });
      setOutput(res);
    } catch (err) {
      setOutput({ success: false, error: err.message });
    } finally {
      setRunning(false);
    }
  }, [code, language, stdin, running]);

  // Ctrl+Enter to run — must be after handleRun definition
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun]);

  const handleClear = () => { setCode(STARTER[language] || ''); setOutput(null); };

  return (
    <div style={s.page}>
      {/* ── Top bar ── */}
      <div style={s.topbar}>
        <div style={s.topLeft}>
          <button style={s.homeBtn} onClick={() => navigate('/')} title="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M8 3L4 7l4 4M16 3l4 4-4 4M14 3l-4 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={s.titleWrap}>
            <span style={s.title}>Code Compiler</span>
            <span style={s.subtitle}>Run code instantly</span>
          </div>
        </div>

        <div style={s.topCenter}>
          {/* Language selector */}
          <div style={s.selectWrap}>
            <select
              value={language}
              onChange={e => handleLangChange(e.target.value)}
              style={s.select}
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.icon} {l.label}</option>
              ))}
            </select>
            <span style={s.selectArrow}>▾</span>
          </div>
        </div>

        <div style={s.topRight}>
          <button style={s.stdinBtn} onClick={() => setShowStdin(v => !v)} title="Toggle stdin">
            {showStdin ? '📥 Hide Input' : '📥 Stdin'}
          </button>
          <button style={s.clearBtn} onClick={handleClear} title="Reset code">
            ↺ Reset
          </button>
          <button
            style={{ ...s.runBtn, ...(running ? s.runBtnDisabled : {}) }}
            onClick={handleRun}
            disabled={running}
            title="Run Code (Ctrl+Enter)"
          >
            {running
              ? <><span style={s.spinner} /> Running…</>
              : <><span style={s.playIcon}>▶</span> Run <span style={{ opacity: 0.6, fontSize: '0.72rem', fontWeight: 400 }}>Ctrl+↵</span></>
            }
          </button>
          <button style={s.analyzeNavBtn} onClick={() => navigate('/app')} title="Switch to AI Analyzer">
            🤖 AI Analyze
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>
        {/* ── Left: Editor ── */}
        <div style={s.editorCol}>
          {/* Editor toolbar */}
          <div style={s.editorBar}>
            <div style={s.dots}>
              <span style={{ ...s.dot, background: '#f87171' }} />
              <span style={{ ...s.dot, background: '#fbbf24' }} />
              <span style={{ ...s.dot, background: '#4ade80' }} />
            </div>
            <span style={s.filename}>
              main.{langMeta?.ext || 'js'}
            </span>
            <span style={s.lineCount}>
              {code.split('\n').length} lines
            </span>
          </div>

          <Editor
            height={showStdin ? 'calc(100% - 38px - 130px)' : 'calc(100% - 38px)'}
            language={language === 'c' ? 'c' : language}
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 13.5,
              fontFamily: "'JetBrains Mono', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'gutter',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 14, bottom: 14 },
              tabSize: 2,
              automaticLayout: true,
              overviewRulerBorder: false,
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            }}
          />

          {/* Stdin panel */}
          {showStdin && (
            <div style={s.stdinPanel}>
              <div style={s.stdinHeader}>
                <span style={s.stdinLabel}>📥 Standard Input (stdin)</span>
                <button style={s.stdinClear} onClick={() => setStdin('')}>Clear</button>
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Enter input for your program here..."
                style={s.stdinArea}
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={s.divider} />

        {/* ── Right: Output terminal ── */}
        <div style={s.outputCol}>
          <div style={s.outputBar}>
            <span style={s.outputLabel}>⬛ Output</span>
            {output?.status && (
              <span style={{ ...s.statusBadge, color: STATUS_COLOR[output.status] || 'var(--text-secondary)' }}>
                {output.status}
              </span>
            )}
            {output?.time && (
              <span style={s.metaBadge}>⏱ {output.time}s</span>
            )}
            {output?.memory && (
              <span style={s.metaBadge}>💾 {output.memory} KB</span>
            )}
            {output && (
              <button style={s.clearOutputBtn} onClick={() => setOutput(null)}>✕ Clear</button>
            )}
          </div>

          <div style={s.terminal}>
            {/* Idle state */}
            {!running && !output && (
              <div style={s.termIdle}>
                <span style={s.termIdleIcon}>▶</span>
                <span style={s.termIdleText}>Click <strong>Run Code</strong> to execute</span>
              </div>
            )}

            {/* Running */}
            {running && (
              <div style={s.termIdle}>
                <span style={s.bigSpinner} />
                <span style={s.termIdleText}>Executing…</span>
              </div>
            )}

            {/* Error (API/network) */}
            {!running && output && !output.success && (
              <div style={s.termError}>
                <span style={{ color: 'var(--error)', fontWeight: 600 }}>⚠ Error</span>
                <pre style={s.termPre}>{output.error}</pre>
              </div>
            )}

            {/* Successful execution */}
            {!running && output?.success && (
              <>
                {output.stderr && (
                  <div style={s.termSection}>
                    <div style={s.termSectionLabel}>stderr / compile output</div>
                    <pre style={{ ...s.termPre, color: '#fca5a5' }}>{output.stderr}</pre>
                  </div>
                )}
                {output.output ? (
                  <div style={s.termSection}>
                    <div style={s.termSectionLabel}>stdout</div>
                    <pre style={s.termPre}>{output.output}</pre>
                  </div>
                ) : (
                  !output.stderr && (
                    <div style={s.termIdle}>
                      <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✓</span>
                      <span style={s.termIdleText}>Program exited with no output</span>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  page:       { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' },

  // Topbar
  topbar:     { height: 52, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, gap: 12 },
  topLeft:    { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  topCenter:  { display: 'flex', alignItems: 'center', gap: 8 },
  topRight:   { display: 'flex', alignItems: 'center', gap: 8 },
  homeBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 8, cursor: 'pointer' },
  titleWrap:  { display: 'flex', flexDirection: 'column' },
  title:      { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  subtitle:   { fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' },

  selectWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  select:     { appearance: 'none', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', padding: '5px 30px 5px 10px', fontSize: '0.82rem', fontFamily: 'var(--font-ui)', cursor: 'pointer', outline: 'none' },
  selectArrow:{ position: 'absolute', right: 9, fontSize: '0.6rem', color: 'var(--text-muted)', pointerEvents: 'none' },

  stdinBtn:   { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  clearBtn:   { padding: '5px 11px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  runBtn:     { display: 'flex', alignItems: 'center', gap: 7, padding: '6px 16px', background: 'var(--success)', border: 'none', borderRadius: 'var(--radius)', color: '#0d0d0f', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-ui)', cursor: 'pointer', boxShadow: '0 0 14px rgba(74,222,128,0.35)', transition: 'all 0.15s ease' },
  runBtnDisabled: { opacity: 0.6, cursor: 'not-allowed', boxShadow: 'none' },
  analyzeNavBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', color: 'var(--accent)', fontSize: '0.78rem', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  playIcon:   { fontSize: '0.7rem' },
  spinner:    { width: 12, height: 12, border: '2px solid #0d0d0f', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },

  // Body
  body:       { flex: 1, display: 'flex', overflow: 'hidden' },
  editorCol:  { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#1e1e2e', overflow: 'hidden' },
  divider:    { width: 1, background: 'var(--border)', flexShrink: 0 },
  outputCol:  { width: '40%', minWidth: 320, display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', overflow: 'hidden' },

  // Editor bar
  editorBar:  { height: 38, background: '#181825', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, flexShrink: 0 },
  dots:       { display: 'flex', gap: 6 },
  dot:        { width: 10, height: 10, borderRadius: '50%', opacity: 0.8 },
  filename:   { flex: 1, textAlign: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)' },
  lineCount:  { fontSize: '0.72rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)' },

  // Stdin
  stdinPanel: { height: 130, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  stdinHeader:{ height: 30, background: '#181825', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0 },
  stdinLabel: { fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' },
  stdinClear: { fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' },
  stdinArea:  { flex: 1, background: '#0d0d14', color: '#cdd6f4', fontFamily: 'var(--font-code)', fontSize: '0.82rem', padding: '8px 12px', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.6 },

  // Output
  outputBar:  { height: 38, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0 },
  outputLabel:{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontWeight: 600, letterSpacing: '0.04em' },
  statusBadge:{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-code)', marginLeft: 4 },
  metaBadge:  { fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', background: 'var(--bg-card)', padding: '2px 7px', borderRadius: 6 },
  clearOutputBtn: { marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' },

  terminal:   { flex: 1, overflowY: 'auto', background: '#0d0d14', padding: 16, fontFamily: 'var(--font-code)' },
  termIdle:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, opacity: 0.5 },
  termIdleIcon:{ fontSize: '1.8rem', color: 'var(--success)' },
  termIdleText:{ fontSize: '0.85rem', color: 'var(--text-secondary)' },
  bigSpinner: { width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--success)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  termError:  { display: 'flex', flexDirection: 'column', gap: 8 },
  termSection:{ display: 'flex', flexDirection: 'column', gap: 6 },
  termSectionLabel: { fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-code)' },
  termPre:    { margin: 0, fontSize: '0.83rem', color: '#cdd6f4', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};
