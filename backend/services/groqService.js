const Groq = require('groq-sdk');

let _groq = null;
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is missing.');
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

const callGroq = async (system, user) => {
  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
    temperature: 0.3,
    max_tokens: 6000,
  });

  const text = completion.choices[0]?.message?.content || '';
  if (!text) throw new Error('Groq returned empty response.');
  return text;
};

module.exports = { callGroq };
