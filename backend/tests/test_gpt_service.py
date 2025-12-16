from unittest.mock import patch, MagicMock
from app.services.gpt_service import solve_exercise


def test_solve_exercise_success():
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content="""
                {
                  "hint_1": "רמז",
                  "hint_2": "נוסחה",
                  "solution": "תשובה לדוגמה",
                  "explanation": "הסבר",
                  "difficulty": "קל"
                }
                """
            )
        )
    ]

    with patch("app.services.gpt_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        result = solve_exercise("מהי תאוצה?")

        assert isinstance(result, dict)
        assert result["solution"] == "תשובה לדוגמה"
        assert result["difficulty"] == "קל"