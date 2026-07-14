from datetime import datetime, timezone
from ..extensions import db


class GiftCardSubmission(db.Model):
    __tablename__ = "gift_card_submissions"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    code = db.Column(db.String(200), nullable=True)  # Legacy/single submission
    image_url = db.Column(db.Text, nullable=True)
    cards_data = db.Column(db.JSON, nullable=True)   # New: list of card objects [{type, code, image_url, amount}]
    batch_total_amount = db.Column(db.Float, nullable=True) # Total amount of all cards in batch
    customer_name = db.Column(db.String(200), nullable=True)
    customer_email = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default="pending")  # pending / approved / rejected
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = db.Column(db.DateTime, nullable=True)
    review_notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "code": self.code,
            "image_url": self.image_url,
            "cards_data": self.cards_data or [],
            "batch_total_amount": self.batch_total_amount,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "status": self.status,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "review_notes": self.review_notes,
        }
