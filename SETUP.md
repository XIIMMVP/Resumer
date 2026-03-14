# 🚀 Setup Guide - Audio Transcription & Summarizer

Complete step-by-step guide to setup and run the application.

## Prerequisites Check

Verify you have these installed:

```bash
# Check Node.js version (need 16+)
node --version

# Check npm version
npm --version
```

## Step 1: Obtain API Keys (5-10 minutes)

### Deepgram API Key (FREE - Transcription)

1. Visit https://console.deepgram.com/signup
2. Create an account or login
3. Go to API Keys section (Left sidebar → API)
4. Click "Create a new API Key"
5. Copy the key
6. ⚠️ Save it securely - you won't see it again!

✅ **Free tier**: 300+ minutes per month

### Groq API Key (FREE - Summarization)

1. Visit https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key (starts with `gsk_`)
4. Save it securely

✅ **Free tier**: ~3000 requests/day, 30k tokens/min

## Step 2: Setup Backend (2-3 minutes)

### Navigate to backend directory:
```bash
cd backend
```

### Install dependencies:
```bash
npm install
```

### Create environment file:
```bash
cp .env.example .env
```

### Edit `.env` file and add your API keys:

Open `backend/.env` and replace:

```env
# Before (placeholder)
DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768

# After (your actual keys)
DEEPGRAM_API_KEY=dgsk_your_actual_key_here
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=mixtral-8x7b-32768
```

Keep other settings as default.

## Step 3: Setup Frontend (1-2 minutes)

### Navigate to frontend directory:
```bash
cd frontend
```

### Install dependencies:
```bash
npm install
```

The `.env` file is already configured correctly.

## Step 4: Run the Application (2 terminals)

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📁 Environment: development
✅ Connected to SQLite database: ./app.db
✅ Database table initialized
```

### Terminal 2: Start Frontend Server

```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:3000/
```

## Step 5: Access the Application

1. Open your browser
2. Go to `http://localhost:3000`
3. You should see the Audio Transcription & Summarizer interface

## 🎯 Testing the Application

### Test Upload:

1. **Create a test audio file** (or use an existing MP3)
   - For testing: You can record a quick voice memo on your phone
   - Or find a sample audio file online

2. **Upload the file**:
   - Drag and drop the audio file onto the upload zone
   - Or click to select from your computer

3. **Monitor the process**:
   - You'll see "Transcribing Audio..." then "Generating Summary..."
   - This may take 2-5 minutes depending on audio length

4. **View results**:
   - Once complete, you'll see the transcript and summary
   - Use the tabs to switch between them
   - Click the copy button to copy content

5. **Check history**:
   - Scroll down to see your processing history
   - Click on any previous upload to see results again

## 📊 Expected Results

### Processing Times (approximate):
- **1 minute audio**: 30-60 seconds total
- **5 minute audio**: 2-3 minutes total
- **10 minute audio**: 4-5 minutes total

### Success Indicators:

✓ File uploaded successfully
✓ "Transcribing Audio..." status shows
✓ Transcript appears (30-90 seconds later)
✓ "Generating Summary..." status shows
✓ Summary appears (60-120 seconds later)
✓ Status badge changes to "COMPLETED"

## 🆘 Troubleshooting

### Issue: "Backend connection refused"
**Solution**:
1. Make sure backend is running: `npm run dev` in backend directory
2. Check port 5000 is not blocked
3. Verify backend console shows "Server running on http://localhost:5000"

### Issue: "Invalid API Key" error
**Solution**:
1. Double-check your keys in `backend/.env`
2. Verify keys are copied correctly (no spaces before/after)
3. Test keys directly on platform:
   - OpenAI: https://platform.openai.com/account/billing/overview
   - Groq: https://console.groq.com/dashboard

### Issue: "File size exceeds maximum"
**Solution**:
- Current max: 50MB
- If needed, edit `backend/.env`:
  ```
  MAX_FILE_SIZE=104857600  # for 100MB
  ```
- Restart backend after changing

### Issue: "Unsupported audio format"
**Solution**:
- Check file extension is one of: .mp3, .wav, .m4a, .webm
- Convert file using tool like: https://cloudconvert.com/

### Issue: Processing times out
**Solution**:
- For very long audios (>30 min), increase timeout in code
- Or split audio into smaller chunks using: https://www.audacityteam.org/

## 🔍 Checking if Services are Running

### Check Backend:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-03-14T..."}
```

### Check Frontend:
```bash
# If running, you can access at http://localhost:3000
```

## 📝 Useful Commands

```bash
# Build frontend for production
cd frontend
npm run build

# Build backend for production
cd backend
npm run build
npm start

