import React, { useRef, useState } from 'react';
import { useAudioAPI } from '../hooks/useAudioAPI';
import ProcessingStatus from './ProcessingStatus';
import ResultCard from './ResultCard';
import '../styles/AudioUploader.css';

interface UploadState {
  recordId: string | null;
  isProcessing: boolean;
  filesSince: number;
}

const AudioUploader: React.FC<{ onHistoryUpdate: () => void }> = ({ onHistoryUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    recordId: null,
    isProcessing: false,
    filesSince: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const { uploadAudio, getResult, loading } = useAudioAPI();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'];
    if (!allowedTypes.some((type) => file.type.startsWith(type.split('/')[0]))) {
      alert('Please select a valid audio file (MP3, WAV, MP4, WebM)');
      return;
    }

    setUploadState({
      recordId: null,
      isProcessing: true,
      filesSince: 0,
    });

    const result = await uploadAudio(file);
    if (result) {
      setUploadState({
        recordId: result.id,
        isProcessing: true,
        filesSince: 0,
      });

      // Poll for result
      pollForResult(result.id);
    } else {
      setUploadState({
        recordId: null,
        isProcessing: false,
        filesSince: 0,
      });
    }
  };

  const pollForResult = async (recordId: string) => {
    const maxAttempts = 120; // 10 minutes with 5 second intervals
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setUploadState((prev) => ({
          ...prev,
          isProcessing: false,
        }));
        alert('Processing timeout. Please check back later.');
        return;
      }

      const result = await getResult(recordId);
      if (result && result.status === 'completed') {
        clearInterval(pollInterval);
        setUploadState((prev) => ({
          ...prev,
          isProcessing: false,
          filesSince: prev.filesSince + 1,
        }));
        onHistoryUpdate();
      } else if (result && result.status === 'error') {
        clearInterval(pollInterval);
        alert(`Processing error: ${result.errorMessage}`);
        setUploadState((prev) => ({
          ...prev,
          isProcessing: false,
        }));
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <div className="audio-uploader-container">
      <div
        className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              uploadFile(e.target.files[0]);
            }
          }}
          style={{ display: 'none' }}
        />

        <div className="upload-icon">🎤</div>
        <h2>Upload Audio File</h2>
        <p>Drag and drop your audio file here or click to select</p>
        <p className="supported-formats">Supported: MP3, WAV, MP4, WebM</p>

        {loading && <p className="loading">Uploading...</p>}
      </div>

      {uploadState.recordId && uploadState.isProcessing && (
        <ProcessingStatus recordId={uploadState.recordId} />
      )}

      {uploadState.recordId && !uploadState.isProcessing && (
        <ResultCard recordId={uploadState.recordId} />
      )}
    </div>
  );
};

export default AudioUploader;
