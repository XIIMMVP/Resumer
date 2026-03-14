# 🏗️ Architecture Documentation

Technical deep-dive into the Audio Transcription & Summarizer application.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Frontend (React + TypeScript)             │  │
│  │  - AudioUploader Component                        │  │
│  │  - ProcessingStatus Component                     │  │
│  │  - ResultCard Component                           │  │
│  │  - History Component                              │  │
│  │  - useAudioAPI Hook                               │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ (Fetch API)
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Backend (Node.js + Express)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Express Routes                       │  │
│  │ POST /api/process        - Upload audio           │  │
│  │ GET /api/history         - List all records       │  │
│  │ GET /api/result/:id      - Get specific result    │  │
│  └──────────┬────────────────────────────┬───────────┘  │
│             │                            │              │
│  ┌──────────▼────────┐      ┌────────────▼────────┐    │
│  │   Transcription   │      │   Summary Service   │    │
│  │   Service         │      │                     │    │
│  │                   │      │  Groq API Call      │    │
│  │ Whisper API Call  │      │ (Summarization)     │    │
│  │ (Audio→Text)      │      │                     │    │
│  └───────────────────┘      └─────────────────────┘    │
│             │                            │              │
│             └──────────┬─────────────────┘              │
│                        ▼                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │         SQLite Database (app.db)                  │  │
│  │  Table: audio_records                            │  │
│  │  - id, filename, uploadedAt                      │  │
│  │  - transcript, summary, status                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
  ┌──────────────┐                    ┌──────────────┐
  │ OpenAI API   │                    │  Groq API    │
  │ Whisper      │                    │ Chat/Summary │
  └──────────────┘                    └──────────────┘
```

## Data Flow

### Complete Processing Pipeline

```
1. USER UPLOADS AUDIO
   ↓
2. Frontend (AudioUploader.tsx)
   - Validates file type (MIME type check)
   - Creates FormData with audio file
   - POST request to /api/process
   ↓
3. Backend (api.ts - POST /api/process)
   - Receives file via Multer
   - Creates database record with status="pending"
   - Starts background processing
   - Returns immediately to user with record ID
   ↓
4. Background Processing (processAudioFile function)
   ├─ Update status to "processing"
   │
   ├─ Step 1: TRANSCRIPTION
   │  └─ Call transcriptionService.transcribeAudio()
   │     - Read file from disk
   │     - Create FormData
   │     - POST to OpenAI Whisper API
   │     - Receive transcript text
   │     - Update DB with transcript
   │
   ├─ Step 2: SUMMARIZATION
   │  └─ Call summaryService.generateSummary()
   │     - Validate transcript
   │     - Create prompt with transcript
   │     - POST to Groq LLM API
   │     - Receive summary
   │     - Update DB with summary
   │
   └─ Final: Clean up & complete
      - Update status to "completed"
      - Delete temporary file
      - Log completion
   ↓
5. Frontend Polling
   - useAudioAPI hook polls /api/result/:id
   - Checks status every 3 seconds
   - When status="completed", displays results
   ↓
6. USER SEES RESULTS
   - Transcript tab
   - Summary tab
   - Copy buttons for each
```

## Component Architecture

### Frontend Component Tree

```
App
├── AudioUploader
│   ├── useAudioAPI hook
│   │   ├── uploadAudio()
│   │   ├── getHistory()
│   │   └── getResult()
│   ├── ProcessingStatus
│   │   └── useAudioAPI (getResult)
│   └── ResultCard
│       └── useAudioAPI (getResult)
│
└── History
    └── useAudioAPI (getHistory)
