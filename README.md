# 🎤 Audio Transcription & Summarizer

A full-stack web application that transcribes audio files using Deepgram's free API and generates detailed summaries using Groq's free AI API.

## ✨ Features

- 🎤 Drag-and-drop audio file upload
- 📝 Automatic transcription using **Deepgram API (FREE)**
- ✨ Detailed summary generation using **Groq API (FREE)**
- 📋 Processing history with previous uploads
- 📊 Real-time status updates
- 💾 Local database (SQLite) for record storage
- 🎨 Modern, responsive UI
- ☁️ Cloud-ready (Deploy to Vercel + Railway)

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom React components with CSS
- **State Management**: React Hooks
- **API Communication**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: SQLite3
- **File Upload**: Multer
- **External APIs**: OpenAI Whisper, Groq

## 📋 Project Structure

```
.
├── frontend/                 # React Vite application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AudioUploader.tsx
│   │   │   ├── ProcessingStatus.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── History.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useAudioAPI.ts
│   │   ├── styles/          # Component styles
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                  # Node.js Express application
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   └── api.ts
│   │   ├── services/        # Business logic
│   │   │   ├── transcriptionService.ts
│   │   │   └── summaryService.ts
│   │   ├── db/              # Database
│   │   │   └── schema.ts
│   │   └── index.ts         # Server entry point
│   ├── uploads/             # Temporary audio upload directory
│   ├── tsconfig.json
│   ├── .env                 # Environment variables (not tracked)
│   ├── .env.example         # Example env file
│   └── package.json
│
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Deepgram API key (FREE - for Whisper-like transcription)
- Groq API key (FREE - for summarization)

### 1. Get API Keys

#### Deepgram API (FREE - Transcription)
1. Go to [Deepgram Console](https://console.deepgram.com/signup)
2. Sign up or login
3. Go to API Keys section
4. Create a new API key
5. Copy the key

**Free tier**: 300+ minutes per month

#### Groq API (FREE - Summarization)
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up for free
3. Create a new API key
4. Copy the key

**Free tier**: ~3000 requests/day, 30k tokens/min

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your API keys
cp .env.example .env

# Edit .env and add your API keys
# OPENAI_API_KEY=sk_your_key_here
# GROQ_API_KEY=gsk_your_key_here
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (already has the basic setup)
cp .env.example .env
```

## 🎯 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`
- Health check: `http://localhost:5000/health`
- API Routes:
  - `POST /api/process` - Upload and process audio
  - `GET /api/history` - Get all processed files
  - `GET /api/result/:id` - Get specific result

### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`
- Open http://localhost:3000 in your browser

## 📝 API Endpoints

### POST /api/process
Upload and process an audio file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `audio` (file)

**Response:**
```json
{
  "id": "uuid-string",
  "message": "File received. Processing started...",
  "status": "pending"
}
```

### GET /api/history
Get all processed audio records.

**Response:**
```json
{
  "total": 2,
  "records": [
    {
      "id": "uuid",
      "filename": "meeting.mp3",
      "uploadedAt": "2026-03-14T18:34:00Z",
      "transcript": "full transcription text...",
      "summary": "detailed summary...",
      "status": "completed"
    }
  ]
}
```

### GET /api/result/:id
Get a specific audio processing result.

**Response:**
```json
{
  "id": "uuid",
  "filename": "meeting.mp3",
  "uploadedAt": "2026-03-14T18:34:00Z",
  "transcript": "...",
  "summary": "...",
  "status": "completed"
}
```

## 🔄 Processing Flow

1. **Upload**: User selects or drags audio file
2. **Validation**: Backend validates file size and format
3. **Transcription**: File sent to OpenAI Whisper API
4. **Summary**: Transcript sent to Groq API for summarization
5. **Storage**: Results saved to SQLite database
6. **Display**: Results shown to user in UI

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./app.db
DEEPGRAM_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
GROQ_MODEL=mixtral-8x7b-32768
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## 📊 Supported Audio Formats

- MP3
- WAV
- MP4
- MPEG
- MPGA
- M4A
- WebM

Maximum file size: **50MB** (configurable via `MAX_FILE_SIZE`)

## 🛠️ Development

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/` directory.

## 📚 Technologies Used

- **Frontend**: React, TypeScript, Vite, CSS3
- **Backend**: Node.js, Express.js, TypeScript, SQLite3
- **APIs**: Deepgram (transcription), Groq (summarization)
- **Tools**: Multer (file upload), Axios (HTTP requests)

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `OPENAI_API_KEY` and `GROQ_API_KEY` are set in `.env`
- Check database path exists and is writable

### Audio upload fails
- Verify file is valid audio format
- Check file size is under 50MB
- Ensure backend is running

### Transcription/Summary takes long
- Depends on audio length and API response time
- Very long audios (>30 minutes) may timeout
- Check API quotas on OpenAI and Groq dashboards

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using Deepgram API & Groq API (100% FREE)**
