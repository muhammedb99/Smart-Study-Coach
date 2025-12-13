import json
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def detect_topic(question: str) -> dict:
    prompt = f"""
    זהה את המקצוע, הנושא ורמת הקושי של השאלה הבאה.
    החזר JSON בלבד בפורמט הבא, בלי טקסט נוסף:

    {{
      "subject": "string",
      "topic": "string",
      "difficulty": "קל|בינוני|קשה"
    }}

    שאלה:
    {question}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    raw = response.choices[0].message.content.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "subject": "לא ידוע",
            "topic": "לא ידוע",
            "difficulty": "בינוני"
        }
