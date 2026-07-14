"""
Tests: Admin authentication routes.
"""


class TestLogin:
    def test_login_success(self, client, admin_token):
        # admin_token fixture already proves login works
        assert "Bearer " in admin_token

    def test_login_wrong_password(self, client, admin_token):
        resp = client.post(
            "/api/auth/login",
            json={"email": "testadmin@example.com", "password": "WrongPassword"},
        )
        assert resp.status_code == 401
        assert resp.get_json()["success"] is False

    def test_login_unknown_email(self, client):
        resp = client.post(
            "/api/auth/login",
            json={"email": "nobody@nowhere.com", "password": "Whatever"},
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/api/auth/login", json={"email": "x@y.com"})
        assert resp.status_code in (400, 422)

    def test_protected_route_no_token(self, client):
        resp = client.get("/api/admin/dashboard")
        assert resp.status_code == 401

    def test_protected_route_invalid_token(self, client):
        resp = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401
