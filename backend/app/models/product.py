from datetime import datetime, timezone
from ..extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    short_description = db.Column(db.String(500), default="")
    description = db.Column(db.Text, default="")
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0, nullable=False)
    sku = db.Column(db.String(100), unique=True, nullable=True)
    brand = db.Column(db.String(150), default="")
    features = db.Column(db.Text, default="")  # JSON list stored as text
    featured = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default="active")  # active | draft
    stock_updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    category = db.relationship("Category", back_populates="products")
    images = db.relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.display_order",
    )

    def primary_image(self):
        if self.images:
            return self.images[0].image_url
        return ""

    def to_dict(self, include_category=False):
        data = {
            "id": self.id,
            "category_id": self.category_id,
            "name": self.name,
            "slug": self.slug,
            "short_description": self.short_description,
            "description": self.description,
            "price": float(self.price),
            "stock": self.stock,
            "sku": self.sku,
            "brand": self.brand or "",
            "features": [f.strip() for f in (self.features or "").split(',') if f.strip()],
            "featured": self.featured,
            "status": self.status,
            "image": self.primary_image(),
            "images": [img.to_dict() for img in self.images],
            "stock_updated_at": self.stock_updated_at.isoformat() if self.stock_updated_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_category and self.category:
            data["category"] = self.category.to_dict()
        return data
