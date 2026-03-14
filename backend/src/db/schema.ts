import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../..', 'app.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

export interface AudioRecord {
  id: string;
  filename: string;
  uploadedAt: string;
  transcript: string;
  summary: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export const initializeDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS audio_records (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        uploadedAt TEXT NOT NULL,
        transcript TEXT,
        summary TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        errorMessage TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('✅ Database table initialized');
      }
    });
  });
};

// Helper functions
export const createAudioRecord = (filename: string): AudioRecord => {
  const id = uuidv4();
  const uploadedAt = new Date().toISOString();
  
  db.run(
    `INSERT INTO audio_records (id, filename, uploadedAt, status) VALUES (?, ?, ?, ?)`,
    [id, filename, uploadedAt, 'pending'],
    (err) => {
      if (err) {
        console.error('Error inserting record:', err.message);
      }
    }
  );

  return { id, filename, uploadedAt, transcript: '', summary: '', status: 'pending' };
};

export const updateAudioRecord = (id: string, updates: Partial<AudioRecord>, callback?: (err?: Error) => void) => {
  const { transcript, summary, status, errorMessage } = updates;
  
  db.run(
    `UPDATE audio_records 
     SET transcript = COALESCE(?, transcript), 
         summary = COALESCE(?, summary), 
         status = COALESCE(?, status),
         errorMessage = ?
     WHERE id = ?`,
    [transcript || null, summary || null, status || null, errorMessage || null, id],
    callback
  );
};

export const getAudioRecord = (id: string): Promise<AudioRecord | null> => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM audio_records WHERE id = ?',
      [id],
      (err, row: any) => {
        if (err) reject(err);
        resolve(row || null);
      }
    );
  });
};

export const getAllAudioRecords = (): Promise<AudioRecord[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM audio_records ORDER BY uploadedAt DESC',
      (err, rows: any[]) => {
        if (err) reject(err);
        resolve(rows || []);
      }
    );
  });
};
