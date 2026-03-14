import { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import History from './components/History';
import './App.css';

function App() {
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleHistoryUpdate = () => {
    setHistoryRefresh((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🎤 Audio Transcription & Summarizer</h1>
          <p>Upload your audio files for instant transcription and detailed summaries</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <section className="uploader-section">
            <AudioUploader onHistoryUpdate={handleHistoryUpdate} />
          </section>

          <section className="history-section">
            <History refreshTrigger={historyRefresh} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>Audio Transcription & Summarizer • Powered by Whisper & Groq</p>
      </footer>
    </div>
  );
}

export default App;