```

### Frontend Component Responsibilities

| Component | Purpose | State | Props |
|-----------|---------|-------|-------|
| **App** | Main container, manages refresh trigger | historyRefresh | onHistoryUpdate |
| **AudioUploader** | File upload + drag-drop interface | uploadState, dragActive | onHistoryUpdate |
| **ProcessingStatus** | Shows real-time processing steps | record (from API polling) | recordId |
| **ResultCard** | Displays transcript & summary tabs | record, activeTab | recordId |
| **History** | Lists all past processes | records, selectedRecord | refreshTrigger |
| **useAudioAPI** | API communication hook | loading, error | (none) |

### Backend Service Architecture

```
Express App (index.ts)
│
├─ Middleware
│  ├── CORS
│  ├── JSON/URL parsing
│  ├── Error handling
│  └── 404 handling
│
├─ Routes (routes/api.ts)
│  ├── POST /api/process
│  ├── GET /api/history
│  └── GET /api/result/:id
│
├─ Services
│  ├── transcriptionService.ts
│  │  ├── transcribeAudio(filePath)
│  │  └── validateAudioFile(filePath)
│  │
│  └── summaryService.ts
│     ├── generateSummary(transcript)
│     └── validateTranscript(transcript)
│
└─ Database (db/schema.ts)
   ├── initializeDatabase()
   ├── createAudioRecord()
   ├── updateAudioRecord()
   ├── getAudioRecord()
   └── getAllAudioRecords()
```

## Database Schema

### Tables

#### audio_records
```sql
CREATE TABLE audio_records (
    id TEXT PRIMARY KEY,                    -- UUID
    filename TEXT NOT NULL,                 -- Original filename
    uploadedAt TEXT NOT NULL,              -- ISO timestamp
    transcript TEXT,                        -- Full transcription
    summary TEXT,                           -- Generated summary
    status TEXT NOT NULL DEFAULT 'pending', -- pending|processing|completed|error
    errorMessage TEXT,                      -- Error details if failed
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes** (for performance):
- Primary key on `id` (automatic)
- Consider adding: `CREATE INDEX idx_status ON audio_records(status);`

## API Specifications

### POST /api/process

**Purpose**: Upload and queue audio for processing

**Request**:
```
Method: POST
Content-Type: multipart/form-data
Body:
  - audio: File (binary)
```

**Response** (Success - 200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "File received. Processing started...",
  "status": "pending"
}
```

**Errors**:
- 400: No file provided
- 400: File size exceeds limit
- 400: Unsupported format
- 500: Server error

**Processing Flow**:
1. Validate file size and format
2. Create database record with status="pending"
3. Save file temporarily to disk
4. Return immediately with record ID
5. Start background processing

---

### GET /api/history

**Purpose**: Retrieve all processed audio records

**Request**:
```
Method: GET
URL: /api/history
```

**Response** (Success - 200):
```json
{
  "total": 3,
  "records": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "meeting.mp3",
      "uploadedAt": "2026-03-14T18:34:00Z",
      "transcript": "This is the transcribed text...",
      "summary": "Detailed summary of the audio...",
      "status": "completed",
      "errorMessage": null
    },
    // ... more records
  ]
}
```

**Sorting**: By uploadedAt DESC (newest first)

---

### GET /api/result/:id

**Purpose**: Get specific audio processing result

**Request**:
```
Method: GET
URL: /api/result/550e8400-e29b-41d4-a716-446655440000
```

**Response** (Success - 200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "meeting.mp3",
  "uploadedAt": "2026-03-14T18:34:00Z",
  "transcript": "...",
  "summary": "...",
  "status": "processing",  // pending|processing|completed|error
  "errorMessage": null
}
```

**Errors**:
- 404: Record not found
- 500: Server error

**Polling Strategy**:
- Frontend polls every 3 seconds
- Max 120 attempts (10 minutes timeout)
- Stops when status="completed" or status="error"

## External API Integration

### OpenAI Whisper API

**Purpose**: Audio transcription

