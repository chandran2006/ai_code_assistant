# 🤖 AI Code Assistant

> **Paste code → Get bugs, fixes, explanations, and improvements instantly**

A full-stack AI-powered code analysis tool built with React, Node.js, Groq (Llama 3 70B), and MongoDB.

🔗 **Live Demo:** https://codejudge-ai.netlify.app
⚙️ **API:** https://ai-code-assistant-zee5.onrender.com

---

## 📁 Project Structure

```
ai-code-assistant/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── groq.js            # Groq AI integration
│   ├── controllers/
│   │   └── debugController.js # Business logic for /api/debug and /api/history
│   ├── middleware/
│   │   └── validate.js        # Joi input validation
│   ├── models/
│   │   └── Query.js           # Mongoose schema for query history
│   ├── routes/
│   │   └── api.js             # Express routes with rate limiting
│   ├── services/
│   │   ├── aiService.js       # Prompt builder, parser, badge logic
│   │   └── groqService.js     # Groq API client
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── render.yaml            # Render deployment config
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx         # Top bar: language selector, ELI5 toggle, analyze button
    │   │   ├── CodeEditor.jsx     # Monaco editor with language-aware defaults
    │   │   ├── OutputPanel.jsx    # Tabbed output: Bugs/Fix/Explain/Optimize/Tests/Score
    │   │   ├── ScoreGauge.jsx     # Animated circular quality score visualization
    │   │   ├── HistorySidebar.jsx # Slide-in history panel
    │   │   ├── MarkdownContent.jsx# LLM output renderer with code blocks
    │   │   └── CopyButton.jsx     # One-click copy with visual feedback
    │   ├── hooks/
    │   │   ├── useAnalyzer.js     # Core analysis state + API call
    │   │   └── useHistory.js      # History fetch hook
    │   ├── utils/
    │   │   └── api.js             # Axios instance + retry logic + API functions
    │   ├── styles/
    │   │   └── global.css         # CSS variables, dark theme, animations
    │   ├── App.jsx                # Root layout: split pane + sidebar
    │   └── main.jsx               # React entry point
    ├── index.html
    ├── vite.config.js
    ├── netlify.toml               # Netlify deployment config
    └── package.json
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=10000
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-code-assistant?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://codejudge-ai.netlify.app
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://ai-code-assistant-zee5.onrender.com/api
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (free tier works)
- Groq API key → https://console.groq.com

### Step 1 — Clone & install

```bash
git clone https://github.com/yourname/ai-code-assistant.git
cd ai-code-assistant

cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Fill in GROQ_API_KEY and MONGO_URI

# Frontend — for local dev, override the API URL
cd ../frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 3 — Run locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

---

## ☁️ Deployment

### Backend → Render

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect repo → set **Root Directory** to `backend`
4. Build command: `npm install` | Start command: `npm start`
5. Add environment variables in Render dashboard:
   - `GROQ_API_KEY`
   - `MONGO_URI`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://codejudge-ai.netlify.app`
6. Deployed at: `https://ai-code-assistant-zee5.onrender.com`

> ⚠️ Render free tier spins down after inactivity. The first request may take ~30s (cold start). Retry logic is built into the frontend to handle this automatically.

### Frontend → Netlify

1. Go to https://netlify.com → Add new site → Import from GitHub
2. Set **Base directory** to `frontend`
3. Build command: `npm run build` | Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL=https://ai-code-assistant-zee5.onrender.com/api`
5. Deployed at: `https://codejudge-ai.netlify.app`

---

## 📡 API Reference

Base URL: `https://ai-code-assistant-zee5.onrender.com`

### `POST /api/debug`
Analyze code and return structured results.

**Request:**
```json
{
  "code": "function add(a, b) { return a - b; }",
  "language": "javascript",
  "explainLike5": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bugs": "1. Wrong operator used — subtraction instead of addition...",
    "fixedCode": "```javascript\nfunction add(a, b) { return a + b; }\n```",
    "explanation": "This function is supposed to add two numbers together...",
    "optimization": "The function is simple and already optimal...",
    "testCases": "```\nadd(2, 3) → 5\nadd(-1, 1) → 0\n```",
    "score": 65
  },
  "processingTime": 4821
}
```

**Supported languages:** `javascript`, `python`, `java`, `typescript`, `c`, `cpp`, `go`, `rust`

**Rate limit:** 20 requests per 15 minutes per IP

### `GET /api/history`
Returns last 20 queries (newest first).

### `GET /api/history/:id`
Returns a single saved query by MongoDB ID.

### `GET /api/health`
Health check endpoint.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🐛 Bug Detection | Identifies all bugs with line-level detail |
| 🔧 Auto-Fix | Provides complete corrected code |
| 💡 Explanation | Beginner-friendly or ELI5 mode |
| ⚡ Optimization | Algorithmic and style improvements |
| 🧪 Test Cases | 2-3 ready-to-run test examples |
| 📊 Quality Score | 0–100 with animated gauge visualization |
| 📜 History | Last 20 queries saved and browsable |
| 🌐 8 Languages | JS, Python, Java, TS, C, C++, Go, Rust |
| 🎨 Monaco Editor | VS Code-quality editing experience |
| 📋 Copy Buttons | One-click copy on all outputs |
| 🔁 Retry Logic | Auto-retries on Render cold start |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Monaco Editor |
| Backend | Node.js, Express 4 |
| AI | Groq API (Llama 3 70B) |
| Database | MongoDB + Mongoose |
| Validation | Joi |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Netlify (frontend), Render (backend) |
