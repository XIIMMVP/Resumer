import { useState } from 'react';

const isDev = import.meta.env.DEV;
const API_URL = isDev 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
  : '/api';

export interface AudioRecord {
  id: string;
  filename: string;
  uploadedAt: string;
  transcript: string;
  summary: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export const useAudioAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAudio = async (file: File): Promise<{ id: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return { id: data.id };
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async (): Promise<AudioRecord[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/history`);

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      return data.records || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('History fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getResult = async (id: string): Promise<AudioRecord | null> => {
    try {
      const response = await fetch(`${API_URL}/result/${id}`);

      if (!response.ok) {
        throw new Error('Record not found');
      }

      return await response.json();
    } catch (err: any) {
      console.error('Get result error:', err);
      return null;
    }
  };

  return {
    uploadAudio,
    getHistory,
    getResult,
    loading,
    error,
  };
};
