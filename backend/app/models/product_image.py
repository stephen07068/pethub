from ..extensions import db


class ProductImage(db.Model):
    __tablename__ = "product_images"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False, index=True)
    image_url = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0)

    product = db.relationship("Product", back_populates="images")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "image_url": self.image_url,
            "display_order": self.display_order,
        }
