from unittest.mock import patch, MagicMock
from app.services.gpt_question_service import generate_question_with_gpt


def test_generate_question_with_gpt_success():
    # תגובת GPT מדומה
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content="מהי אנרגיה קינטית?"
            )
        )
    ]

    # Mock ל-client של OpenAI
    with patch("app.services.gpt_question_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        question = generate_question_with_gpt("קל")

        assert isinstance(question, str)
        assert len(question) > 0
        assert "?" in question