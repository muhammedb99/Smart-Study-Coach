def extract_features(history):
    """
    הופך היסטוריית פתרון לשאלות למספרים שהמודל יכול להבין
    """

    if not history:
        return [0, 1, 0, 0, 1]

    successes = [h.success for h in history if h.success is not None]

    success_rate = sum(successes) / len(successes) if successes else 0

    last_difficulty = history[-1].difficulty
    difficulty_map = {"קל": 0, "בינוני": 1, "קשה": 2}
    streak = streak_score(history)
    num_attempts = len(history)
    avg_difficulty = sum(
            difficulty_map.get(h.difficulty, 1)
                for h in history
        ) / len(history)
    return [
        success_rate,
        difficulty_map.get(last_difficulty, 1),
        streak,
        num_attempts,
        avg_difficulty
    ]

def streak_score(history):
    streak = 0
    for h in reversed(history):
        if h.success:
            streak += 1
        else:
            break
    return streak
