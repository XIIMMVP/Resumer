import React, { useState, useEffect } from 'react';
import { useAudioAPI, type AudioRecord } from '../hooks/useAudioAPI';
import '../styles/ResultCard.css';

interface ResultCardProps {
  recordId: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ recordId }) => {
  const [record, setRecord] = useState<AudioRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('summary');
  const { getResult } = useAudioAPI();

  useEffect(() => {
    const fetchResult = async () => {
      const result = await getResult(recordId);
      if (result) {
        setRecord(result);
      }
    };

    fetchResult();
  }, [recordId, getResult]);

  if (!record) {
    return <div className="result-card">Loading result...</div>;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>✨ Results Ready!</h3>
        <p className="result-filename">📄 {record.filename}</p>
        <p className="result-timestamp">
          Processed at {new Date(record.uploadedAt).toLocaleString()}
        </p>
      </div>

      <div className="result-tabs">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📝 Summary
        </button>
        <button
          className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          🎤 Transcript
        </button>
      </div>

      <div className="result-content">
        {activeTab === 'summary' && (
          <div className="tab-content">
            <div className="content-text">{record.summary}</div>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(record.summary)}
            >
              📋 Copy Summary
            </button>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="tab-content">
            <div className="content-text">{record.transcript}</div>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(record.transcript)}
            >
              📋 Copy Transcript
            </button>
          </div>
        )}
      </div>

      <div className="result-footer">
        <p className="character-count">
          {activeTab === 'summary'
            ? `Summary: ${record.summary.length} characters`
            : `Transcript: ${record.transcript.length} characters`}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
