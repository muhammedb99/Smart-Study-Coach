def extract_features(history):
    """
    הופך היסטוריית פתרון לשאלות למספרים שהמודל יכול להבין
    """

    if not history:
        return [0, 1]  

    successes = [h.success for h in history if h.success is not None]

    success_rate = sum(successes) / len(successes) if successes else 0

    last_difficulty = history[-1].difficulty
    difficulty_map = {"קל": 0, "בינוני": 1, "קשה": 2}

    return [
        success_rate,
        difficulty_map.get(last_difficulty, 1)
    ]