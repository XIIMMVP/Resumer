# ☁️ Cloud Deployment Guide

Complete guide to deploy your Audio Transcription app to the cloud for **FREE**.

## 🚀 Quickest Setup: Vercel + Railway

This is the easiest path with the most generous free tiers.

| Component | Platform | Cost | Notes |
|-----------|----------|------|-------|
| Frontend | Vercel | FREE | Generous free tier |
| Backend | Railway | FREE | 500 hours/month |
| Deepgram | External | FREE | 300+ min/month |
| Groq | External | FREE | ~3000 req/day |

---

## Step 1: Prepare Your Code

### 1.1 Push Code to GitHub

```bash
# In your project root
cd /Users/xi.i.mmv.p/App\ resumen\ REUNIONES

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/audio-summarizer.git
git branch -M main
git push -u origin main
```

### 1.2 Important Files for Deployment

Make sure these files exist:
- ✅ `frontend/vercel.json` (create one if missing)
- ✅ `backend/package.json` (already created)
- ✅ `backend/.env` (will be set in cloud provider)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Go to Vercel
1. Visit https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### 2.2 Import Project
1. Click "Add New Project" → "Import Git Repository"
2. Select your repository
3. Click "Import"

### 2.3 Configure Project
1. **Project Name**: `audio-summarizer-frontend` (or your choice)
2. **Framework**: Select **Vite**
3. **Root Directory**: Select `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - Click "Add Environment Variable"
   - Name: `VITE_API_URL`
   - Value: (leave empty for now, update after backend is deployed)

### 2.4 Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Get your frontend URL: `https://audio-summarizer-frontend.vercel.app`

---

## Step 3: Deploy Backend to Railway

### 3.1 Go to Railway
1. Visit https://railway.app
2. Click "Login" → "Continue with GitHub"
3. Authorize Railway

### 3.2 Create New Project
1. Click "New Project" → "Deploy from GitHub"
2. Search for your repository
3. Select it
4. Click "Deploy"

### 3.3 Configure Backend

#### Set Root Directory
1. Go to your Railway project
2. Settings → Root Directory
3. Enter: `backend`
4. Save

#### Add Environment Variables
1. Go to Variables tab
2. Add these variables:

```
# Backend Config
PORT=3000
NODE_ENV=production
DATABASE_PATH=/tmp/app.db

# API Keys (your actual keys)
DEEPGRAM_API_KEY=dgsk_YOUR_KEY_HERE
GROQ_API_KEY=gsk_YOUR_KEY_HERE
GROQ_MODEL=mixtral-8x7b-32768

# File handling
MAX_FILE_SIZE=52428800
UPLOAD_DIR=/tmp/uploads
```

3. Click "Deploy"

#### Get Backend URL
1. Go to "Deployments"
2. Once deployed (green checkmark)
3. Go to Networking/Domains
4. Copy the Railway URL: `https://your-app-uuid.up.railway.app`

---

## Step 4: Connect Frontend to Backend

### 4.1 Update Vercel Environment Variable
1. Go back to Vercel
2. Project → Settings → Environment Variables
3. Update `VITE_API_URL`:
   - Value: `https://your-app-uuid.up.railway.app/api`
4. Redeploy: Click "Redeploy"

### 4.2 Wait for Redeploy
- Vercel will rebuild frontend with new API URL
- Takes 2-3 minutes

---

## ✅ Verify Everything Works

### Test Backend
```bash
curl https://your-app-uuid.up.railway.app/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-03-14T..."}
```

### Test Frontend
1. Open https://audio-summarizer-frontend.vercel.app
2. Upload an audio file
3. Wait for transcription + summary
4. Should see results! 🎉

---

## 📊 Monitor Your Usage

### Monitor API Usage

**Deepgram Dashboard**:
- https://console.deepgram.com/project/usage
- Track transcription minutes used
- Free tier: 300+ minutes/month

