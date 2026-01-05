import { useState } from "react";
import { FileText, Upload, CheckCircle, Loader2, RefreshCcw } from "lucide-react";

export default function DocumentAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // EXACT LOGIC FROM YOUR WORKING VERSION
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
    <div style={containerStyle}>
      {!result ? (
        <div style={uploadCard}>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <label htmlFor="file-upload" style={dropZone}>
            <div style={iconCircle}>
              {file ? <CheckCircle color="#34c759" size={24} /> : <Upload size={24} color="#0071e3" />}
            </div>
            <p style={mainText}>{file ? file.name : "בחר מסמך לסיכום"}</p>
            <p style={subText}>PDF · DOCX · TXT</p>
          </label>

          <button
            onClick={sendDocument}
            disabled={!file || loading}
            style={{
              ...submitBtn,
              opacity: !file || loading ? 0.5 : 1,
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <Loader2 className="spinner" size={18} /> : "🤖 סכם מסמך"}
          </button>
        </div>
      ) : (
        <div className="animate-pop" style={resultContainer}>
          <button onClick={() => setResult(null)} style={backBtn}>
            <RefreshCcw size={12} /> נתח קובץ חדש
          </button>

          <div style={section}>
            <strong style={appleLabel}>סיכום:</strong>
            <div style={textContent}>{result.summary}</div>
          </div>

          {result.key_points?.length > 0 && (
            <div style={section}>
              <strong style={appleLabel}>נקודות חשובות:</strong>
              <ul style={listStyle}>
                {result.key_points.map((p: string, i: number) => (
                  <li key={i} style={listItem}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {result.practice_questions?.length > 0 && (
            <div style={section}>
              <strong style={appleLabel}>שאלות תרגול:</strong>
              <div style={qContainer}>
                {result.practice_questions.map((q: string, i: number) => (
                  <div key={i} style={qItem}>{q}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------ DESIGN STYLES (VISIBLE ON WHITE) ------------------ */

const containerStyle: React.CSSProperties = {
  direction: "rtl",
  width: "100%",
};

const uploadCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "15px",
};

const dropZone: React.CSSProperties = {
  width: "100%",
  padding: "30px 10px",
  background: "#f5f5f7", // Light gray background for upload
  border: "1px dashed #d2d2d7",
  borderRadius: "16px",
  textAlign: "center",
  cursor: "pointer",
};

const iconCircle: React.CSSProperties = {
  marginBottom: "10px",
  display: "flex",
  justifyContent: "center",
};

const mainText: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#1d1d1f" };
const subText: React.CSSProperties = { fontSize: "11px", color: "#86868b", marginTop: "4px" };

const submitBtn: React.CSSProperties = {
  width: "100%",
  background: "#0071e3",
  color: "white",
  border: "none",
  padding: "12px 0",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: 600,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
};

const resultContainer: React.CSSProperties = {
  textAlign: "right",
};

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0071e3",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  marginBottom: "15px",
  padding: 0,
};

const section: React.CSSProperties = {
  marginBottom: "20px",
};

const appleLabel: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 800,
  color: "#0071e3", // Keeping the header blue
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "8px",
};

const textContent: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1d1d1f", // DARK BLACK for visibility
};

const listStyle: React.CSSProperties = { paddingRight: "18px", margin: 0 };
const listItem: React.CSSProperties = {
  color: "#424245", // DARK GRAY for bullet text
  fontSize: "14px",
  marginBottom: "8px"
};

const qContainer: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "8px" };
const qItem: React.CSSProperties = {
  background: "#f5f5f7", // Light gray for question boxes
  padding: "12px",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#1d1d1f", // DARK BLACK
  border: "1px solid #d2d2d7",
  fontWeight: 500,
};