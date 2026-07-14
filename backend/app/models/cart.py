import uuid
from datetime import datetime, timezone
from ..extensions import db


class Cart(db.Model):
    """Guest shopping cart keyed by a client-side token (UUID)."""
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, nullable=False, index=True,
                      default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    items = db.relationship("CartItem", back_populates="cart",
                            cascade="all, delete-orphan", lazy="dynamic")

    def to_dict(self, settings_shipping_fee=20.0):
        item_list = [i.to_dict() for i in self.items]
        subtotal = sum(i["line_total"] for i in item_list)
        shipping = float(settings_shipping_fee)
        return {
            "token": self.token,
            "items": item_list,
            "subtotal": round(subtotal, 2),
            "shipping_fee": shipping,
            "grand_total": round(subtotal + shipping, 2),
        }
