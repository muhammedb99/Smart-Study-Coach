from app.ml.difficulty_model import predict_difficulty


def test_predict_difficulty_returns_valid_label():
    # פיצ'רים לדוגמה:
    # [success_rate, last_difficulty]
    features = [0.9, 1]  # הצלחה גבוהה, קושי בינוני

    result = predict_difficulty(features)

    assert result in ["קל", "בינוני", "קשה"]


def test_predict_difficulty_low_success():
    features = [0.1, 2]  # הצלחה נמוכה, קושי קשה

    result = predict_difficulty(features)

    assert result in ["קל", "בינוני", "קשה"]


def test_predict_difficulty_with_default_features():
    features = [0, 1]  # אין הצלחות, קושי בינוני

    result = predict_difficulty(features)

    assert isinstance(result, str)