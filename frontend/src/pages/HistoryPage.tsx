import { useEffect, useState } from "react";

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
    <div style={pageWrapper}>
      <div style={pageContainer}>
        {/* Header */}
        <h1 style={titleStyle}>📜 היסטוריית תרגילים</h1>
        <p style={subtitleStyle}>
          כאן תוכל לראות את כל התרגילים שפתרת והתקדמותך לאורך זמן
        </p>

        {/* States */}
        {loading && <p style={infoText}>⏳ טוען היסטוריה...</p>}

        {!loading && history.length === 0 && (
          <p style={infoText}>עדיין לא נפתרו תרגילים.</p>
        )}

        {/* Cards */}
        <div style={listWrapper}>
          {history.map((item) => (
            <div key={item.id} style={card}>
              <div style={cardHeader}>
                <span style={difficultyBadge(item.difficulty)}>
                  {item.difficulty}
                </span>
                <span style={dateText}>
                  {new Date(item.created_at).toLocaleString("he-IL")}
                </span>
              </div>

              <p style={questionText}>
                <strong>שאלה:</strong> {item.question}
              </p>

              {item.solution && (
                <p style={solutionText}>
                  <strong>פתרון:</strong> {item.solution}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;

/* ------------------ STYLES ------------------ */

const pageWrapper = {
  direction: "rtl" as const,
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0f172a, #020617)",
  paddingTop: 80,
};

const pageContainer = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "0 24px 60px",
};

const titleStyle = {
  color: "#ffffff",
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 6,
};

const subtitleStyle = {
  color: "#94a3b8",
  marginBottom: 40,
};

const infoText = {
  color: "#cbd5f5",
  fontSize: 16,
  marginTop: 20,
};

const listWrapper = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 18,
};

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 22,
  color: "#ffffff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const questionText = {
  fontSize: 16,
  lineHeight: 1.6,
};

const solutionText = {
  fontSize: 15,
  marginTop: 10,
  color: "#e5e7eb",
};

const dateText = {
  fontSize: 12,
  color: "#94a3b8",
};

const difficultyBadge = (difficulty: string) => {
  const colors: any = {
    קל: "#22c55e",
    בינוני: "#eab308",
    קשה: "#ef4444",
  };

  return {
    background: colors[difficulty] || "#64748b",
    color: "#020617",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };
};
