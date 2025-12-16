from unittest.mock import patch

from app.services.document_ai_service import summarize_document


def test_summarize_document_success():
    fake_openai_result = {
        "summary": "סיכום קצר",
        "key_points": ["נקודה 1", "נקודה 2"],
        "practice_questions": ["שאלה 1"]
    }

    with patch("app.services.document_ai_service.summarize_with_openai") as mock_openai:
        mock_openai.return_value = fake_openai_result

        result = summarize_document("טקסט לדוגמה")

        assert result["summary"] == "סיכום קצר"
        assert result["key_points"] == ["נקודה 1", "נקודה 2"]
        assert result["practice_questions"] == ["שאלה 1"]
        assert result["provider"] == "openai"


def test_summarize_document_missing_fields():
    fake_openai_result = {}

    with patch("app.services.document_ai_service.summarize_with_openai") as mock_openai:
        mock_openai.return_value = fake_openai_result

        result = summarize_document("טקסט לדוגמה")

        assert result["summary"] == ""
        assert result["key_points"] == []
        assert result["practice_questions"] == []
        assert result["provider"] == "openai"