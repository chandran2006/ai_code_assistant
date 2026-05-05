const Groq = require('groq-sdk');

let _groq = null;
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is missing.');
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const SUPPORTED_LANGUAGES = {
  c: 'C', javascript: 'JavaScript', python: 'Python', java: 'Java',
  typescript: 'TypeScript', cpp: 'C++', go: 'Go', rust: 'Rust',
};

const BADGES = [
  { id: 'bug_king',      label: 'Bug King 👑',              trigger: (bugs) => (bugs.match(/\d+\./g) || []).length >= 4 },
  { id: 'console_lord',  label: 'Console.log Master 😂',    trigger: (_, code) => (code.match(/console\.log/g) || []).length >= 3 },
  { id: 'loop_lover',    label: 'Loop Lover 🔁',            trigger: (_, code) => (code.match(/for\s*\(|while\s*\(/g) || []).length >= 3 },
  { id: 'recursion_fan', label: 'Recursion Fan 🌀',          trigger: (_, code) => /\bfunction\b[^{]*\{[\s\S]*?\barguments\.callee\b|\w+\s*\([^)]*\)[^{]*\{[\s\S]*?\1\s*\(/.test(code) },
  { id: 'no_comments',   label: 'Comment Hater 🤐',         trigger: (_, code) => !code.includes('//') && !code.includes('/*') },
  { id: 'one_liner',     label: 'One-Liner Hero ⚡',        trigger: (_, code) => code.split('\n').filter(l => l.trim()).length <= 5 },
  { id: 'clean_coder',   label: 'Clean Coder ✨',           trigger: (_b, _c, score) => score >= 85 },
  { id: 'spaghetti',     label: 'Spaghetti Chef 🍝',        trigger: (_b, _c, score) => score < 35 },
  { id: 'loop_master',   label: 'Loop Master 🔁',           trigger: (_, code) => (code.match(/for\s*\(|while\s*\(/g) || []).length === 2 },
  { id: 'bug_creator',   label: 'Bug Creator 💀',           trigger: (bugs) => (bugs.match(/\d+\./g) || []).length >= 2 },
  { id: 'opt_rookie',    label: 'Optimization Rookie ⚡',   trigger: (_b, _c, score) => score >= 40 && score < 70 },
  { id: 'n2_offender',   label: 'O(n²) Offender 🐢',       trigger: (_, _c, _s, time) => time && time.toLowerCase().includes('n²') },
  { id: 'hash_hero',     label: 'Hash Hero 🗺️',            trigger: (_, code) => code.includes('Map') || code.includes('dict') || code.includes('HashMap') },
];

const buildPrompt = (code, language, explainLike5, roastMode) => {
  const langLabel = SUPPORTED_LANGUAGES[language] || language;

  const explanationInstruction = explainLike5
    ? 'Write the Explanation as if explaining to a 5-year-old. Use analogies and simple words.'
    : 'Write the Explanation clearly for a junior developer.';

  const roastInstruction = roastMode
    ? 'Write a savage, brutally funny developer roast. Be creative, use emojis, reference specific bad parts. Example: "This O(n²) code will take longer than your career growth 💀". Make it sting but funny.'
    : 'Write a short, friendly, light-humor roast — point out one funny quirk kindly.';

  const system = `You are a world-class senior software engineer, algorithm expert, and code reviewer.
Analyze ${langLabel} code and return a strictly structured response with EXACTLY these 11 sections using these exact headings:

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
## ROAST

Rules:
- ## BUGS: List each bug as a numbered item. If none, write "No bugs found."
- ## FIXED CODE: Complete fixed code in a fenced code block (\`\`\`${language}). If no fixes, repeat original.
- ## EXPLANATION: ${explanationInstruction}
- ## OPTIMIZATION: Numbered suggestions. Mention specific algorithm improvements (e.g. "Use hashmap to reduce O(n²) → O(n)"). If none, write "Code is already optimized."
- ## TEST CASES: 2-3 concrete test cases with input/output in a code block.
- ## SCORE: Single integer 0-100 followed by a one-line reason. Example: "72 - Good structure but missing error handling."
- ## TIME COMPLEXITY: Use EXACTLY this sub-structure:
  **Best Case:** O(...) — explanation
  **Average Case:** O(...) — explanation
  **Worst Case:** O(...) — explanation
  **Derivation:** Explain how complexity is derived referencing specific loops, recursion, or operations.
- ## SPACE COMPLEXITY: Use EXACTLY this sub-structure:
  **Space Used:** O(...) — explanation
  **Details:** List variables, data structures, and call stack frames that contribute to memory usage.
- ## COMPLEXITY COMPARISON: Provide a markdown table comparing original vs optimized:
  | Metric | Original | Optimized |
  |--------|----------|-----------|
  | Time Complexity | O(...) | O(...) |
  | Space Complexity | O(...) | O(...) |
  | Algorithm | ... | ... |
  Then add 1-2 sentences explaining the improvement.
- ## REAL WORLD IMPACT: Explain performance for large inputs (n = 10⁴, 10⁵, 10⁶). Will it cause slowdown or crash? Give practical implications with estimated operation counts.
- ## ROAST: ${roastInstruction}

Do not add any text before ## BUGS or after ## ROAST.`;

  const user = `Analyze this ${langLabel} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
  return { system, user };
};

const parseResponse = (raw) => {
  const extract = (heading, nextHeading) => {
    const escapedNext = nextHeading ? nextHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null;
    const pattern = escapedNext
      ? new RegExp(`## ${heading}\\s*([\\s\\S]*?)(?=## ${escapedNext})`, 'i')
      : new RegExp(`## ${heading}\\s*([\\s\\S]*)$`, 'i');
    const match = raw.match(pattern);
    return match ? match[1].trim() : '';
  };

  const scoreRaw = extract('SCORE', 'TIME COMPLEXITY');
  const scoreMatch = scoreRaw.match(/(\d{1,3})/);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : null;

  return {
    bugs:                 extract('BUGS',                'FIXED CODE'),
    fixedCode:            extract('FIXED CODE',          'EXPLANATION'),
    explanation:          extract('EXPLANATION',         'OPTIMIZATION'),
    optimization:         extract('OPTIMIZATION',        'TEST CASES'),
    testCases:            extract('TEST CASES',          'SCORE'),
    score,
    timeComplexity:       extract('TIME COMPLEXITY',     'SPACE COMPLEXITY'),
    spaceComplexity:      extract('SPACE COMPLEXITY',    'COMPLEXITY COMPARISON'),
    complexityComparison: extract('COMPLEXITY COMPARISON','REAL WORLD IMPACT'),
    realWorldImpact:      extract('REAL WORLD IMPACT',   'ROAST'),
    roast:                extract('ROAST',               null),
    rawResponse: raw,
  };
};

const assignBadge = (bugs, code, score, timeComplexity) => {
  const earned = BADGES.filter(b => b.trigger(bugs, code, score, timeComplexity));
  return earned.length > 0 ? earned[Math.floor(Math.random() * earned.length)].label : 'Code Warrior 🛡️';
};

const analyzeCode = async (code, language, explainLike5 = false, roastMode = false, retries = 2) => {
  const { system, user } = buildPrompt(code, language, explainLike5, roastMode);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      });

      const raw = completion.choices[0]?.message?.content || '';
      const parsed = parseResponse(raw);
      parsed.badge = assignBadge(parsed.bugs || '', code, parsed.score || 0, parsed.timeComplexity || '');
      return parsed;
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('rate');
      if (isRateLimit && attempt < retries) {
        const delay = (attempt + 1) * 2000;
        console.warn(`⚠️  Rate limited. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
};

module.exports = { analyzeCode };
