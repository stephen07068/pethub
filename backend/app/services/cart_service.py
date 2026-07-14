import uuid
from flask import current_app
from ..extensions import db
from ..models.cart import Cart
from ..models.cart_item import CartItem
from ..models.product import Product
from ..models.settings import Settings


class CartService:

    @staticmethod
    def _get_shipping_fee():
        s = Settings.query.get(1)
        return float(s.shipping_fee) if s else 20.0

    @staticmethod
    def get_or_create(token: str | None):
        """Return existing cart by token or create a new one."""
        if token:
            cart = Cart.query.filter_by(token=token).first()
            if cart:
                return cart, None
        cart = Cart(token=str(uuid.uuid4()))
        db.session.add(cart)
        db.session.commit()
        return cart, None

    @staticmethod
    def get_cart(token: str):
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, "Cart not found"
        fee = CartService._get_shipping_fee()
        return cart.to_dict(settings_shipping_fee=fee), None

    @staticmethod
    def add_item(token: str, product_id: int, quantity: int):
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, "Cart not found"

        if quantity < 1:
            return None, "Quantity must be at least 1"

        product = Product.query.get(product_id)
        if not product:
            return None, "Product not found"
        if product.status != "active":
            return None, "Product is not available"

        existing = CartItem.query.filter_by(
            cart_id=cart.id, product_id=product_id
        ).first()
        new_qty = (existing.quantity if existing else 0) + quantity

        if product.stock < new_qty:
            return None, f"Only {product.stock} unit(s) in stock"

        if existing:
            existing.quantity = new_qty
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(item)

        db.session.commit()
        fee = CartService._get_shipping_fee()
        return cart.to_dict(settings_shipping_fee=fee), None

    @staticmethod
    def update_item(token: str, item_id: int, quantity: int):
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, "Cart not found"

        item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not item:
            return None, "Item not found in cart"

        if quantity < 1:
            db.session.delete(item)
        else:
            product = Product.query.get(item.product_id)
            if product and product.stock < quantity:
                return None, f"Only {product.stock} unit(s) in stock"
            item.quantity = quantity

        db.session.commit()
        fee = CartService._get_shipping_fee()
        return cart.to_dict(settings_shipping_fee=fee), None

    @staticmethod
    def remove_item(token: str, item_id: int):
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, "Cart not found"

        item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not item:
            return None, "Item not found in cart"

        db.session.delete(item)
        db.session.commit()
        fee = CartService._get_shipping_fee()
        return cart.to_dict(settings_shipping_fee=fee), None

    @staticmethod
    def clear_cart(token: str):
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, "Cart not found"
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        fee = CartService._get_shipping_fee()
        return cart.to_dict(settings_shipping_fee=fee), None

    @staticmethod
    def validate_cart(token: str):
        """
        Validate all cart items: active, in stock, correct prices.
        Returns validated summary or list of errors.
        """
        cart = Cart.query.filter_by(token=token).first()
        if not cart:
            return None, ["Cart not found"]

        items = list(cart.items)
        if not items:
            return None, ["Cart is empty"]

        errors = []
        validated_items = []
        subtotal = 0.0

        for item in items:
            product = Product.query.get(item.product_id)
            if not product:
                errors.append(f"Product ID {item.product_id} no longer exists")
                continue
            if product.status != "active":
                errors.append(f"'{product.name}' is no longer available")
                continue
            if product.stock < item.quantity:
                errors.append(
                    f"'{product.name}' only has {product.stock} unit(s) in stock"
                )
                continue
            unit_price = float(product.price)
            line_total = round(unit_price * item.quantity, 2)
            subtotal += line_total
            validated_items.append({
                "product_id": product.id,
                "name": product.name,
                "sku": product.sku,
                "unit_price": unit_price,
                "quantity": item.quantity,
                "line_total": line_total,
                "image": product.primary_image(),
            })

        if errors:
            return None, errors

        fee = CartService._get_shipping_fee()
        return {
            "cart_token": token,
            "items": validated_items,
            "subtotal": round(subtotal, 2),
            "shipping_fee": fee,
            "grand_total": round(subtotal + fee, 2),
            "item_count": sum(i["quantity"] for i in validated_items),
        }, None
