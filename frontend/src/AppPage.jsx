import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import CodeEditor, { PLACEHOLDER_CODE } from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import HistorySidebar from './components/HistorySidebar';
import { useAnalyzer } from './hooks/useAnalyzer';
import { useHistory } from './hooks/useHistory';

const DEFAULT_LANGUAGE = 'javascript';

export default function AppPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [explainLike5, setExplainLike5] = useState(false);
  const [roastMode, setRoastMode] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { result, loading, error, processingTime, cooldown, analyze, reset } = useAnalyzer();
  const { history, loading: histLoading, refresh: refreshHistory } = useHistory();

  const handleAnalyze = useCallback(async () => {
    const effectiveCode = code.trim() || PLACEHOLDER_CODE[language] || '';
    if (!effectiveCode.trim()) return;
    await analyze({ code: effectiveCode, language, explainLike5, roastMode, interviewMode: true });
    refreshHistory();
  }, [code, language, explainLike5, roastMode, analyze, refreshHistory]);

  const handleHistorySelect = useCallback((item) => {
    setCode(item.code);
    setLanguage(item.language);
  }, []);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    reset();
  }, [reset]);

  return (
    <div style={styles.app}>
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        explainLike5={explainLike5}
        onToggleExplain={() => setExplainLike5((v) => !v)}
        roastMode={roastMode}
        onToggleRoast={() => setRoastMode((v) => !v)}
        onAnalyze={handleAnalyze}
        onHome={() => navigate('/')}
        loading={loading}
        cooldown={cooldown}
      />

      <main style={styles.main}>
        <div style={styles.editorPane}>
          <CodeEditor value={code} onChange={setCode} language={language} />
        </div>
        <div style={styles.divider} />
        <div style={styles.outputPane}>
          <OutputPanel
            result={result}
            loading={loading}
            error={error}
            processingTime={processingTime}
            originalCode={code}
          />
        </div>
      </main>

      <HistorySidebar
        history={history}
        loading={histLoading}
        onSelect={handleHistorySelect}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen((v) => !v)}
      />

      {historyOpen && (
        <div style={styles.backdrop} onClick={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}

const styles = {
  app:        { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  main:       { flex: 1, display: 'flex', overflow: 'hidden' },
  editorPane: { flex: 1, minWidth: 0, overflow: 'hidden' },
  divider:    { width: 1, background: 'var(--border)', flexShrink: 0 },
  outputPane: { flex: 1, minWidth: 0, overflow: 'hidden' },
  backdrop:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 250, backdropFilter: 'blur(2px)' },
};
