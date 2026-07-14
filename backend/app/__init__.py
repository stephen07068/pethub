import os
from flask import Flask
from .config import config
from flask import current_app
from .extensions import db, migrate, jwt, cors, bcrypt, limiter
from .utils.logger import setup_logger
from .middleware.error_handler import register_error_handlers


def create_app(env=None):
    """Application factory."""
    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config.get(env, config["default"]))
    app.url_map.strict_slashes = False  # Accept both /path and /path/

    # Ensure upload directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(
        app,
        origins=[app.config["FRONTEND_URL"]],
        supports_credentials=True,
    )
    limiter.init_app(app)

    # Logger
    setup_logger(app)

    # Register error handlers
    register_error_handlers(app)

    # ── Import ALL models so Flask-Migrate detects them ──────────────────────
    from .models import (                                          # noqa: F401
        admin, category, product, product_image, settings,
        cart, cart_item, order, order_item, payment, gift_card,
    )

    # ── Phase 1 blueprints ────────────────────────────────────────────────────
    from .routes.auth import auth_bp
    from .routes.products import products_bp
    from .routes.categories import categories_bp
    from .routes.admin_products import admin_products_bp
    from .routes.settings import settings_bp
    from .routes.wallets import wallets_bp
    from .routes.payments import payments_bp
    from .routes.uploads import uploads_bp

    # ── Phase 2A blueprints ───────────────────────────────────────────────────
    from .routes.cart import cart_bp
    from .routes.checkout import checkout_bp
    from .routes.orders import orders_bp

    # ── Phase 2B blueprints ───────────────────────────────────────────────────
    from .routes.admin_dashboard import admin_dashboard_bp
    from .routes.analytics import analytics_bp
    from .routes.contact import contact_bp

    app.register_blueprint(auth_bp,           url_prefix="/api/auth")
    app.register_blueprint(products_bp,       url_prefix="/api/products")
    app.register_blueprint(categories_bp,     url_prefix="/api/categories")
    app.register_blueprint(admin_products_bp, url_prefix="/api/admin/products")
    app.register_blueprint(settings_bp,       url_prefix="/api/settings")
    app.register_blueprint(wallets_bp,        url_prefix="/api/wallets")
    app.register_blueprint(payments_bp,       url_prefix="/api/payments")
    app.register_blueprint(uploads_bp,        url_prefix="/api/uploads")
    app.register_blueprint(cart_bp,           url_prefix="/api/cart")
    app.register_blueprint(checkout_bp,       url_prefix="/api/checkout")
    app.register_blueprint(orders_bp,         url_prefix="/api/admin/orders")
    app.register_blueprint(admin_dashboard_bp,url_prefix="/api/admin/dashboard")
    app.register_blueprint(analytics_bp,      url_prefix="/api/admin/analytics")
    app.register_blueprint(contact_bp,        url_prefix="/api/contact")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "PetStore Hub API", "phase": "2B"}

    return app
