def test_history_returns_list(client):
    response = client.get("/api/history")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)

    if len(data) > 0:
        item = data[0]
        assert "question" in item
        assert "difficulty" in item
        assert "success" in item