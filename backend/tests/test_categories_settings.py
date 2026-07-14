"""
Tests: Categories and Store Settings.
"""


class TestCategories:
    def test_list_categories(self, client, category):
        resp = client.get("/api/categories/")
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert any(c["slug"] == "dogs" for c in data)

    def test_get_category_by_id(self, client, category):
        resp = client.get(f"/api/categories/{category.id}")
        assert resp.status_code == 200
        assert resp.get_json()["data"]["name"] == "Dogs"

    def test_get_nonexistent_category(self, client):
        resp = client.get("/api/categories/99999")
        assert resp.status_code == 404

    def test_create_category_requires_auth(self, client):
        resp = client.post("/api/categories/", json={"name": "Birds", "slug": "birds"})
        assert resp.status_code == 401

    def test_create_category(self, client, auth_headers):
        resp = client.post(
            "/api/categories/",
            json={"name": "Birds", "slug": "birds", "description": "For bird lovers"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.get_json()["data"]["name"] == "Birds"

    def test_update_category(self, client, auth_headers, category):
        resp = client.put(
            f"/api/categories/{category.id}",
            json={"description": "Updated dog products"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["description"] == "Updated dog products"

    def test_delete_category(self, client, auth_headers, db):
        from app.models.category import Category
        cat = Category(name="Reptiles", slug="reptiles", description="Reptile products")
        db.session.add(cat)
        db.session.commit()

        resp = client.delete(f"/api/categories/{cat.id}", headers=auth_headers)
        assert resp.status_code == 200


class TestSettings:
    def test_get_settings(self, client, settings):
        resp = client.get("/api/settings/")
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "shipping_fee" in data
        assert "store_name" in data
        assert "low_stock_threshold" in data

    def test_update_settings_requires_auth(self, client, settings):
        resp = client.put("/api/settings/", json={"shipping_fee": 25.00})
        assert resp.status_code == 401

    def test_update_settings(self, client, auth_headers, settings):
        resp = client.put(
            "/api/settings/",
            json={"shipping_fee": 25.00, "low_stock_threshold": 10},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert float(data["shipping_fee"]) == 25.00
        assert data["low_stock_threshold"] == 10


class TestHealth:
    def test_health_check(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert data["phase"] == "2B"
