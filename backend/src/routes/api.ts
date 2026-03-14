import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createAudioRecord,
  updateAudioRecord,
  getAudioRecord,
  getAllAudioRecords,
} from '../db/schema';
import { transcribeAudio, validateAudioFile } from '../services/transcriptionService';
import { generateSummary, validateTranscript } from '../services/summaryService';

const router = Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
});

// POST /api/process - Upload and process audio file
router.post('/process', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;

    console.log(`\n📥 New audio file received: ${filename}`);

    // Create database record
    const record = createAudioRecord(filename);

    // Validate audio file
    try {
      validateAudioFile(filePath, parseInt(process.env.MAX_FILE_SIZE || '52428800'));
    } catch (validationError: any) {
      updateAudioRecord(record.id, {
        status: 'error',
        errorMessage: validationError.message,
      });
      
      // Clean up file
      fs.unlink(filePath, () => {});
      
      return res.status(400).json({
        error: validationError.message,
        id: record.id,
      });
    }

    // Start processing in background
    processAudioFile(record.id, filePath)
      .catch((error) => {
        console.error('Background processing error:', error.message);
      });

    // Return immediately with record ID
    res.json({
      id: record.id,
      message: 'File received. Processing started...',
      status: 'pending',
    });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history - Get all processed audio records
router.get('/history', async (req: Request, res: Response) => {
  try {
    const records = await getAllAudioRecords();
    res.json({
      total: records.length,
      records,
    });
  } catch (error: any) {
    console.error('History error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/result/:id - Get specific audio record
router.get('/result/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await getAudioRecord(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (error: any) {
    console.error('Get result error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to process audio file
async function processAudioFile(recordId: string, filePath: string) {
  try {
    // Update status to processing
    updateAudioRecord(recordId, { status: 'processing' });
    console.log(`⏳ Processing audio: ${recordId}`);

    // Step 1: Transcribe audio
    console.log(`🎤 Starting transcription...`);
    const transcript = await transcribeAudio(filePath);
    
    console.log(`📝 Transcription completed (${transcript.length} characters)`);

    // Update with transcript
    updateAudioRecord(recordId, {
      transcript,
      status: 'processing', // Still processing summary
    });

    // Step 2: Validate and generate summary
    validateTranscript(transcript);
    console.log(`🔄 Starting summary generation...`);
    const summary = await generateSummary(transcript);

    console.log(`✨ Summary completed (${summary.length} characters)`);

    // Update with summary and mark as completed
    updateAudioRecord(recordId, {
      summary,
      status: 'completed',
    });

    console.log(`✅ Audio processing completed: ${recordId}`);

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err.message);
      else console.log(`🗑️ Temporary file cleaned up`);
    });
  } catch (error: any) {
    console.error(`❌ Error processing audio ${recordId}:`, error.message);
    
    updateAudioRecord(recordId, {
      status: 'error',
      errorMessage: error.message,
    });

    // Clean up file on error
    fs.unlink(filePath, () => {});
  }
}

export default router;
