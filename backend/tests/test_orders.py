"""
Tests: Admin order management — list, filter, get, update status.
"""

ADDRESS = {
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+15559876543",
    "country": "US",
    "state": "NY",
    "city": "New York",
    "street_address": "456 Broadway",
    "postal_code": "10001",
}


def _place_order(client, cart_token, method="btc"):
    return client.post(
        "/api/checkout/place-order",
        json={
            "cart_token": cart_token,
            "address": ADDRESS,
            "payment_method": method,
            "payment_reference": "txref123",
        },
    )


class TestAdminOrders:
    def test_list_orders_requires_auth(self, client):
        resp = client.get("/api/admin/orders/")
        assert resp.status_code == 401

    def test_list_orders(self, client, auth_headers, cart_token, settings):
        _place_order(client, cart_token)
        resp = client.get("/api/admin/orders/", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_filter_by_status(self, client, auth_headers, cart_token, settings):
        _place_order(client, cart_token)
        resp = client.get("/api/admin/orders/?status=processing", headers=auth_headers)
        assert resp.status_code == 200
        for order in resp.get_json()["data"]:
            assert order["status"] == "processing"

    def test_search_by_email(self, client, auth_headers, cart_token, settings):
        _place_order(client, cart_token)
        resp = client.get("/api/admin/orders/?q=jane@example.com", headers=auth_headers)
        assert resp.status_code == 200

    def test_get_order_detail(self, client, auth_headers, cart_token, settings):
        order_number = _place_order(client, cart_token).get_json()["data"]["order_number"]
        resp = client.get(f"/api/admin/orders/{order_number}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert data["order_number"] == order_number
        assert "items" in data
        assert "customer_name" in data

    def test_update_order_status(self, client, auth_headers, cart_token, settings, db):
        order_number = _place_order(client, cart_token).get_json()["data"]["order_number"]
        from app.models.order import Order
        order = Order.query.filter_by(order_number=order_number).first()

        resp = client.patch(
            f"/api/admin/orders/{order.id}/status",
            json={"status": "shipped"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["data"]["status"] == "shipped"

    def test_update_invalid_status(self, client, auth_headers, cart_token, settings, db):
        order_number = _place_order(client, cart_token).get_json()["data"]["order_number"]
        from app.models.order import Order
        order = Order.query.filter_by(order_number=order_number).first()

        resp = client.patch(
            f"/api/admin/orders/{order.id}/status",
            json={"status": "flying"},
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_pagination(self, client, auth_headers, cart_token, settings):
        _place_order(client, cart_token)
        resp = client.get("/api/admin/orders/?page=1&per_page=1", headers=auth_headers)
        assert resp.status_code == 200
        assert "meta" in resp.get_json()
