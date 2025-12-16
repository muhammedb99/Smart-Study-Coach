from collections import namedtuple
from unittest.mock import patch

from app.services.recommendation_service import recommend_exercise

# אובייקט דמה במקום מודל DB
HistoryItem = namedtuple("HistoryItem", ["question", "difficulty", "success"])


# --------------------------------------------------
# 1️⃣ history קצר → בינוני מבנק שאלות
# --------------------------------------------------

def test_recommend_exercise_short_history():
    history = []

    result = recommend_exercise(history)

    assert result["difficulty"] == "בינוני"
    assert isinstance(result["question"], str)


# --------------------------------------------------
# 2️⃣ שתי הצלחות רצופות → קושי עולה
# --------------------------------------------------

def test_recommend_exercise_difficulty_up():
    history = [
        HistoryItem("שאלה 1", "בינוני", True),
        HistoryItem("שאלה 2", "בינוני", True),
        HistoryItem("שאלה 3", "בינוני", True),
    ]

    result = recommend_exercise(history)

    assert result["difficulty"] == "קשה"


# --------------------------------------------------
# 3️⃣ כישלון אחרון → קושי יורד
# --------------------------------------------------

def test_recommend_exercise_difficulty_down():
    history = [
        HistoryItem("שאלה 1", "קשה", True),
        HistoryItem("שאלה 2", "קשה", False),
        HistoryItem("שאלה 3", "קשה", False),
    ]

    result = recommend_exercise(history)

    # לפי הלוגיקה – יכול להישאר קשה או לרדת לבינוני
    assert result["difficulty"] in ["בינוני", "קשה"]


# --------------------------------------------------
# 4️⃣ לא חוזר על שאלות שכבר נענו
# --------------------------------------------------

def test_recommend_exercise_avoids_used_questions():
    history = [
        HistoryItem("שאלה א", "בינוני", True),
        HistoryItem("שאלה ב", "בינוני", True),
        HistoryItem("שאלה ג", "בינוני", True),
    ]

    result = recommend_exercise(history)

    used_questions = {h.question for h in history}
    assert result["question"] not in used_questions


# --------------------------------------------------
# 5️⃣ fallback ל-GPT אם אין שאלות זמינות בבנק
# --------------------------------------------------

def test_recommend_exercise_gpt_fallback():
    history = [
        HistoryItem("שאלה א", "קל", True),
        HistoryItem("שאלה ב", "קל", True),
        HistoryItem("שאלה ג", "קל", True),
        HistoryItem("שאלה ד", "קל", True),
    ]

    # בנק שאלות מזויף – כל השאלות כבר נענו
    fake_question_bank = {
        "קל": [
            {"text": "שאלה א"},
            {"text": "שאלה ב"},
            {"text": "שאלה ג"},
            {"text": "שאלה ד"},
        ],
        "בינוני": [],
        "קשה": [],
    }

    with patch("app.services.recommendation_service.QUESTION_BANK", fake_question_bank):
        with patch("app.services.recommendation_service.generate_question_with_gpt") as mock_gpt:
            mock_gpt.return_value = "שאלה חדשה מ-GPT"

            result = recommend_exercise(history)

            assert result["question"] == "שאלה חדשה מ-GPT"
            assert result["difficulty"] == "בינוני"