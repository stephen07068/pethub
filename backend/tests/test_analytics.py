"""
Tests: Admin dashboard & analytics endpoints.
"""


class TestDashboard:
    def test_dashboard_requires_auth(self, client):
        resp = client.get("/api/admin/dashboard")
        assert resp.status_code == 401

    def test_dashboard_returns_correct_shape(self, client, auth_headers, settings):
        resp = client.get("/api/admin/dashboard", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]

        # Required top-level keys
        assert "totals" in data
        assert "order_status_counts" in data
        assert "low_stock_count" in data
        assert "recent_orders" in data
        assert "recent_payments" in data

        # totals keys
        for key in ["orders", "sales", "products", "categories", "revenue"]:
            assert key in data["totals"]

        # status counts
        for key in ["pending", "processing", "shipped", "delivered", "cancelled"]:
            assert key in data["order_status_counts"]


class TestAnalytics:
    def test_daily_sales(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/sales?days=30", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "chart_data" in data
        assert "total_sales" in data
        assert "average_order_value" in data

    def test_weekly_sales(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/sales/weekly?weeks=4", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "chart_data" in data
        assert data["period"] == "weekly"

    def test_monthly_sales(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/sales/monthly?months=6", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "chart_data" in data
        assert data["period"] == "monthly"

    def test_yearly_sales(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/sales/yearly", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "chart_data" in data
        assert data["period"] == "yearly"

    def test_best_sellers(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/best-sellers?limit=5", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()["data"], list)

    def test_popular_categories(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/popular-categories?limit=5", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()["data"], list)

    def test_revenue_by_category(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/revenue-by-category", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()["data"], list)

    def test_revenue_by_month(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/revenue-by-month?months=6", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "chart_data" in data
        assert "total_revenue" in data

    def test_payment_method_distribution(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/payment-methods", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.get_json()["data"], list)

    def test_aov(self, client, auth_headers):
        resp = client.get("/api/admin/analytics/aov?days=30", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()["data"]
        assert "average_order_value" in data
        assert "total_orders" in data

    def test_analytics_require_auth(self, client):
        for endpoint in [
            "/api/admin/analytics/sales",
            "/api/admin/analytics/best-sellers",
            "/api/admin/analytics/revenue-by-category",
            "/api/admin/analytics/payment-methods",
        ]:
            assert client.get(endpoint).status_code == 401
