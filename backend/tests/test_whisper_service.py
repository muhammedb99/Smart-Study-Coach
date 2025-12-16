import pytest
from unittest.mock import patch, MagicMock

from app.services.whisper_service import transcribe_audio


class FakeAudioFile:
    """מדמה קובץ אודיו שמגיע מ-FastAPI"""
    async def read(self):
        return b"fake audio bytes"


@pytest.mark.asyncio
async def test_transcribe_audio_success():
    fake_audio = FakeAudioFile()

    fake_transcription = MagicMock()
    fake_transcription.text = "זה טקסט מתומלל"

    with patch("app.services.whisper_service.client") as mock_client:
        mock_client.audio.transcriptions.create.return_value = fake_transcription

        result = await transcribe_audio(fake_audio)

        assert result == "זה טקסט מתומלל"

        mock_client.audio.transcriptions.create.assert_called_once()