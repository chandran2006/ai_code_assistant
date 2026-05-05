import React, { useEffect, useState } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return 'var(--score-high)';
  if (score >= 50) return 'var(--score-mid)';
  return 'var(--score-low)';
};

const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
};

const ScoreGauge = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const end = score ?? 0;
    let start = 0;
    let rafId;
    const startTime = performance.now();
    const duration = 1200;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * end);
      setAnimatedScore(start);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setAnimatedScore(end);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  if (score === null || score === undefined) return null;

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div style={styles.container}>
      <div style={styles.gaugeWrapper}>
        {/* SVG Circular gauge */}
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="var(--bg-hover)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            style={{
              transition: 'stroke-dashoffset 0.05s ease',
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
          {/* Score text */}
          <text
            x="70" y="65"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="26"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            {animatedScore}
          </text>
          <text
            x="70" y="87"
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="Space Grotesk, sans-serif"
          >
            / 100
          </text>
        </svg>

        {/* Label */}
        <div style={{ ...styles.label, color }}>
          {label}
        </div>
      </div>

      {/* Progress bar breakdown */}
      <div style={styles.bars}>
        {[
          { label: 'Quality', value: Math.min(100, score) },
          { label: 'Readability', value: Math.min(100, Math.round(score * 0.9)) },
          { label: 'Performance', value: Math.min(100, Math.round(score * 0.85)) },
        ].map((bar) => (
          <div key={bar.label} style={styles.barRow}>
            <span style={styles.barLabel}>{bar.label}</span>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${bar.value}%`,
                  background: color,
                }}
              />
            </div>
            <span style={{ ...styles.barValue, color }}>{bar.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
    padding: '24px 0',
    animation: 'fadeIn 0.4s ease',
  },
  gaugeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  bars: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 90,
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  barTrack: {
    flex: 1,
    height: 6,
    background: 'var(--bg-hover)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  barValue: {
    width: 28,
    textAlign: 'right',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-code)',
    fontWeight: 600,
  },
};

export default ScoreGauge;
