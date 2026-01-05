import { useState, useEffect ,useRef} from "react";
import ProgressChart from "../components/ProgressChart";
import DocumentAssistant from "../components/DocumentAssistant";

function HomePage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [lockedRecommendation, setLockedRecommendation] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [visionResult, setVisionResult] = useState<any>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  /* ---------- API ---------- */

  const sendQuestion = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setResult(data.solution);
    } catch {
      setError("אירעה שגיאה בשליחת השאלה");
    } finally {
      setLoading(false);
    }
  };


  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      setStats(await res.json());
    } catch {
      console.error("שגיאה בטעינת סטטיסטיקות");
    }
  };

  const fetchRecommendation = async () => {
    if (lockedRecommendation) return;

    try {
      const res = await fetch("/api/recommendation");
      if (!res.ok) throw new Error();

      setRecommendation(await res.json());
      setLockedRecommendation(true);
      setFeedbackSent(false);
      setResult(null);
    } catch {
      setError("לא ניתן להביא תרגיל מומלץ כרגע");
    }
  };


  const startRecording = async () => {
    setVoiceResult(null);
    audioChunksRef.current = [];
    setAudioBlob(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };

    recorder.start();

    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    mediaRecorderRef.current?.stream
      .getTracks()
      .forEach(track => track.stop());

    setRecording(false);
  };


  const sendVoiceQuestion = async () => {
  if (!audioBlob) return;

  const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    try {
      const res = await fetch("/api/voice-question", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setVoiceResult(data);
    } catch {
      setError("שגיאה בשליחת קול");
    }
  };

  const sendVoice = async () => {
    if (!audioBlob) {
      setError("אין הקלטה לשליחה");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const res = await fetch("/api/voice-question", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setVoiceResult(data);
    } catch {
      setError("שגיאה בשליחת הקלטה");
    }
  };


  const sendFeedback = async (success: boolean) => {
    if (!recommendation) return;

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: recommendation.question,
          difficulty: recommendation.difficulty,
          success,
        }),
      });

      const data = await res.json();
      if (!success && data.solution) setResult(data.solution);

      setFeedbackSent(true);
      setLockedRecommendation(false);
      fetchStats();
    } catch {
      setError("שגיאה בשליחת משוב");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (voiceResult?.audio_url) {
      const audio = new Audio(voiceResult.audio_url);
      audio.play().catch(() => {
        console.log("Autoplay נחסם – המשתמש יכול ללחוץ ידנית");
      });
    }
  }, [voiceResult]);

  const sendImageToVision = async () => {
  if (!imageFile) return;

  setVisionLoading(true);
  setVisionResult(null);
  setError(null);

  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const res = await fetch("/api/vision-solve", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    setVisionResult(data);
  } catch {
    setError("שגיאה בניתוח התמונה");
  } finally {
    setVisionLoading(false);
  }
};

  /* ---------- UI ---------- */

  return (
    <div style={pageStyle}>
      {/* Header */}
      <h1 style={titleStyle}>
        🎓 Smart Study Coach
      </h1>
      <p style={subtitleStyle}>
        שאל שאלה · קבל תרגיל · השתפר עם הזמן
      </p>

      {/* Question Input */}
      <div style={sectionCard}>
        <textarea
          placeholder="✍️ הכנס שאלה לימודית..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={textareaStyle}
        />

        <div style={actionsRow}>
          <button
            onClick={sendQuestion}
            disabled={loading}
            style={{ ...primaryButton, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "⏳ שולח..." : "📨 שלח שאלה"}
          </button>

          <button
            onClick={fetchRecommendation}
            disabled={lockedRecommendation}
            style={{
              ...secondaryButton,
              opacity: lockedRecommendation ? 0.6 : 1,
            }}
          >
            {lockedRecommendation ? "🔒 יש תרגיל פתוח" : "🎯 קבל תרגיל מומלץ"}
          </button>
        </div>

        {error && <p style={errorStyle}>{error}</p>}
      </div>

      {/* Image Upload */}
      <div style={sectionCard}>
        <h3 style={{ marginBottom: 10 }}>📸 העלאת תמונה של שאלה</h3>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={sendImageToVision}
          disabled={!imageFile || visionLoading}
          style={{ ...primaryButton, marginTop: 15 }}
        >
          {visionLoading ? "⏳ מנתח תמונה..." : "🔍 נתח תמונה"}
        </button>
      </div>

      {visionResult && (
        <div style={{ ...sectionCard, borderRight: "6px solid #9333ea" }}>
          <h2>👁️ ניתוח תמונה (Gemini)</h2>

          <p><strong>שאלה:</strong> {visionResult.vision.question_text}</p>
          <p><strong>מקצוע:</strong> {visionResult.vision.subject}</p>
          <p><strong>נושא:</strong> {visionResult.vision.topic}</p>
          <p><strong>רמת קושי:</strong> {visionResult.vision.difficulty}</p>

          <hr style={{ margin: "20px 0" }} />

          <h2>🧠 פתרון (GPT)</h2>
          <p><strong>פתרון:</strong> {visionResult.solution.solution}</p>
          <p><strong>הסבר:</strong> {visionResult.solution.explanation}</p>
        </div>
      )}

      {/* Voice Input */}
      <div style={sectionCard}>
        <h3>🎤 שאל שאלה בקול</h3>

        {!recording ? (
          <button onClick={startRecording} style={primaryButton}>
            🎙️ התחל הקלטה
          </button>
        ) : (
          <button onClick={stopRecording} style={failButton}>
            ⏹️ עצור הקלטה
          </button>
        )}

        {audioBlob && (
          <div style={{ marginTop: 15 }}>
            <button onClick={sendVoiceQuestion} style={secondaryButton}>
              🚀 שלח שאלה קולית
            </button>
          </div>
        )}
      </div>
        {/* Document Assistant */}
        <div style={{ marginTop: 40 }}>
          <DocumentAssistant />
        </div>


      {voiceResult && (
        <div style={{ ...sectionCard, borderRight: "6px solid #f59e0b" }}>
          <h2>🗣️ שאלה (Voice)</h2>
          <p>{voiceResult.question}</p>

          <h3>🧠 פתרון</h3>
          <p>{voiceResult.solution}</p>

          {voiceResult.audio_url && (
            <audio controls src={voiceResult.audio_url} style={{ marginTop: 15 }} />
          )}
        </div>
      )}

      {voiceResult && (
        <div style={{ ...sectionCard, borderRight: "6px solid #0ea5e9" }}>
          <h2>🎙️ שאלה שזוהתה מהקול</h2>
          <p><strong>Whisper שמע:</strong> {voiceResult.question}</p>

          <hr style={{ margin: "20px 0" }} />

          <h2>🧠 פתרון (GPT)</h2>
          <p>{voiceResult.solution}</p>

          {voiceResult.audio_url && (
            <audio controls src={voiceResult.audio_url} />
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ ...sectionCard, borderRight: "6px solid #2563eb" }}>
          <h3>🧠 רמז ראשון</h3>
          <p>{result.hint_1}</p>

          <h3>📘 רמז שני</h3>
          <p>{result.hint_2}</p>

          <h3>✅ פתרון</h3>
          <p>{result.solution}</p>

          <h3>📖 הסבר</h3>
          <p>{result.explanation}</p>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        
        <div style={{ ...sectionCard, borderRight: "6px solid #10b981" }}>
          <h2>📘 תרגיל מומלץ</h2>
          <p style={{ fontSize: 16 }}>{recommendation.question}</p>

          {!feedbackSent ? (
            <div style={actionsRow}>
              <button onClick={() => sendFeedback(true)} style={successButton}>
                ✅ הצלחתי
              </button>
              <button onClick={() => sendFeedback(false)} style={failButton}>
                ❌ נכשלתי
              </button>
            </div>
          ) : (
            <p style={successText}>✔ המשוב נשמר והמערכת לומדת</p>
          )}
        </div>
      )}

      {/* Chart */}
      {stats && (
        <div style={chartCard}>
          <ProgressChart data={stats} />
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const pageStyle = {
  direction: "rtl" as const,
  maxWidth: 1000,
  margin: "80px auto",
  padding: 50,
  background: "#ffffff",
  borderRadius: 24,
  boxShadow: "0 40px 120px rgba(0,0,0,0.35)",
};

const titleStyle = {
  textAlign: "center" as const,
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 6,
};

const subtitleStyle = {
  textAlign: "center" as const,
  color: "#64748b",
  marginBottom: 40,
};

const sectionCard = {
  background: "#f8fafc",
  padding: 30,
  borderRadius: 18,
  border: "1px solid #e5e7eb",
  marginBottom: 30,
};

const textareaStyle = {
  width: "100%",
  height: 110,
  padding: 14,
  fontSize: 16,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  resize: "vertical" as const,
};

const actionsRow = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  marginTop: 20,
  flexWrap: "wrap" as const,
};

const primaryButton = {
  padding: "12px 22px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  cursor: "pointer",
};

const secondaryButton = {
  padding: "12px 22px",
  background: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 15,
  cursor: "pointer",
};

const successButton = {
  padding: "10px 20px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};

const failButton = {
  padding: "10px 20px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
};

const chartCard = {
  marginTop: 50,
  padding: 30,
  background: "#f9fafb",
  borderRadius: 18,
  border: "1px solid #e5e7eb",
};

const chartTitle = {
  textAlign: "center" as const,
  marginBottom: 20,
};

const errorStyle = {
  color: "#dc2626",
  marginTop: 15,
  textAlign: "center" as const,
  fontWeight: 600,
};

const successText = {
  marginTop: 15,
  color: "#16a34a",
  fontWeight: 700,
};

export default HomePage;