"""
Tests: Product CRUD, search, filtering, and stock management.
"""


class TestPublicProducts:
    def test_list_products(self, client, product):
        resp = client.get("/api/products/")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_get_product_by_id(self, client, product):
        resp = client.get(f"/api/products/{product.id}")
        assert resp.status_code == 200
        assert resp.get_json()["data"]["name"] == product.name

    def test_get_nonexistent_product(self, client, product):
        resp = client.get("/api/products/99999")
        assert resp.status_code == 404

    def test_search_products(self, client, product):
        resp = client.get("/api/products/search?q=dog")
        assert resp.status_code == 200
        assert resp.get_json()["success"] is True

    def test_filter_by_category_slug(self, client, product, category):
        resp = client.get(f"/api/products/category/{category.slug}")
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert any(p["name"] == product.name for p in data)

    def test_filter_instock(self, client, product):
        resp = client.get("/api/products/?in_stock=true")
        assert resp.status_code == 200
        for p in resp.get_json()["data"]:
            assert p["stock"] > 0

    def test_price_range_filter(self, client, product):
        resp = client.get("/api/products/?min_price=10&max_price=50")
        assert resp.status_code == 200

    def test_featured_products(self, client, product):
        resp = client.get("/api/products/featured")
        assert resp.status_code == 200

    def test_new_arrivals(self, client, product):
        resp = client.get("/api/products/new-arrivals")
        assert resp.status_code == 200


class TestAdminProducts:
    def test_create_product(self, client, auth_headers, category):
        resp = client.post(
            "/api/admin/products/",
            json={
                "name": "Premium Cat Toy",
                "category_id": category.id,
                "price": 19.99,
                "stock": 25,
                "short_description": "Fun toy",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()["data"]
        assert data["name"] == "Premium Cat Toy"
        assert data["stock"] == 25

    def test_create_product_missing_name(self, client, auth_headers, category):
        resp = client.post(
            "/api/admin/products/",
            json={"category_id": category.id, "price": 9.99},
            headers=auth_headers,
        )
        assert resp.status_code == 422

    def test_update_product(self, client, auth_headers, product):
        resp = client.put(
            f"/api/admin/products/{product.id}",
            json={"price": 39.99, "stock": 100},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert float(resp.get_json()["data"]["price"]) == 39.99

    def test_delete_product(self, client, auth_headers, db, category):
        from app.models.product import Product
        p = Product(
            name="Deletable Product", slug="deletable-product",
            category_id=category.id, price=5.99, stock=1, status="active",
        )
        db.session.add(p)
        db.session.commit()

        resp = client.delete(
            f"/api/admin/products/{p.id}",
            headers=auth_headers,
        )
        assert resp.status_code == 200

    def test_update_stock(self, client, auth_headers, product):
        resp = client.patch(
            f"/api/admin/products/{product.id}/stock",
            json={"stock": 99},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["stock"] == 99

    def test_toggle_featured(self, client, auth_headers, product):
        original = product.featured
        resp = client.patch(
            f"/api/admin/products/{product.id}/feature",
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["featured"] != original

    def test_requires_auth(self, client, product):
        resp = client.delete(f"/api/admin/products/{product.id}")
        assert resp.status_code == 401
