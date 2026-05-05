const axios = require('axios');

// Judge0 CE language IDs
const LANGUAGE_IDS = {
  c:          50,
  cpp:        54,
  java:       62,
  javascript: 63,
  python:     71,
  typescript: 74,
  go:         60,
  rust:       73,
};

// Free public Judge0 CE — no API key required
const JUDGE0_URL = 'https://ce.judge0.com';

const runCode = async (req, res) => {
  const { code, language, stdin } = req.body;

  const languageId = LANGUAGE_IDS[language];
  // languageId is guaranteed valid by Joi middleware

  try {
    // Step 1 — Submit
    const submitRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      { source_code: code, language_id: languageId, stdin },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const token = submitRes.data?.token;
    if (!token) throw new Error('No token returned from Judge0');

    // Step 2 — Poll until done (max 15s)
    let result = null;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,time,memory,compile_output`,
        { timeout: 10000 }
      );
      result = pollRes.data;
      if (result.status?.id >= 3) break;
    }

    if (!result) throw new Error('Execution timed out');

    return res.status(200).json({
      success: true,
      output:  result.stdout || '',
      stderr:  result.stderr || result.compile_output || '',
      status:  result.status?.description || 'Unknown',
      time:    result.time,
      memory:  result.memory,
    });

  } catch (err) {
    console.error('❌ Judge0 error:', err.message);
    const msg = err.response?.status === 429
      ? 'Too many requests to the compiler. Please wait a moment and try again.'
      : 'Execution failed: ' + err.message;
    return res.status(500).json({ success: false, error: msg });
  }
};

module.exports = { runCode };
