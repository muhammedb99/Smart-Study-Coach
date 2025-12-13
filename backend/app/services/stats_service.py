from collections import Counter

def compute_difficulty_stats(history):
    difficulties = [
        h.difficulty for h in history if h.difficulty
    ]

    counts = Counter(difficulties)

    return {
        "קל": counts.get("קל", 0),
        "בינוני": counts.get("בינוני", 0),
        "קשה": counts.get("קשה", 0),
    }
