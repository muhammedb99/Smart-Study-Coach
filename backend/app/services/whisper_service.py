from openai import OpenAI
import os
import tempfile

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def transcribe_audio(audio_file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio_file.read())
        tmp_path = tmp.name

    with open(tmp_path, "rb") as f:
        transcription = client.audio.transcriptions.create(
            file=f,
            model="whisper-1",
            language="he"
        )

    return transcription.text
