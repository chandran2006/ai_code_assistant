# 🤖 AI Code Assistant

> **Paste code → Get bugs, fixes, explanations, and improvements instantly**

A full-stack AI-powered code analysis tool built with React, Node.js, Groq (Llama 3 70B), and MongoDB.

---

## 📁 Project Structure

```
ai-code-assistant/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── groq.js            # Groq AI integration + prompt builder + response parser
│   ├── controllers/
│   │   └── debugController.js # Business logic for /api/debug and /api/history
│   ├── middleware/
│   │   └── validate.js        # Joi input validation
│   ├── models/
│   │   └── Query.js           # Mongoose schema for query history
│   ├── routes/
│   │   └── api.js             # Express routes with rate limiting
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── railway.toml           # Railway deployment config
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
    │   │   └── api.js             # Axios instance + API functions
    │   ├── styles/
    │   │   └── global.css         # CSS variables, dark theme, animations
    │   ├── App.jsx                # Root layout: split pane + sidebar
    │   └── main.jsx               # React entry point
    ├── index.html
    ├── vite.config.js
    ├── vercel.json                # Vercel deployment config
    └── package.json
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-code-assistant?retryWrites=true&w=majority
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
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
# Clone the repo
git clone https://github.com/yourname/ai-code-assistant.git
cd ai-code-assistant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2 — Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and fill in GROQ_API_KEY and MONGO_URI

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (default — usually no change needed)
```

### Step 3 — Get your API keys

**Groq API Key:**
1. Go to https://console.groq.com
2. Sign up / log in
3. Navigate to API Keys → Create New Key
4. Copy the key into `backend/.env`

**MongoDB URI:**
1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Click "Connect" → "Connect your application" → copy the URI
6. Replace `<password>` in the URI and paste into `backend/.env`

### Step 4 — Run locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server running on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → App running on http://localhost:5173
```

Open http://localhost:5173 in your browser. ✅

---

## ☁️ Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the repo → set **Root Directory** to `backend`
4. Add environment variables in Railway dashboard:
   - `GROQ_API_KEY`
   - `MONGO_URI`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`
5. Railway auto-detects Node.js and deploys
6. Copy your Railway URL: `https://your-app.up.railway.app`

### Frontend → Vercel

1. Go to https://vercel.com → New Project → Import from GitHub
2. Select the repo → set **Root Directory** to `frontend`
3. Framework: **Vite**
4. Add environment variable:
   - `VITE_API_URL=https://your-app.up.railway.app/api`
5. Click Deploy → done!

---

## 📡 API Reference

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

**Supported languages:** `javascript`, `python`, `java`, `typescript`, `cpp`, `go`, `rust`

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
| 🌐 7 Languages | JS, Python, Java, TS, C++, Go, Rust |
| 🎨 Monaco Editor | VS Code-quality editing experience |
| 📋 Copy Buttons | One-click copy on all outputs |

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
| Deployment | Vercel (frontend), Railway (backend) |
"# ai_code_assistant" 
