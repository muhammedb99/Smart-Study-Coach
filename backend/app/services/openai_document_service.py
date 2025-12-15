from openai import OpenAI
import os
import json
import re

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_with_openai(text: str) -> dict:
    prompt = f"""
אתה עוזר לימודי אקדמי.

⚠️ כל התשובות שלך חייבות להיות בעברית בלבד.
⚠️ אסור להשתמש באנגלית בכלל.
⚠️ אם החומר באנגלית – תרגם אותו לעברית.

המשימה שלך:
1. סיכום ברור וקצר
2. רשימת נקודות חשובות
3. 3 שאלות תרגול

⚠️ החזר JSON תקין בלבד, בלי טקסט נוסף.

מבנה הפלט:
{{
  "summary": "...",
  "key_points": ["...", "..."],
  "practice_questions": ["...", "..."]
}}

חומר:
{text[:12000]}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    content = response.choices[0].message.content
    match = re.search(r"\{[\s\S]*\}", content)

    if not match:
        raise ValueError("לא התקבל JSON תקין מהמודל")

    return json.loads(match.group())