"""
Tests: Full checkout flow — place order, stock deduction, order lookup.
"""

ADDRESS = {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+15551234567",
    "country": "US",
    "state": "CA",
    "city": "Los Angeles",
    "street_address": "123 Main St",
    "postal_code": "90001",
}


class TestCheckout:
    def test_place_order_crypto(self, client, cart_token, product, settings, db):
        initial_stock = db.session.get(type(product), product.id).stock

        resp = client.post(
            "/api/checkout/place-order",
            json={
                "cart_token": cart_token,
                "address": ADDRESS,
                "payment_method": "btc",
                "payment_reference": "abc123txhash",
                "currency": "BTC",
            },
        )
        assert resp.status_code == 201, resp.get_json()
        data = resp.get_json()["data"]
        assert "order_number" in data
        assert data["order_number"].startswith("PSH-")

        # Stock should be deducted
        db.session.expire_all()
        updated = db.session.get(type(product), product.id)
        assert updated.stock == initial_stock - 2  # cart had qty=2

    def test_place_order_apple_pay(self, client, product, settings):
        # Fresh cart for apple pay
        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        client.post(
            "/api/cart/items",
            json={"product_id": product.id, "quantity": 1},
            headers={"X-Cart-Token": token},
        )
        resp = client.post(
            "/api/checkout/place-order",
            json={
                "cart_token": token,
                "address": ADDRESS,
                "payment_method": "apple_pay",
                "payment_reference": "applepay_ref_001",
                "currency": "USD",
            },
        )
        assert resp.status_code == 201

    def test_place_order_empty_cart_fails(self, client, settings):
        token = client.post("/api/cart/new", json={}).get_json()["meta"]["cart_token"]
        resp = client.post(
            "/api/checkout/place-order",
            json={
                "cart_token": token,
                "address": ADDRESS,
                "payment_method": "btc",
            },
        )
        assert resp.status_code in (400, 422)

    def test_get_order_by_number(self, client, cart_token, settings):
        place = client.post(
            "/api/checkout/place-order",
            json={
                "cart_token": cart_token,
                "address": ADDRESS,
                "payment_method": "eth",
                "payment_reference": "eth_tx_001",
            },
        )
        order_number = place.get_json()["data"]["order_number"]
        resp = client.get(f"/api/checkout/order/{order_number}")
        assert resp.status_code == 200
        assert resp.get_json()["data"]["order_number"] == order_number

    def test_get_nonexistent_order(self, client):
        resp = client.get("/api/checkout/order/PSH-0000-XXXX")
        assert resp.status_code == 404
