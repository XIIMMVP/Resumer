import React, { useState, useEffect } from 'react';
import { useAudioAPI, type AudioRecord } from '../hooks/useAudioAPI';
import '../styles/History.css';

interface HistoryProps {
  refreshTrigger: number;
}

const History: React.FC<HistoryProps> = ({ refreshTrigger }) => {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AudioRecord | null>(null);
  const { getHistory } = useAudioAPI();

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    const history = await getHistory();
    if (history) {
      setRecords(history);
    }
  };

  const handleRecordClick = (record: AudioRecord) => {
    setSelectedRecord(selectedRecord?.id === record.id ? null : record);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'processing':
        return 'processing';
      case 'error':
        return 'error';
      default:
        return 'pending';
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📋 Processing History</h2>
        <button className="refresh-button" onClick={fetchHistory}>
          🔄 Refresh
        </button>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <p>No audio files processed yet. Upload one to get started!</p>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div key={record.id} className="record-item">
              <div
                className="record-header"
                onClick={() => handleRecordClick(record)}
              >
                <div className="record-info">
                  <h3>{record.filename}</h3>
                  <p className="record-date">
                    {new Date(record.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className={`status-badge ${getStatusColor(record.status)}`}>
                  {record.status.toUpperCase()}
                </div>
              </div>

              {selectedRecord?.id === record.id && (
                <div className="record-details">
                  {record.status === 'error' && (
                    <div className="error-message">
                      <p>❌ Error: {record.errorMessage}</p>
                    </div>
                  )}

                  {record.status === 'completed' && (
                    <>
                      <div className="detail-section">
                        <h4>Summary ({record.summary.length} chars)</h4>
                        <p className="detail-text">{record.summary}</p>
                      </div>

                      <div className="detail-section">
                        <h4>Transcript ({record.transcript.length} chars)</h4>
                        <p className="detail-text">{record.transcript}</p>
                      </div>
                    </>
                  )}

                  {(record.status === 'pending' || record.status === 'processing') && (
                    <div className="processing-message">
                      <p>⏳ Processing in progress...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
