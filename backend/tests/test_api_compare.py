def test_compare_requires_two_or_three(client):
    res = client.post("/compare", json={"ids": [1]})
    assert res.status_code == 422


def test_compare_highlights_min_price(client):
    res = client.post("/compare", json={"ids": [1, 7]})
    assert res.status_code == 200
    data = res.json()
    assert data["best"]["price_per_unit"] == [1]


def test_compare_skips_price_when_units_differ(client):
    res = client.post("/compare", json={"ids": [1, 9]})
    assert res.status_code == 200
    assert res.json()["best"]["price_per_unit"] == []


def test_recommend_returns_top_three(client):
    res = client.post(
        "/recommend",
        json={"category": "packaging", "need_certificates": True},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 3
    assert data["items"][0]["rank_badge"] == "best"
    assert data["explanation"]
    assert data["weights"]["category"] == 30
