def test_stats_endpoint(client):
    response = client.get("/api/stats")

    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, dict)
    for key in ["קל", "בינוני", "קשה"]:
        assert key in data
        assert isinstance(data[key], int)