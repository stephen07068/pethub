from datetime import datetime, timezone
from ..extensions import db


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False, unique=True)
    payment_method = db.Column(db.String(50), nullable=False)   # btc / eth / usdt_trc20 / apple_pay / google_pay / gift_card
    currency = db.Column(db.String(20), nullable=True)          # USD / BTC / ETH / SOL …
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    tx_reference = db.Column(db.String(256), nullable=True)     # TX hash / Apple Pay token / gift card code
    wallet_network = db.Column(db.String(50), nullable=True)    # Bitcoin / ERC20 / TRC20 / BEP20 / Solana
    wallet_address = db.Column(db.String(256), nullable=True)   # Destination wallet address
    status = db.Column(db.String(20), default="pending")         # pending / verified / failed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    order = db.relationship("Order", back_populates="payment")

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "payment_method": self.payment_method,
            "currency": self.currency,
            "amount": float(self.amount),
            "tx_reference": self.tx_reference,
            "wallet_network": self.wallet_network,
            "wallet_address": self.wallet_address,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
