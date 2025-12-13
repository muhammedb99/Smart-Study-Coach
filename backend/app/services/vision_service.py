import os
import io
import json
import re
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")
def clean_json(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("Gemini did not return valid JSON")
    return json.loads(match.group())


def extract_question_from_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes))

    prompt = """
        ניתנת לך תמונה של שאלה לימודית.

        המשימה שלך:
        1. לנסח מחדש את השאלה **בעברית תקנית וברורה**
        2. לזהות את המקצוע **בעברית בלבד**
        3. לזהות את הנושא **בעברית בלבד**
        4. להעריך רמת קושי (קל / בינוני / קשה)

        ❗ חשוב:
        - גם אם השאלה מופיעה באנגלית – תרגם אותה לעברית
        - אל תחזיר אנגלית בכלל
        - אל תוסיף טקסט חופשי

        החזר JSON בלבד בפורמט המדויק הבא:

        {
        "question_text": "…",
        "subject": "מתמטיקה | פיזיקה | כימיה | …",
        "topic": "…",
        "difficulty": "קל | בינוני | קשה"
        }
        """

    response = model.generate_content([prompt, image])
    return clean_json(response.text)
