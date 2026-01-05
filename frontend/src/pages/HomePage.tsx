import { useState, useEffect, useRef } from "react";
import {
  Mic, StopCircle, Send, Sparkles,
  Image as ImageIcon, BarChart3, FileText,
  CheckCircle, XCircle, X, Camera, Waves, Upload
} from "lucide-react";
import ProgressChart from "../components/ProgressChart";
import DocumentAssistant from "../components/DocumentAssistant";
import "../HomePage.css";

function HomePage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [lockedRecommendation, setLockedRecommendation] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  

  // Loading & Modal UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  /* ---------- API LOGIC ---------- */

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      setStats(await res.json());
    } catch { console.error("שגיאה בטעינת סטטיסטיקות"); }
  };

  const sendQuestion = async () => {
    setProcessingMessage("Thinking...");
    setIsProcessing(true);
    setShowModal(true);
    setResult(null);
    try {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      // Map text result to the unified state
      setResult(data.solution);
    } catch { setError("Error sending question"); } finally { setIsProcessing(false); }
  };

  const fetchRecommendation = async () => {
    if (lockedRecommendation) return;
    setProcessingMessage("Generating personalized exercise...");
    setIsProcessing(true);
    setShowModal(true);
    setResult(null);
    try {
      const res = await fetch("/api/recommendation");
      const data = await res.json();
      setRecommendation(data);
      setLockedRecommendation(true);
      setFeedbackSent(false);
    } catch { setError("Could not fetch recommendation"); } finally { setIsProcessing(false); }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  // FIXED VOICE LOGIC
  const sendVoiceQuestion = async () => {
    if (!audioBlob) return;
    setProcessingMessage("Analyzing your voice...");
    setIsProcessing(true);
    setShowModal(true);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    try {
      const res = await fetch("/api/voice-question", { method: "POST", body: formData });
      const data = await res.json();

      // MAPPING: Convert original voice format to the Bento result format
      setResult({
        solution: data.solution,
        explanation: "שאלה שזוהתה: " + data.question, // Put the transcribed question here
        hint_1: "Voice Input Detected",
        audio_url: data.audio_url // Carry this over if you want to play it
      });

      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play().catch(e => console.log("Autoplay blocked"));
      }
    } catch { setError("Error sending audio"); } finally { setIsProcessing(false); }
  };

  const sendImageToVision = async () => {
    if (!imageFile) return;
    setProcessingMessage("Analyzing image content...");
    setIsProcessing(true);
    setShowModal(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const res = await fetch("/api/vision-solve", { method: "POST", body: formData });
      const data = await res.json();
      // MAPPING: Convert original vision format to the Bento result format
      setResult({
        solution: data.solution.solution,
        explanation: data.solution.explanation,
        hint_1: `Subject: ${data.vision.subject} (${data.vision.difficulty})`,
      });
    } catch { setError("Error analyzing image"); } finally { setIsProcessing(false); }
  };

  const sendFeedback = async (success: boolean) => {
    if (!recommendation) return;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: recommendation.question, difficulty: recommendation.difficulty, success }),
      });
      const data = await res.json();
      if (!success && data.solution) setResult(data.solution);
      setFeedbackSent(true); setLockedRecommendation(false); fetchStats();
    } catch { setError("Error sending feedback"); }
  };

  useEffect(() => { fetchStats(); }, []);

  const closeModals = () => {
    setShowModal(false);
    setResult(null);
    setRecommendation(null);
  };

  return (
    <div className="bento-page">
      <div className="ambient-background"></div>

      <main className="bento-container">
        <header className="bento-header">
          <div className="apple-badge">Smart Coach</div>
          <h1>What's on your <span>mind?</span></h1>
        </header>

        <div className="grid-layout">
          {/* TEXT INPUT CARD */}
          <section className="bento-card main-input-card">
            <div className="card-top">
              <span className="card-tag">Ask Anything</span>
            </div>
            <textarea
              placeholder="Enter a study question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="main-card-footer">
              <button onClick={fetchRecommendation} disabled={lockedRecommendation} className={`recommend-pill ${lockedRecommendation ? 'locked' : ''}`}>
                <Sparkles size={16} />
                <span>{lockedRecommendation ? "Exercise Active" : "Recommend"}</span>
              </button>
              <button onClick={sendQuestion} disabled={!question || isProcessing} className="send-pill">
                <Send size={16} /> Send
              </button>
            </div>
          </section>

          {/* VISION CARD */}
          <section className="bento-card tool-card">
            <div className="tool-header">
              <div className="icon-circle purple"><Camera size={20} /></div>
              <h3>Vision</h3>
            </div>
            <p className="tool-desc">Upload a photo of your problem.</p>
            <div className="tool-action-area">
              {!imageFile ? (
                <label className="apple-upload-label">
                  <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  <Upload size={18} />
                  <span>Upload</span>
                </label>
              ) : (
                <div className="file-ready animate-pop">
                  <span className="file-name-mini">Photo Ready</span>
                  <button onClick={sendImageToVision} className="tool-exec-btn purple">Analyze</button>
                  <button onClick={() => setImageFile(null)} className="clear-x"><X size={12} /></button>
                </div>
              )}
            </div>
          </section>

          {/* VOICE CARD */}
          <section className="bento-card tool-card">
            <div className="tool-header">
              <div className="icon-circle orange"><Waves size={20} /></div>
              <h3>Voice</h3>
            </div>
            <p className="tool-desc">Record your question.</p>
            <div className="tool-action-area">
              <button onClick={recording ? stopRecording : startRecording} className={`apple-mic-btn ${recording ? 'is-recording' : ''}`}>
                {recording ? <StopCircle size={24} /> : <Mic size={24} />}
              </button>
              {audioBlob && !recording && (
                <button onClick={sendVoiceQuestion} className="tool-exec-btn orange animate-pop">Send Voice</button>
              )}
            </div>
          </section>

          <section className="bento-card docs-card">
            <div className="tool-header"><div className="icon-circle blue"><FileText size={20} /></div><h3>Files</h3></div>
            <DocumentAssistant />
          </section>

          <section className="bento-card stats-card">
            <div className="tool-header"><div className="icon-circle green"><BarChart3 size={20} /></div><h3>Progress</h3></div>
            {stats && <ProgressChart data={stats} />}
          </section>
        </div>
      </main>

      {/* FIXED UNIFIED MODAL */}
      {showModal && (
        <div className="apple-modal-overlay" onClick={closeModals}>
          <div className="apple-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-indicator"></div>
              <button className="modal-close-btn" onClick={closeModals}><X size={16} /></button>
            </div>

            <div className="modal-body-scroll">
              {isProcessing ? (
                <div className="modal-loading-state">
                  <div className="apple-spinner"></div>
                  <h3>{processingMessage}</h3>
                </div>
              ) : (
                <>
                  {/* Unified Result Display (Text, Voice, Vision) */}
                  {result && (
                    <div className="answer-layout animate-pop">
                      <div className="modal-tag">Intelligence Result</div>
                      {result.hint_1 && (
                        <div className="hint-card">
                          <strong className="label-accent">Context</strong>
                          <p>{result.hint_1}</p>
                        </div>
                      )}
                      <div className="content-section">
                        <strong className="apple-label">Answer:</strong>
                        <div className="solution-text">{result.solution}</div>
                      </div>
                      <div className="content-section">
                        <strong className="apple-label">Explanation:</strong>
                        <div className="explanation-bubble">{result.explanation}</div>
                      </div>
                      {result.audio_url && <audio controls src={result.audio_url} className="modal-audio" />}
                    </div>
                  )}

                  {/* Recommendation Display */}
                  {recommendation && !result && (
                    <div className="answer-layout animate-pop">
                      <div className="modal-tag">Exercise</div>
                      <h2 className="rec-title">{recommendation.question}</h2>
                      {!feedbackSent ? (
                        <div className="apple-feedback-btns">
                          <button onClick={() => sendFeedback(true)} className="fb-btn-apple yes"><CheckCircle size={18} /> Solved</button>
                          <button onClick={() => sendFeedback(false)} className="fb-btn-apple no"><XCircle size={18} /> Show Solution</button>
                        </div>
                      ) : <div className="learning-msg">Progress Saved.</div>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;