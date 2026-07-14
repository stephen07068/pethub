"""
Shared pytest fixtures for all tests.
"""
import pytest
from app import create_app, db as _db
from app.extensions import bcrypt


# ── App / DB fixtures ────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def app():
    """Session-scoped Flask app with in-memory SQLite."""
    _app = create_app("testing")
    _app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "WTF_CSRF_ENABLED": False,
    })
    yield _app


@pytest.fixture(scope="function", autouse=True)
def db(app):
    """Function-scoped DB — drops and recreates tables for each test."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    return app.test_client()


# ── Seed helpers ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="function")
def admin_token(client, db):
    """Creates a fresh admin and returns a valid JWT bearer token."""
    from app.models.admin import Admin
    admin = Admin(
        full_name="Test Admin",
        email="testadmin@example.com",
        password_hash=bcrypt.generate_password_hash("AdminPass@1").decode("utf-8"),
        role="admin",
    )
    db.session.add(admin)
    db.session.commit()

    resp = client.post(
        "/api/auth/login",
        json={"email": "testadmin@example.com", "password": "AdminPass@1"},
    )
    assert resp.status_code == 200
    token = resp.get_json()["data"]["token"]
    return f"Bearer {token}"


@pytest.fixture(scope="function")
def auth_headers(admin_token):
    return {"Authorization": admin_token}


@pytest.fixture(scope="function")
def category(db):
    """A seeded category for use in product/order tests."""
    from app.models.category import Category
    cat = Category(name="Dogs", slug="dogs", description="Dog products")
    db.session.add(cat)
    db.session.commit()
    return cat


@pytest.fixture(scope="function")
def product(db, category):
    """A seeded in-stock product."""
    from app.models.product import Product
    p = Product(
        name="Test Dog Food",
        slug="test-dog-food",
        category_id=category.id,
        short_description="Premium food",
        price=29.99,
        stock=50,
        status="active",
    )
    db.session.add(p)
    db.session.commit()
    return p


@pytest.fixture(scope="function")
def settings(db):
    """Ensure a Settings row exists."""
    from app.models.settings import Settings
    s = Settings(id=1, store_name="PetStore Hub", shipping_fee=20.00, low_stock_threshold=5)
    db.session.add(s)
    db.session.commit()
    return s


@pytest.fixture(scope="function")
def cart_token(client, product, settings):
    """Creates a cart and adds the test product; returns the cart token."""
    resp = client.post("/api/cart/new", json={})
    assert resp.status_code == 201
    token = resp.get_json()["meta"]["cart_token"]

    resp2 = client.post(
        "/api/cart/items",
        json={"product_id": product.id, "quantity": 2},
        headers={"X-Cart-Token": token},
    )
    assert resp2.status_code == 200
    return token
