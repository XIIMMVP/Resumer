import axios from 'axios';
import fs from 'fs';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

export const transcribeAudio = async (filePath: string): Promise<string> => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY not set in environment variables');
  }

  try {
    // Read file as buffer
    const audioBuffer = fs.readFileSync(filePath);
    console.log(`📤 Uploading file to Deepgram API: ${filePath} (${audioBuffer.length} bytes)`);

    const response = await axios.post(
      DEEPGRAM_API_URL,
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/*',
        },
        params: {
          model: 'nova-2',
          language: 'es', // Spanish by default
          smart_format: 'true',
        },
        timeout: 600000, // 10 minutes timeout for large files
      }
    );

    console.log(`✅ Transcription completed`);
    
    // Extract transcript from Deepgram response
    const transcript = response.data.results?.channels[0]?.alternatives[0]?.transcript || '';
    
    if (!transcript) {
      throw new Error('No transcript returned from Deepgram API');
    }
    
    return transcript;
  } catch (error: any) {
    console.error('❌ Transcription error:', error.message);
    
    if (error.response?.data) {
      console.error('API Error details:', error.response.data);
    }
    
    throw new Error(`Transcription failed: ${error.message}`);
  }
};

export const validateAudioFile = (filePath: string, maxSize: number = 209715200): boolean => {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.size > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
    }
    
    // Check MIME type by extension
    const allowedExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
    const fileExtension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Unsupported audio format: ${fileExtension}`);
    }

    return true;
  } catch (error: any) {
    console.error('File validation error:', error.message);
    throw error;
  }
};