**Details**:
- Endpoint: `https://api.deepgram.com/v1/listen`
- Method: POST
- Content-Type: audio/*
- Auth: Token in Authorization header

**Parameters**:
- `audio`: Audio file (binary)
- `model`: "nova-2" (Deepgram's latest model)
- `language`: "es" (Spanish, configurable)
- `smart_format`: "true"

**Response**:
```json
{
  "results": {
    "channels": [
      {
        "alternatives": [
          {
            "transcript": "Full transcription of audio..."
          }
        ]
      }
    ]
  }
}
```

**Pricing**: FREE with generous limits

**Limits**:
- Max file size: 100MB per request
- Free tier: 300+ minutes per month
- Supported formats: MP3, WAV, M4A, FLAC, and more

---

### Groq API (LLaMA / Mixtral Model)

**Purpose**: Summary generation

**Details**:
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Method: POST
- Content-Type: application/json
- Auth: Bearer token in Authorization header

**Model**: `mixtral-8x7b-32768`

**Parameters**:
```json
{
  "model": "mixtral-8x7b-32768",
  "messages": [
    {
      "role": "system",
      "content": "System prompt defining behavior..."
    },
    {
      "role": "user",
      "content": "The transcript to summarize..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Detailed summary..."
      }
    }
  ]
}
```

**Pricing**: FREE (with rate limits)

**Rate Limits**: ~3000 requests/day

## Error Handling

### Frontend Error Handling
- Try-catch blocks around API calls
- User-friendly error messages
- Type-safe with TypeScript
- API error details logged to console

### Backend Error Handling
- Try-catch in all async functions
- Detailed error logging
- Graceful degradation
- Proper HTTP status codes
- Error messages saved to database

### Specific Error Scenarios

1. **File Validation Errors**
   - Caught immediately in backend
   - File deleted, error saved to DB
   - User notified via error response

2. **API Errors (Whisper/Groq)**
   - Caught in service functions
   - Error message saved to DB
   - Status set to "error"
   - Frontend shows error to user

3. **Database Errors**
   - Logged to console
   - User sees generic error message
   - Prevented by connection pooling

## Performance Considerations

### Frontend Optimization
- Component memoization possible with React.memo
- CSS modules for scoped styling
- Fetch API (built-in, no extra bundle)
- Lazy loading for components
- Virtual scrolling for long history lists

### Backend Optimization
- Polling vs WebSocket (polling chosen for simplicity)
- Can upgrade to WebSocket for real-time updates
- Database queries are simple (no complex joins)
- File handling via Multer with disk storage
- API requests handled sequentially (one per record)

### Database Optimization
- SQLite sufficient for MVP
- Can scale to PostgreSQL for production
- Add indexes on: status, uploadedAt
- Archive old records to separate table

## Security Considerations

### Current Implementation
- ✅ CORS enabled for localhost:3000
- ✅ File type validation
- ✅ File size limits (50MB default)
- ✅ API keys in environment variables
- ✅ No sensitive data in logs

### Production Recommendations
- ⚠️ Implement user authentication
- ⚠️ Add rate limiting per user
- ⚠️ Sanitize filenames
- ⚠️ Encrypt stored transcripts
- ⚠️ Add HTTPS/SSL
- ⚠️ Implement CSRF protection
- ⚠️ Add request validation middleware
- ⚠️ Use secrets management (e.g., dotenv, AWS Secrets)

## Scalability Path

### Current (MVP)
- Single server (backend)
- SQLite (single process)
- Synchronous processing

### Phase 2
- Add job queue (e.g., Bull, Celery)
- Separate transcription/summary jobs
- Parallel processing

### Phase 3
- Multiple backend instances
- Load balancer
- PostgreSQL database
- Redis cache
- S3 for file storage

### Phase 4
- Microservices architecture
- Kubernetes deployment
- Message queue (RabbitMQ, Kafka)
- CDN for frontend assets

## Monitoring & Logging

### Current Logging
- Console logs in backend
- Status tracking in database
- Error messages captured

### Production Enhancements
- Structured logging (Winston, Pino)
- Metrics collection (Prometheus)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- API monitoring (DataDog)

## Dependencies Overview

### Frontend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.x | UI library |
| react-dom | 18.x | React DOM rendering |
| typescript | 5.x | Type safety |
| vite | latest | Build tool |
| vitejs/plugin-react | latest | React integration |

### Backend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.18.x | Web framework |
| typescript | 5.x | Type safety |
| sqlite3 | 5.1.x | Database driver |
| axios | 1.6.x | HTTP client |
| multer | 1.4.x | File upload handling |
| uuid | 9.0.x | ID generation |
| cors | 2.8.x | CORS middleware |
| dotenv | 16.3.x | Environment variables |

---

**Last Updated**: March 14, 2026
**Architecture Version**: 1.0 (MVP)
