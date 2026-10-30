def test_meta_returns_categories_and_regions(client):
    res = client.get("/meta")
    assert res.status_code == 200
    data = res.json()
    assert len(data["categories"]) == 3
    assert len(data["regions"]) >= 4
    assert data["units"] == ["кг", "шт", "упак"]


def test_suppliers_combined_filters(client):
    res = client.get(
        "/suppliers",
        params={
            "category": "ingredients",
            "region": "Сибирский ФО",
            "has_certificates": True,
            "page_size": 50,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["category"] == "ingredients"
        assert item["region"] == "Сибирский ФО"
        assert item["has_certificates"] is True


def test_brief_sets_single_best_badge(client):
    res = client.get(
        "/suppliers",
        params={"brief_category": "ingredients", "page_size": 50},
    )
    assert res.status_code == 200
    best = [i for i in res.json()["items"] if i.get("rank_badge") == "best"]
    assert len(best) == 1


def test_list_without_brief_highlights_top_three(client):
    res = client.get("/suppliers", params={"page_size": 50})
    top = [i for i in res.json()["items"] if i.get("rank_badge") == "top"]
    assert len(top) == 3


def test_get_supplier_by_id(client):
    res = client.get("/suppliers/1")
    assert res.status_code == 200
    assert res.json()["id"] == 1


def test_get_supplier_not_found(client):
    res = client.get("/suppliers/9999")
    assert res.status_code == 404