# Check for TypeScript errors
npm run build

# View backend logs
# Terminal where backend is running will show logs

# Reset database
rm backend/app.db  # Will recreate on next run
```

## 🎓 Understanding the Flow

1. **User uploads audio** → Browser sends file to backend
2. **Backend validates** → Checks file format and size
3. **Deepgram API transcribes** → Free API converts audio to text
4. **Groq API summarizes** → Free API creates detailed summary
5. **Results saved** → SQLite database stores transcript + summary
6. **Frontend polls** → React frontend checks status every 3 seconds
7. **Results displayed** → User sees transcript and summary

## 🚀 Deploy to Cloud (100% FREE)

### Option: Vercel (Frontend) + Railway (Backend)

**Recommended setup** - Both have generous free tiers and are easy to use.

#### Step 1: Prepare Backend for Deployment

1. Ensure code is in a Git repository:
   ```bash
   cd /Users/xi.i.mmv.p/App\ resumen\ REUNIONES
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub:
   - Create new repo on GitHub
   - Push your code: `git remote add origin <repo_url>` then `git push`

#### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your GitHub repository
5. Framework: **Next.js** → Change to **Vite**
6. Root Directory: `./frontend`
7. Environment Variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
8. Click Deploy

#### Step 3: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Select root directory: `./backend`
6. Configure Environment:
   - `PORT=3000`
   - `NODE_ENV=production`
   - `DEEPGRAM_API_KEY=your_key`
   - `GROQ_API_KEY=your_key`
   - `DATABASE_PATH=/tmp/app.db` (Railway uses /tmp for persistent storage)
7. Click Deploy
8. Get your backend URL from Railway dashboard

#### Step 4: Update Frontend with Backend URL

1. Go back to Vercel
2. Project Settings → Environment Variables
3. Update `VITE_API_URL=https://your-railway-backend.up.railway.app/api`
4. Redeploy

**That's it! Your app is now live in the cloud! 🎉**

---

### Alternative: Other Cloud Providers

**Heroku** (Classic, free tier discontinued):
- Use Render or Railway instead (free tiers available)

**Netlify** (Frontend):
- Similar to Vercel, also very easy to deploy

**Render** (Backend):
- Free tier with automatic deployments
- Similar process to Railway

---

## 💾 Database Considerations for Cloud

In production, SQLite has limitations. Recommended alternatives:

✅ **For MVP (what we have now)**:
- SQLite works fine with Railway's `/tmp` storage
- Restarts will lose data - consider adding periodic backups

✅ **For Production**:
- Switch to PostgreSQL (free tier on Railway)
- Edit `db/schema.ts` to use PostgreSQL driver
- Connection string via environment variable

---

## 🔐 Environment Variables for Cloud

**Create `.env.production` with your cloud API keys:**

```env
# Production Backend Config
PORT=3000
NODE_ENV=production
DATABASE_PATH=/tmp/app.db

# API Keys (obtained in Step 1)
DEEPGRAM_API_KEY=dgsk_...
GROQ_API_KEY=gsk_...
GROQ_MODEL=mixtral-8x7b-32768

# File upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=/tmp/uploads
```

**Never commit secrets to Git!** Use cloud provider's Environment Variables UI.

---

## ✅ Verification Checklist

- [ ] Backend deployed and running at https://your-backend.up.railway.app
- [ ] Frontend deployed and running at https://your-app.vercel.app
- [ ] Backend health check: Visit `https://your-backend.up.railway.app/health`
- [ ] Frontend loads without errors
- [ ] Audio upload works from cloud frontend
- [ ] Transcription and summary appear (2-5 minutes)

---

## Next Steps

Once deployed:

1. **Test thoroughly** in production
2. **Monitor** API usage on Deepgram and Groq dashboards
3. **Customize**:
   - Change colors in frontend CSS
   - Adjust summary prompt in `summaryService.ts`
   - Add user authentication (if needed)
4. **Share with others** - Give them your Vercel URL!

3. **Enhance**:
   - Add PDF export feature
   - Support for video files
   - Multi-language support

## 💡 Tips & Best Practices

- **Start with a short test audio** (30-60 seconds) to verify setup
- **Monitor API usage** on OpenAI and Groq dashboards
- **Keep API keys secure** - never commit `.env` to git
- **Check free credits** - Groq is free but has rate limits (~3000 requests/day)
- **Backup database** - SQLite file is in `backend/app.db`

## 📞 Still Need Help?

Check the main [README.md](../README.md) for more information about the project structure and architecture.

---

**You're all set! Enjoy using the Audio Transcription & Summarizer! 🎉**
