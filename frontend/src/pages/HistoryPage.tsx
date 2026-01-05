import { useEffect, useState } from "react";
import {
  Clock,
  MessageSquare,
  Calendar,
  ChevronLeft,
  Trophy,
  FileText
} from "lucide-react";
import "../HistoryPage.css";

function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : data.history || []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-page">
      <div className="ambient-background"></div>

      <main className="history-container">
        <header className="history-header">
          <div className="apple-badge">Learning Log</div>
          <h1>Past <span>Insights.</span></h1>
          <p className="history-subtitle">Review your progress and previous interactions</p>
        </header>

        {loading ? (
          <div className="history-loading">
            <div className="dot-loader"></div>
            <p>Retrieving your learning journey...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>No history found yet. Your journey begins here!</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div
                key={item.id || index}
                className="history-card animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="history-card-header">
                  <div className={`history-icon-box ${item.difficulty}`}>
                    {item.type === 'document' ? <FileText size={18} /> : <MessageSquare size={18} />}
                  </div>
                  <div className="history-meta">
                    <span className="history-type">
                      {item.difficulty} • {item.type || 'General Query'}
                    </span>
                    <span className="history-date">
                      <Calendar size={12} /> {new Date(item.created_at).toLocaleString("he-IL")}
                    </span>
                  </div>
                  <div className={`difficulty-indicator ${item.difficulty}`}></div>
                </div>

                <div className="history-content">
                  <p className="history-q">
                    <strong>שאלה:</strong> {item.question}
                  </p>
                  {item.solution && (
                    <div className="history-a-preview">
                      <strong>פתרון:</strong>
                      <p>{item.solution}</p>
                    </div>
                  )}
                </div>

                <div className="history-card-footer">
                  <button className="view-detail-btn">
                    צפה בפרטים <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;