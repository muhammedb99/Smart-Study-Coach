import pytest
from unittest.mock import patch, MagicMock

from app.services.gpt_service import (
    safe_json_parse,
    solve_exercise,
    solve_with_gpt
)

# --------------------------------------------------
# tests for safe_json_parse
# --------------------------------------------------

def test_safe_json_parse_valid_json():
    text = """
    json
    {
      "hint_1": "רמז",
      "hint_2": "נוסחה",
      "solution": "תשובה",
      "explanation": "הסבר",
      "difficulty": "קל"
    }
    
    """

    result = safe_json_parse(text)

    assert result["solution"] == "תשובה"
    assert result["difficulty"] == "קל"


def test_safe_json_parse_with_noise():
    text = """
    טקסט מיותר לפני

    {
      "solution": "פתרון",
      "difficulty": "בינוני"
    }

    טקסט מיותר אחרי
    """

    result = safe_json_parse(text)

    assert result["solution"] == "פתרון"
    assert result["difficulty"] == "בינוני"


def test_safe_json_parse_invalid_json():
    with pytest.raises(ValueError):
        safe_json_parse("אין כאן JSON בכלל")

# --------------------------------------------------
# tests for solve_exercise
# --------------------------------------------------

def test_solve_exercise_success():
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content="""
                {
                  "hint_1": "רמז",
                  "hint_2": "נוסחה",
                  "solution": "299,792,458 מטר לשנייה",
                  "explanation": "מהירות האור בריק",
                  "difficulty": "קל"
                }
                """
            )
        )
    ]

    with patch("app.services.gpt_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        result = solve_exercise("מהי מהירות האור?")

        assert isinstance(result, dict)
        assert result["difficulty"] == "קל"
        assert "solution" in result


def test_solve_exercise_fallback_on_bad_json():
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content="זו תשובה לא תקינה בכלל"
            )
        )
    ]

    with patch("app.services.gpt_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        result = solve_exercise("שאלה בעייתית")

        assert result["difficulty"] == "לא ידוע"
        assert result["solution"] == "לא ניתן היה לחלץ פתרון."

# --------------------------------------------------
# tests for solve_with_gpt
# --------------------------------------------------

def test_solve_with_gpt_valid_json():
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content='{"solution": "פתרון", "explanation": "הסבר"}'
            )
        )
    ]

    with patch("app.services.gpt_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        result = solve_with_gpt("שאלה", "קל")

        assert result["solution"] == "פתרון"
        assert result["explanation"] == "הסבר"


def test_solve_with_gpt_text_fallback():
    fake_response = MagicMock()
    fake_response.choices = [
        MagicMock(
            message=MagicMock(
                content="פתרון טקסט חופשי"
            )
        )
    ]

    with patch("app.services.gpt_service.client") as mock_client:
        mock_client.chat.completions.create.return_value = fake_response

        result = solve_with_gpt("שאלה", "קל")

        assert result["solution"] == "פתרון טקסט חופשי"