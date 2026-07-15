import os
from flask import Flask
from .config import config
from .extensions import db, migrate, jwt, cors, bcrypt, limiter
from .utils.logger import setup_logger
from .middleware.error_handler import register_error_handlers


def _seed_initial_data(app):
    """Seed admin, categories and products if tables are empty."""
    try:
        from .models.admin import Admin
        from .models.category import Category
        from .models.product import Product
        from .models.product_image import ProductImage

        # ── Admin account ────────────────────────────────────────────────────
        if not Admin.query.first():
            admin = Admin(
                full_name="PetStore Admin",
                email="petstorehub12@gmail.com",
                password_hash=bcrypt.generate_password_hash("Admin@12345").decode("utf-8"),
                role="admin",
            )
            db.session.add(admin)
            db.session.commit()
            app.logger.info("✅ Admin account created.")

        # ── Categories ───────────────────────────────────────────────────────
        dog_cat = Category.query.filter_by(slug="dogs").first()
        if not dog_cat:
            dog_cat = Category(name="Dogs", slug="dogs", description="Premium pet dogs")
            db.session.add(dog_cat)

        cat_cat = Category.query.filter_by(slug="cats").first()
        if not cat_cat:
            cat_cat = Category(name="Cats", slug="cats", description="Premium pet cats")
            db.session.add(cat_cat)

        toys_cat = Category.query.filter_by(slug="cat-toys").first()
        if not toys_cat:
            toys_cat = Category(name="Cat Toys", slug="cat-toys", description="Fun toys for cats")
            db.session.add(toys_cat)

        db.session.commit()

        # ── Products ─────────────────────────────────────────────────────────
        products = [
            {
                "category": "dogs",
                "slug": "golden-retriever",
                "name": "Golden Retriever Puppy",
                "price": 1200.0,
                "stock": 5,
                "short_description": "Purebred golden retriever puppy",
                "description": "Friendly and playful golden retriever puppy, 8 weeks old, vaccinated.",
                "featured": True,
                "image": "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
            },
            {
                "category": "dogs",
                "slug": "french-bulldog",
                "name": "French Bulldog Puppy",
                "price": 2500.0,
                "stock": 2,
                "short_description": "Adorable French Bulldog",
                "description": "Compact, muscular, and affectionate French Bulldog, 10 weeks old.",
                "featured": True,
                "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80",
            },
            {
                "category": "cats",
                "slug": "british-shorthair",
                "name": "British Shorthair Kitten",
                "price": 800.0,
                "stock": 3,
                "short_description": "Adorable British Shorthair kitten",
                "description": "Cute and cuddly, 10 weeks old, vet checked.",
                "featured": True,
                "image": "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80",
            },
            {
                "category": "cats",
                "slug": "persian-kitten",
                "name": "Persian Kitten",
                "price": 1100.0,
                "stock": 1,
                "short_description": "Fluffy Persian Kitten",
                "description": "Beautiful white Persian kitten, very affectionate.",
                "featured": True,
                "image": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&q=80",
            },
        ]

        cat_map = {
            "dogs": Category.query.filter_by(slug="dogs").first(),
            "cats": Category.query.filter_by(slug="cats").first(),
            "cat-toys": Category.query.filter_by(slug="cat-toys").first(),
        }

        for p in products:
            if not Product.query.filter_by(slug=p["slug"]).first():
                new_product = Product(
                    category_id=cat_map[p["category"]].id,
                    name=p["name"],
                    slug=p["slug"],
                    price=p["price"],
                    stock=p["stock"],
                    short_description=p["short_description"],
                    description=p["description"],
                    featured=p["featured"],
                )
                db.session.add(new_product)
                db.session.commit()
                db.session.add(ProductImage(
                    product_id=new_product.id,
                    image_url=p["image"],
                    display_order=1,
                ))

        db.session.commit()
        app.logger.info("✅ Database seeded successfully.")

    except Exception as e:
        app.logger.error(f"⚠️  Seeding error (non-fatal): {e}")
        db.session.rollback()


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
        origins=app.config["FRONTEND_URLS"],
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

    # ── Auto-create tables + seed data on first startup ──────────────────────
    with app.app_context():
        db.create_all()
        _seed_initial_data(app)

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
