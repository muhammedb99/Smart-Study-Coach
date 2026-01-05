import random
from app.data.question_bank import QUESTION_BANK
from app.services.gpt_question_service import generate_question_with_gpt
from app.ml.features import extract_features
from app.ml.difficulty_model import predict_difficulty

DIFFICULTY_ORDER = ["קל", "בינוני", "קשה"]

def get_next_difficulty(current, direction):
    idx = DIFFICULTY_ORDER.index(current)

    if direction == "up" and idx < len(DIFFICULTY_ORDER) - 1:
        return DIFFICULTY_ORDER[idx + 1]

    if direction == "down" and idx > 0:
        return DIFFICULTY_ORDER[idx - 1]

    return current


def recommend_exercise(history):
    if not history:
        difficulty = "בינוני"
    else:
        features = extract_features(history)
        difficulty = predict_difficulty(features)

        print("🧠 FEATURES:", features)
    print("🤖 MODEL PREDICTED:", difficulty)
    used_question_texts = {h.question for h in history}

    available = [
        q for q in QUESTION_BANK.get(difficulty, [])
        if q["text"] not in used_question_texts
    ]

    if available:
        return {
            "question": random.choice(available)["text"],
            "difficulty": difficulty
        }

    gpt_question = generate_question_with_gpt(difficulty)

    return {
        "question": gpt_question,
        "difficulty": difficulty
    }
