from openai import OpenAI
import os
import uuid

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

def text_to_speech(text: str) -> str:
    filename = f"voice_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(STATIC_DIR, filename)

    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=text
    ) as response:
        response.stream_to_file(filepath)

    return f"/static/{filename}"
