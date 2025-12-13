import random
from app.data.question_bank import QUESTION_BANK
from app.services.gpt_question_service import generate_question_with_gpt

DIFFICULTY_ORDER = ["קל", "בינוני", "קשה"]

def get_next_difficulty(current, direction):
    idx = DIFFICULTY_ORDER.index(current)

    if direction == "up" and idx < len(DIFFICULTY_ORDER) - 1:
        return DIFFICULTY_ORDER[idx + 1]

    if direction == "down" and idx > 0:
        return DIFFICULTY_ORDER[idx - 1]

    return current


def recommend_exercise(history):
    if len(history) < 3:
        return {
            "question": random.choice(QUESTION_BANK["בינוני"])["text"],
            "difficulty": "בינוני"
        }

    recent = history[-5:]
    successes = [h.success for h in recent if h.success is not None]
    last_difficulty = recent[-1].difficulty or "בינוני"

    if len(successes) >= 2 and all(successes[-2:]):
        next_difficulty = get_next_difficulty(last_difficulty, "up")
    elif successes and successes[-1] is False:
        next_difficulty = get_next_difficulty(last_difficulty, "down")
    else:
        next_difficulty = last_difficulty

    used_question_texts = {h.question for h in history}

    available = [
        q for q in QUESTION_BANK[next_difficulty]
        if q["text"] not in used_question_texts
    ]

    if available:
        return {
            "question": random.choice(available)["text"],
            "difficulty": next_difficulty
        }

    # GPT fallback
    gpt_question = generate_question_with_gpt(next_difficulty)

    return {
        "question": gpt_question,
        "difficulty": next_difficulty
    }
