# ⚡ Quick Start (5 minutes)

## TL;DR - Just Want to Run It?

### 1. Get API Keys (5 min) - BOTH FREE
- **Deepgram**: https://console.deepgram.com/signup → Create key, copy it
- **Groq**: https://console.groq.com/keys → Create key, copy it

### 2. Setup Backend (2 min)
```bash
cd backend
cp .env.example .env
# Edit .env and paste your API keys
npm install  # or already done
```

### 3. Setup Frontend (1 min)
```bash
cd frontend
# Already configured, just install if needed
npm install  # or already done
```

### 4. Run Both Servers

**Terminal 1:**
```bash
cd backend
npm run dev
```
Wait for: `🚀 Server running on http://localhost:5000`

**Terminal 2:**
```bash
cd frontend
npm run dev
```
Open browser to: http://localhost:3000 ✅

## Testing

1. Download a test audio (or record one)
2. Drag it onto the upload area
3. Wait 2-5 minutes for processing
4. See your transcript + summary

## Common Issues

| Problem | Solution |
|---------|----------|
| "Backend connection refused" | Check Terminal 1: `npm run dev` running? |
| "Invalid API Key" | Verify keys in `backend/.env` |
| "File size exceeds" | File >50MB? Remove from uploads first |
| "Unsupported format" | Use MP3, WAV, or M4A |

## Cloud Deployment (FREE)

Want to deploy online for free?

1. Vercel (Frontend): https://vercel.com
2. Railway (Backend): https://railway.app
3. See [SETUP.md](./SETUP.md) for detailed cloud deployment steps

## Next Steps

- See [SETUP.md](./SETUP.md) for detailed setup with cloud deployment
- See [README.md](./README.md) for full documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details

---

You're ready! 🎉
