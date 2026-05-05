const { callGroq } = require('./groqService');
const Query          = require('../models/Query');

// ── Shared constants ─────────────────────────────────────────
const SUPPORTED_LANGUAGES = {
  c: 'C', javascript: 'JavaScript', python: 'Python', java: 'Java',
  typescript: 'TypeScript', cpp: 'C++', go: 'Go', rust: 'Rust',
};

const BADGES = [
  { id: 'bug_king',      label: 'Bug King 👑',            trigger: (bugs)          => (bugs.match(/\d+\./g) || []).length >= 4 },
  { id: 'console_lord',  label: 'Console.log Master 😂',  trigger: (_, code)       => (code.match(/console\.log/g) || []).length >= 3 },
  { id: 'loop_lover',    label: 'Loop Lover 🔁',          trigger: (_, code)       => (code.match(/for\s*\(|while\s*\(/g) || []).length >= 3 },
  { id: 'no_comments',   label: 'Comment Hater 🤐',       trigger: (_, code)       => !code.includes('//') && !code.includes('/*') },
  { id: 'one_liner',     label: 'One-Liner Hero ⚡',      trigger: (_, code)       => code.split('\n').filter(l => l.trim()).length <= 5 },
  { id: 'clean_coder',   label: 'Clean Coder ✨',         trigger: (_b, _c, score) => score >= 85 },
  { id: 'spaghetti',     label: 'Spaghetti Chef 🍝',      trigger: (_b, _c, score) => score < 35 },
  { id: 'bug_creator',   label: 'Bug Creator 💀',         trigger: (bugs)          => (bugs.match(/\d+\./g) || []).length >= 2 },
  { id: 'opt_rookie',    label: 'Optimization Rookie ⚡', trigger: (_b, _c, score) => score >= 40 && score < 70 },
  { id: 'n2_offender',   label: 'O(n²) Offender 🐢',     trigger: (_, _c, _s, t)  => t && t.toLowerCase().includes('n²') },
  { id: 'hash_hero',     label: 'Hash Hero 🗺️',          trigger: (_, code)       => code.includes('Map') || code.includes('dict') || code.includes('HashMap') },
];

// ── Prompt builder ───────────────────────────────────────────
const buildPrompt = (code, language, explainLike5, roastMode, interviewMode) => {
  const langLabel = SUPPORTED_LANGUAGES[language] || language;

  const explanationInstruction = explainLike5
    ? 'Write the Explanation as if explaining to a 5-year-old. Use analogies and simple words.'
    : 'Write the Explanation clearly for a junior developer.';

  const roastInstruction = roastMode
    ? 'Write a savage, brutally funny developer roast. Be creative, use emojis, reference specific bad parts.'
    : 'Write a short, friendly, light-humor roast — point out one funny quirk kindly.';

  const interviewInstruction = interviewMode
    ? `Explain the code like you are in a coding interview. Include:
1. Step-by-step reasoning of what the code does
2. How you would explain the algorithm to an interviewer
3. Common mistakes candidates make with this type of code
4. Follow-up questions an interviewer might ask`
    : 'Write only this exact sentence: "Interview mode is currently disabled."';

  const system = `You are a world-class senior software engineer, algorithm expert, and code reviewer.
Analyze ${langLabel} code and return a strictly structured response with EXACTLY these 12 sections using these exact headings:

## BUGS
## FIXED CODE
## EXPLANATION
## OPTIMIZATION
## TEST CASES
## SCORE
## TIME COMPLEXITY
## SPACE COMPLEXITY
## COMPLEXITY COMPARISON
## REAL WORLD IMPACT
## INTERVIEW MODE
## ROAST

Rules:
- ## BUGS: List each bug as a numbered item. If none, write "No bugs found."
- ## FIXED CODE: Complete fixed code in a fenced code block (\`\`\`${language}). If no fixes, repeat original.
- ## EXPLANATION: ${explanationInstruction}
- ## OPTIMIZATION: Numbered suggestions. If none, write "Code is already optimized."
- ## TEST CASES: 2-3 concrete test cases with input/output in a code block.
- ## SCORE: Single integer 0-100 followed by a one-line reason. Example: "72 - Good structure but missing error handling."
- ## TIME COMPLEXITY:
  **Best Case:** O(...) — explanation
  **Average Case:** O(...) — explanation
  **Worst Case:** O(...) — explanation
  **Derivation:** Explain how complexity is derived.
- ## SPACE COMPLEXITY:
  **Space Used:** O(...) — explanation
  **Details:** List variables, data structures, and call stack frames.
- ## COMPLEXITY COMPARISON: Markdown table comparing original vs optimized.
- ## REAL WORLD IMPACT: Performance for n = 10⁴, 10⁵, 10⁶ with practical implications.
- ## INTERVIEW MODE: ${interviewInstruction}
- ## ROAST: ${roastInstruction}

Do not add any text before ## BUGS or after ## ROAST.`;

  const user = `Analyze this ${langLabel} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
  return { system, user };
};

// ── Response parser ──────────────────────────────────────────
const parseResponse = (raw) => {
  const extract = (heading, nextHeading) => {
    const escapedNext = nextHeading ? nextHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
    const pattern = escapedNext
      ? new RegExp(`## ${heading}\\s*([\\s\\S]*?)(?=## ${escapedNext})`, 'i')
      : new RegExp(`## ${heading}\\s*([\\s\\S]*)$`, 'i');
    const match = raw.match(pattern);
    return match ? match[1].trim() : '';
  };

  const scoreRaw   = extract('SCORE', 'TIME COMPLEXITY');
  const scoreMatch = scoreRaw.match(/(\d{1,3})/);
  const score      = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : null;

  return {
    bugs:                 extract('BUGS',                 'FIXED CODE'),
    fixedCode:            extract('FIXED CODE',           'EXPLANATION'),
    explanation:          extract('EXPLANATION',          'OPTIMIZATION'),
    optimization:         extract('OPTIMIZATION',         'TEST CASES'),
    testCases:            extract('TEST CASES',           'SCORE'),
    score,
    timeComplexity:       extract('TIME COMPLEXITY',      'SPACE COMPLEXITY'),
    spaceComplexity:      extract('SPACE COMPLEXITY',     'COMPLEXITY COMPARISON'),
    complexityComparison: extract('COMPLEXITY COMPARISON','REAL WORLD IMPACT'),
    realWorldImpact:      extract('REAL WORLD IMPACT',    'INTERVIEW MODE'),
    interviewMode:        extract('INTERVIEW MODE',       'ROAST'),
    roast:                extract('ROAST',                null),
    rawResponse: raw,
  };
};

const assignBadge = (bugs, code, score, timeComplexity) => {
  const earned = BADGES.filter(b => b.trigger(bugs, code, score, timeComplexity));
  return earned.length > 0
    ? earned[Math.floor(Math.random() * earned.length)].label
    : 'Code Warrior 🛡️';
};

// ── Cache lookup ─────────────────────────────────────────────
const getCached = async (code, language, explainLike5, roastMode, interviewMode) => {
  try {
    const cached = await Query.findOne({
      code, language, explainLike5, roastMode, interviewMode,
    })
      .sort({ createdAt: -1 })
      .select('result')
      .lean();
    return cached?.result || null;
  } catch {
    return null;
  }
};

// ── Main entry point ─────────────────────────────────────────
const analyzeCode = async (code, language, explainLike5 = false, roastMode = false, interviewMode = true) => {
  // 1. Cache check
  const cached = await getCached(code, language, explainLike5, roastMode, interviewMode);
  if (cached) {
    console.log('✅ Cache hit — returning stored result.');
    return { ...cached, aiProvider: 'cache' };
  }

  const { system, user } = buildPrompt(code, language, explainLike5, roastMode, interviewMode);
  let raw = null;
  const aiProvider = 'groq';

  // 2. Try Groq
  try {
    raw = await callGroq(system, user);
  } catch (groqErr) {
    console.error('❌ Groq failed:', groqErr.message);
    throw groqErr;
  }

  // 4. Parse + badge
  const parsed    = parseResponse(raw);
  parsed.badge    = assignBadge(parsed.bugs || '', code, parsed.score || 0, parsed.timeComplexity || '');
  parsed.aiProvider = aiProvider;

  return parsed;
};

module.exports = { analyzeCode };
