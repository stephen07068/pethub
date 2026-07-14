"""
Tests: Guest cart — create, add, update, remove, view, validate.
"""


class TestCartCreate:
    def test_create_cart(self, client):
        resp = client.post("/api/cart/new", json={})
        assert resp.status_code == 201
        data = resp.get_json()["meta"]
        assert "cart_token" in data

    def test_create_cart_twice_different_tokens(self, client):
        t1 = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        t2 = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        assert t1 != t2


class TestCartItems:
    def test_add_item(self, client, product, settings):
        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        resp = client.post(
            "/api/cart/items",
            json={"product_id": product.id, "quantity": 2},
            headers={"X-Cart-Token": token},
        )
        assert resp.status_code == 200

    def test_add_out_of_stock_fails(self, client, db, category, settings):
        from app.models.product import Product
        p = Product(
            name="Empty Stock", slug="empty-stock-xyz",
            category_id=category.id, price=9.99, stock=0, status="active",
        )
        db.session.add(p)
        db.session.commit()

        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        resp = client.post(
            "/api/cart/items",
            json={"product_id": p.id, "quantity": 1},
            headers={"X-Cart-Token": token},
        )
        assert resp.status_code == 422

    def test_add_exceeds_stock_fails(self, client, product, settings):
        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        resp = client.post(
            "/api/cart/items",
            json={"product_id": product.id, "quantity": product.stock + 100},
            headers={"X-Cart-Token": token},
        )
        assert resp.status_code == 422

    def test_add_zero_quantity_fails(self, client, product, settings):
        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        resp = client.post(
            "/api/cart/items",
            json={"product_id": product.id, "quantity": 0},
            headers={"X-Cart-Token": token},
        )
        assert resp.status_code in (400, 422)

    def test_view_cart(self, client, cart_token):
        resp = client.get(
            "/api/cart/",
            headers={"X-Cart-Token": cart_token},
        )
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "items" in data
        assert "grand_total" in data

    def test_update_item_quantity(self, client, cart_token, product):
        cart = client.get("/api/cart/", headers={"X-Cart-Token": cart_token}).get_json()["data"]
        item_id = cart["items"][0]["id"]
        
        resp = client.put(
            f"/api/cart/items/{item_id}",
            json={"quantity": 3},
            headers={"X-Cart-Token": cart_token},
        )
        assert resp.status_code == 200

    def test_remove_item(self, client, cart_token, product):
        cart = client.get("/api/cart/", headers={"X-Cart-Token": cart_token}).get_json()["data"]
        item_id = cart["items"][0]["id"]

        resp = client.delete(
            f"/api/cart/items/{item_id}",
            headers={"X-Cart-Token": cart_token},
        )
        assert resp.status_code == 200

    def test_clear_cart(self, client, cart_token):
        resp = client.delete(
            "/api/cart/clear",
            headers={"X-Cart-Token": cart_token},
        )
        assert resp.status_code == 200
        cart = client.get(
            "/api/cart/",
            headers={"X-Cart-Token": cart_token},
        ).get_json()["data"]
        assert cart["items"] == []

    def test_invalid_token(self, client):
        resp = client.get(
            "/api/cart/",
            headers={"X-Cart-Token": "totally-fake-token"},
        )
        # Assuming missing/invalid token triggers a new cart creation on GET
        assert resp.status_code == 201
