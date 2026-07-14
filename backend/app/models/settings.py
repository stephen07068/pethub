from datetime import datetime, timezone
from ..extensions import db


class Settings(db.Model):
    __tablename__ = "settings"

    id = db.Column(db.Integer, primary_key=True, default=1)
    store_name = db.Column(db.String(200), default="PetStore Hub")
    shipping_fee = db.Column(db.Numeric(10, 2), default=20.00)
    support_email = db.Column(db.String(200), default="concierge@petstorehub.com")
    support_phone = db.Column(db.String(50), default="+1 (800) 555-0199")
    business_address = db.Column(db.Text, default="123 Design District, New York, NY 10001")
    currency = db.Column(db.String(10), default="USD")
    low_stock_threshold = db.Column(db.Integer, default=5)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "store_name": self.store_name,
            "shipping_fee": float(self.shipping_fee),
            "support_email": self.support_email,
            "support_phone": self.support_phone,
            "business_address": self.business_address,
            "currency": self.currency,
            "low_stock_threshold": self.low_stock_threshold,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
