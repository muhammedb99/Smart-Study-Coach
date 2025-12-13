import os
import json
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_question_with_gpt(difficulty, topic="מתמטיקה", used_questions=None):
    used_questions = used_questions or []

    prompt = f"""
    צור שאלה לימודית חדשה במקצוע {topic}
    ברמת קושי: {difficulty}

    אסור לחזור על שאלות אלו:
    {used_questions}

    החזר JSON בלבד בפורמט:
    {{
      "question": "...",
      "difficulty": "{difficulty}"
    }}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return json.loads(response.choices[0].message.content)
