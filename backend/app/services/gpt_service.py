import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
אתה מאמן לימודים אקדמי רב-תחומי.

תפקידך לעזור לסטודנטים להבין ולפתור שאלות לימודיות ממגוון תחומים, כגון:
מתמטיקה, פיזיקה, מדעי המחשב, הנדסה ושאלות חישוביות כלליות.

⚠️ כל התשובות חייבות להיות בעברית בלבד.

המטרה שלך אינה רק לספק תשובה, אלא ללמד ולהסביר בצורה ברורה, מדורגת ואחראית.

לכל שאלה פעל כך:
1. תן רמז ראשון כללי.
2. תן רמז שני שמכוון לנוסחה / עיקרון.
3. תן פתרון סופי קצר וברור.
4. תן הסבר לימודי שלב־שלב.
5. הערך רמת קושי: קל / בינוני / קשה.

⚠️ החזר אך ורק JSON תקין ללא טקסט נוסף.

מבנה הפלט:

{
  "hint_1": "...",
  "hint_2": "...",
  "solution": "...",
  "explanation": "...",
  "difficulty": "קל | בינוני | קשה"
}
"""


def safe_json_parse(text: str) -> dict:
    """
    חילוץ JSON תקין גם אם המודל החזיר טקסט נוסף
    """
    text = text.strip()
    text = re.sub(r"^```json", "", text)
    text = re.sub(r"```$", "", text)

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("לא נמצא JSON בתשובת המודל")

    return json.loads(match.group())


# --------------------------------------------------
# פתרון לשאלה רגילה (טקסט מהמשתמש)
# --------------------------------------------------

def solve_exercise(question: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question}
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    try:
        return safe_json_parse(content)
    except Exception:
        return {
            "hint_1": "נסה לזהות את סוג הבעיה.",
            "hint_2": "חשוב על נוסחה או עיקרון רלוונטי.",
            "solution": "לא ניתן היה לחלץ פתרון.",
            "explanation": "אירעה שגיאה בניתוח תשובת המודל.",
            "difficulty": "לא ידוע"
        }


# --------------------------------------------------
# פתרון לשאלה שהגיעה מ־Gemini Vision
# --------------------------------------------------

def solve_with_gpt(question_text: str, difficulty: str | None = None) -> dict:
    vision_prompt = f"""
התקבלה שאלה מתוך תמונה שצולמה.

נוסח השאלה:
{question_text}

רמת קושי משוערת: {difficulty if difficulty else "לא ידוע"}

פתור את השאלה בצורה לימודית וברורה.

⚠️ החזר JSON בלבד בפורמט:
{{
  "solution": "...",
  "explanation": "..."
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "אתה מורה פרטי. כל התשובות בעברית בלבד."},
            {"role": "user", "content": vision_prompt}
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content

    try:
        return safe_json_parse(content)
    except Exception:
        return {
            "solution": "לא ניתן היה להפיק פתרון.",
            "explanation": "אירעה שגיאה בעיבוד פתרון השאלה מהתמונה."
        }