**Groq Dashboard**:
- https://console.groq.com/usage
- Track API requests
- Free tier: ~3000 requests/day

**Railway Dashboard**:
- Project → Metrics
- Monitor CPU, memory, requests
- Free tier: 500 hours/month (~$5 value)

### Backend Logs
1. Go to Railway project
2. Deployments → Latest
3. Click "View Logs"
4. See real-time backend logs

---

## 🆘 Troubleshooting

### Issue: "Backend connection refused" after deployment

**Solution**:
1. Verify backend URL is correct in Vercel environment variables
2. Ensure backend is deployed (green checkmark in Railway)
3. Check Railway logs for errors
4. Verify API keys are set in Railway environment variables

### Issue: "DEEPGRAM_API_KEY not set"

**Solution**:
1. Go to Railway project
2. Variables tab
3. Confirm `DEEPGRAM_API_KEY` is set correctly
4. Redeploy

### Issue: Uploads fail or timeout

**Solution**:
1. Railway free tier may have slower processing
2. Use smaller audio files for testing
3. Check Railway logs for timeout errors
4. Consider upgrading to paid tier if needed

### Issue: "Database error"

**Solution**:
- `/tmp` storage in Railway is ephemeral (cleared on redeploy)
- For persistent storage, add PostgreSQL database:
  1. Railway → Create Database → PostgreSQL
  2. Copy connection string to environment variables
  3. Update backend database configuration

---

## 🔄 Update Your App

After making changes:

```bash
# Commit and push to GitHub
git add .
git commit -m "Your change description"
git push origin main

# Vercel and Railway will automatically redeploy
```

---

## 💾 Data Persistence

### Current Setup (SQLite in /tmp)
- ❌ Data lost on Railway redeploy
- ✅ Good for testing

### With PostgreSQL (Recommended for Production)
- ✅ Data persists across redeployments
- ✅ Can be set up free on Railway

**Add PostgreSQL**:
1. Railway → Create → PostgreSQL
2. Copy connection string
3. Add to backend environment variables
4. Update backend code to use PostgreSQL

---

## 🎓 Understanding the Architecture

### Frontend (Vercel)
- React app served as static files
- Automatically builds and deploys on push

### Backend (Railway)
- Node.js server
- Communicates with Deepgram and Groq APIs
- Stores data in database

### Data Flow
1. User uploads audio via frontend
2. Frontend sends to backend API
3. Backend processes with Deepgram + Groq
4. Results stored in database
5. Frontend polls backend for results
6. Results displayed to user

---

## 🚀 Next Steps

### After Deployment
1. Test with various audio files
2. Monitor API usage dashboards
3. Share URL with others
4. Collect feedback

### Future Enhancements
- [ ] Add user authentication
- [ ] Upgrade to PostgreSQL database
- [ ] Add PDF export
- [ ] Support video files
- [ ] Add email notifications

---

## 📞 Support

### Getting Help
- Check Railway logs for backend errors
- Check Vercel build logs for frontend errors
- Verify API keys are correct
- Verify environment variables match

### Resources
- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- Deepgram Docs: https://developers.deepgram.com/
- Groq Docs: https://console.groq.com/docs/

---

## 💰 Cost Analysis

### Monthly Cost (Free Tier)

| Service | Free Limit | Cost |
|---------|-----------|------|
| Vercel | Unlimited | FREE |
| Railway | 500 hrs/mo | FREE (~$5 value) |
| Deepgram | 300 min/mo | FREE (~$2.40 value) |
| Groq | ~3000 req/day | FREE |
| **Total** | See above | **FREE** ✅ |

### When You Might Pay
- **Railway**: Exceeding 500 hours/month ($0.77/hour)
- **Deepgram**: Exceeding 300 minutes/month (~$0.008/minute)
- **Groq**: Only for enterprise features

---

**Your app is now live on the cloud for FREE! 🎉**

Visit your frontend URL and start using it! 🚀
