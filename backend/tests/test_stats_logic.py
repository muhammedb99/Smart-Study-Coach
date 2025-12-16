from collections import namedtuple
from app.services.stats_service import compute_difficulty_stats

# אובייקט דמה במקום מודל DB
HistoryItem = namedtuple("HistoryItem", ["difficulty"])


def test_compute_difficulty_stats_normal():
    history = [
        HistoryItem("קל"),
        HistoryItem("קל"),
        HistoryItem("בינוני"),
        HistoryItem("קשה"),
        HistoryItem("קשה"),
        HistoryItem("קשה"),
    ]

    result = compute_difficulty_stats(history)

    assert result["קל"] == 2
    assert result["בינוני"] == 1
    assert result["קשה"] == 3


def test_compute_difficulty_stats_empty():
    result = compute_difficulty_stats([])

    assert result == {
        "קל": 0,
        "בינוני": 0,
        "קשה": 0,
    }


def test_compute_difficulty_stats_ignores_none():
    history = [
        HistoryItem("קל"),
        HistoryItem(None),
        HistoryItem("קשה"),
    ]

    result = compute_difficulty_stats(history)

    assert result["קל"] == 1
    assert result["קשה"] == 1