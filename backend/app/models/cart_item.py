from ..extensions import db


class CartItem(db.Model):
    __tablename__ = "cart_items"

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey("carts.id"), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product")

    def to_dict(self):
        p = self.product
        unit_price = float(p.price) if p else 0.0
        return {
            "id": self.id,
            "product_id": self.product_id,
            "name": p.name if p else "",
            "slug": p.slug if p else "",
            "image": p.primary_image() if p else "",
            "unit_price": unit_price,
            "quantity": self.quantity,
            "line_total": round(unit_price * self.quantity, 2),
            "stock": p.stock if p else 0,
        }
