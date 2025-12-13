from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from app.database import engine, SessionLocal, Base
from app.db import init_db

from app.models.exercise import ExerciseHistory
from app.models.history_schema import ExerciseHistoryResponse
from app.models.feedback_schema import ExerciseFeedback

from app.services.vision_service import extract_question_from_image
from app.services.gpt_service import solve_exercise, solve_with_gpt
from app.services.recommendation_service import recommend_exercise
from app.services.stats_service import compute_difficulty_stats
from app.services.whisper_service import transcribe_audio
from app.services.gpt_solver_service import solve_question_with_gpt
from app.services.tts_service import text_to_speech
from app.services.topic_detection_service import detect_topic
from fastapi.staticfiles import StaticFiles


# ---------- DB ----------
init_db()
Base.metadata.create_all(bind=engine)


# ---------- APP ----------
app = FastAPI(
    title="Smart Study Coach API",
    description="AI-powered learning assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------- SCHEMAS ----------
class TextRequest(BaseModel):
    question: str


# ---------- TEXT (GPT + TOPIC DETECTION) ----------
@app.post("/api/text")
def process_text(data: TextRequest):

    topic_data = detect_topic(data.question)
    result = solve_exercise(data.question)

    db = SessionLocal()
    db.add(
        ExerciseHistory(
            question=data.question,
            solution=result.get("solution"),
            difficulty=topic_data["difficulty"],
            success=True
        )
    )
    db.commit()
    db.close()

    return {
        "analysis": topic_data,
        "solution": result
    }


# ---------- HISTORY ----------
@app.get("/api/history", response_model=List[ExerciseHistoryResponse])
def get_history():
    db = SessionLocal()
    history = (
        db.query(ExerciseHistory)
        .order_by(ExerciseHistory.created_at.desc())
        .all()
    )
    db.close()
    return history


# ---------- RECOMMENDATION ----------
@app.get("/api/recommendation")
def get_recommendation():
    db = SessionLocal()
    history = db.query(ExerciseHistory).all()
    db.close()

    recommendation = recommend_exercise(history)

    if not recommendation:
        return {"message": "אין מספיק נתונים להמלצה"}

    return recommendation


# ---------- FEEDBACK ----------
@app.post("/api/feedback")
def submit_feedback(data: ExerciseFeedback):
    db = SessionLocal()

    if data.success:
        db.add(
            ExerciseHistory(
                question=data.question,
                difficulty=data.difficulty,
                success=True
            )
        )
        db.commit()
        db.close()
        return {"message": "הצלחה נרשמה"}

    result = solve_exercise(data.question)

    db.add(
        ExerciseHistory(
            question=data.question,
            difficulty=data.difficulty,
            solution=result["solution"],
            success=False
        )
    )
    db.commit()
    db.close()

    return {
        "message": "התרגיל נפתר",
        "solution": result
    }



# ---------- STATS ----------
@app.get("/api/stats")
def get_stats():
    db = SessionLocal()
    history = db.query(ExerciseHistory).all()
    db.close()
    return compute_difficulty_stats(history)


# ---------- VISION (GEMINI → GPT) ----------
@app.post("/api/vision-solve")
async def vision_solve(file: UploadFile = File(...)):
    image_bytes = await file.read()

    vision_data = extract_question_from_image(image_bytes)
    topic_data = detect_topic(vision_data["question_text"])

    solution_data = solve_with_gpt(
        vision_data["question_text"],
        topic_data["difficulty"]
    )


    db = SessionLocal()
    db.add(
        ExerciseHistory(
            question=vision_data["question_text"],
            solution=solution_data["solution"],
            difficulty=topic_data["difficulty"],
            success=True,
        )
    )
    db.commit()
    db.close()

    return {
        "vision": vision_data,
        "analysis": topic_data,
        "solution": solution_data  
    }


# ---------- VOICE (WHISPER → GPT → TTS) ----------
@app.post("/api/voice-question")
async def voice_question(audio: UploadFile = File(...)):
    question_text = await transcribe_audio(audio)

    topic_data = detect_topic(question_text)
    solution = solve_question_with_gpt(question_text)
    audio_path = text_to_speech(solution)

    return {
        "question": question_text,
        "analysis": topic_data,
        "solution": solution,
        "audio_url": audio_path
    }


# ---------- ROOT ----------
@app.get("/")
def root():
    return {"message": "Smart Study Coach API is running 🚀"}
