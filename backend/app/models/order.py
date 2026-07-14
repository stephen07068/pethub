import random, string
from datetime import datetime, timezone
from ..extensions import db


def generate_order_number():
    """Generate human-readable order number: PSH-YYYYMMDD-XXXX"""
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"PSH-{date_part}-{rand_part}"


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(30), unique=True, nullable=False, index=True,
                             default=generate_order_number)

    # Customer details (guest — no account)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(50), nullable=False)

    # Shipping address
    country = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    street_address = db.Column(db.Text, nullable=False)
    apartment = db.Column(db.String(200), nullable=True)
    postal_code = db.Column(db.String(20), nullable=False)
    delivery_notes = db.Column(db.Text, nullable=True)

    # Financials — always server-calculated
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_fee = db.Column(db.Numeric(10, 2), nullable=False, default=20.00)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)

    # Payment
    payment_method = db.Column(db.String(50), nullable=False)   # btc / eth / apple_pay / gift_card …
    payment_status = db.Column(db.String(20), default="pending") # pending / paid / failed

    # Order lifecycle
    status = db.Column(db.String(20), default="pending")         # pending / paid / processing / shipped / delivered / cancelled

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    items = db.relationship("OrderItem", back_populates="order",
                            cascade="all, delete-orphan")
    payment = db.relationship("Payment", back_populates="order",
                              uselist=False, cascade="all, delete-orphan")

    def to_dict(self, include_items=True):
        data = {
            "id": self.id,
            "order_number": self.order_number,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "customer_phone": self.customer_phone,
            "shipping_address": {
                "country": self.country,
                "state": self.state,
                "city": self.city,
                "street_address": self.street_address,
                "apartment": self.apartment,
                "postal_code": self.postal_code,
                "delivery_notes": self.delivery_notes,
            },
            "subtotal": float(self.subtotal),
            "shipping_fee": float(self.shipping_fee),
            "total_amount": float(self.total_amount),
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_items:
            data["items"] = [i.to_dict() for i in self.items]
        if self.payment:
            data["payment"] = self.payment.to_dict()
        return data
