import { useState } from "react";

export default function DocumentAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sendDocument = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/document-assistant", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      alert("שגיאה בשליחת המסמך");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <h2 style={title}>📄 עוזר מסמכים חכם</h2>
      <p style={subtitle}>
        העלה מסמך וקבל סיכום, נקודות חשובות ושאלות תרגול
      </p>

      {/* input מוסתר */}
      <input
        id="file-upload"
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {/* כפתור בחירת קובץ */}
      <label htmlFor="file-upload" style={uploadButton}>
        📎 בחר מסמך
      </label>

      <div style={formats}>PDF · DOCX · TXT</div>

      {file && <div style={fileName}>✔ {file.name}</div>}

      {/* כפתור שליחה */}
      <button
        onClick={sendDocument}
        disabled={!file || loading}
        style={{
          ...submitButton,
          opacity: !file || loading ? 0.5 : 1,
          cursor: !file || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "⏳ מסכם..." : "🤖 סכם מסמך"}
      </button>

      {/* תוצאה */}
      {result && (
        <div style={resultBox}>
          <h3>🧠 סיכום</h3>
          <p>{result.summary}</p>

          {result.key_points?.length > 0 && (
            <>
              <h4>📌 נקודות חשובות</h4>
              <ul>
                {result.key_points.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          )}

          {result.practice_questions?.length > 0 && (
            <>
              <h4>📝 שאלות תרגול</h4>
              <ol>
                {result.practice_questions.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const card = {
  background: "#ffffff",
  padding: 40,
  borderRadius: 24,
  border: "1px solid #e5e7eb",
  maxWidth: 520,
  margin: "0 auto",
  textAlign: "center" as const,
};

const title = {
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 6,
};

const subtitle = {
  color: "#64748b",
  marginBottom: 30,
};

const uploadButton = {
  display: "inline-block",
  padding: "14px 28px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  cursor: "pointer",
  fontWeight: 600,
};

const formats = {
  marginTop: 10,
  fontSize: 13,
  color: "#64748b",
};

const fileName = {
  marginTop: 18,
  fontWeight: 600,
  color: "#16a34a",
};

const submitButton = {
  marginTop: 28,
  width: "100%",
  padding: "14px 0",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 14,
  fontSize: 16,
};
const resultBox = {
  marginTop: 40,
  padding: 24,
  background: "#f9fafb",
  borderRadius: 18,
  border: "1px solid #e5e7eb",
  textAlign: "right" as const,
  lineHeight: 1.7,
};