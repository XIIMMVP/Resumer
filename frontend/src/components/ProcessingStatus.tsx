import React, { useState, useEffect } from 'react';
import { useAudioAPI, type AudioRecord } from '../hooks/useAudioAPI';
import '../styles/ProcessingStatus.css';

interface ProcessingStatusProps {
  recordId: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ recordId }) => {
  const [record, setRecord] = useState<AudioRecord | null>(null);
  const { getResult } = useAudioAPI();

  useEffect(() => {
    const fetchStatus = async () => {
      const result = await getResult(recordId);
      if (result) {
        setRecord(result);
      }
    };

    const interval = setInterval(fetchStatus, 3000);
    fetchStatus();

    return () => clearInterval(interval);
  }, [recordId, getResult]);

  if (!record) {
    return <div className="processing-status">Loading status...</div>;
  }

  return (
    <div className="processing-status">
      <div className="status-card">
        <h3>Processing Your Audio</h3>
        <p className="filename">📄 {record.filename}</p>

        <div className="progress-steps">
          {/* Upload step - always completed */}
          <div className="step completed">
            <div className="step-marker">✓</div>
            <div className="step-label">File Uploaded</div>
          </div>

          {/* Transcription step */}
          <div className={`step ${record.transcript ? 'completed' : 'in-progress'}`}>
            <div className="step-marker">
              {record.transcript ? '✓' : <div className="spinner"></div>}
            </div>
            <div className="step-label">Transcribing Audio</div>
          </div>

          {/* Summary step */}
          <div className={`step ${record.summary ? 'completed' : 'pending'}`}>
            <div className="step-marker">
              {record.summary ? '✓' : record.transcript ? <div className="spinner"></div> : '○'}
            </div>
            <div className="step-label">Generating Summary</div>
          </div>
        </div>

        <p className="status-text">
          Status: <strong>{record.status.toUpperCase()}</strong>
        </p>
        <p className="help-text">This may take a few minutes. Please wait...</p>
      </div>
    </div>
  );
};

export default ProcessingStatus;
