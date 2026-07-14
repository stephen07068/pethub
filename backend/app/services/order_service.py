from flask import current_app
from ..extensions import db
from ..models.order import Order, generate_order_number
from ..models.order_item import OrderItem
from ..models.payment import Payment
from ..models.product import Product
from ..services.cart_service import CartService
from ..services.wallet_service import get_wallet_address
from ..services.notification_service import NotificationService


class OrderService:

    @staticmethod
    def create_order(cart_token: str, address: dict, payment_method: str,
                     payment_reference: str = None, currency: str = "USD"):
        """
        Create an order from a validated cart.
        - Recalculates all prices server-side.
        - Deducts stock.
        - Creates payment record.
        - Clears the cart.
        """
        # 1. Re-validate cart
        validated, errors = CartService.validate_cart(cart_token)
        if errors:
            return None, errors if isinstance(errors, str) else "; ".join(errors)

        # 2. Build order
        order = Order(
            order_number=generate_order_number(),
            customer_name=address["full_name"],
            customer_email=address["email"],
            customer_phone=address["phone"],
            country=address["country"],
            state=address["state"],
            city=address["city"],
            street_address=address["street_address"],
            apartment=address.get("apartment"),
            postal_code=address["postal_code"],
            delivery_notes=address.get("delivery_notes"),
            subtotal=validated["subtotal"],
            shipping_fee=validated["shipping_fee"],
            total_amount=validated["grand_total"],
            payment_method=payment_method,
            payment_status="paid",
            status="processing",
        )
        db.session.add(order)
        db.session.flush()  # get order.id before commit

        # 3. Create order items + deduct stock
        coin_network_map = {
            "btc": "Bitcoin", "eth": "ERC20", "usdt_trc20": "TRC20",
            "usdt_bep20": "BEP20", "sol": "Solana",
        }
        for item in validated["items"]:
            oi = OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                product_name=item["name"],
                product_sku=item.get("sku"),
                unit_price=item["unit_price"],
                quantity=item["quantity"],
                line_total=item["line_total"],
            )
            db.session.add(oi)

            # Deduct stock
            product = Product.query.get(item["product_id"])
            if product:
                product.stock = max(0, product.stock - item["quantity"])

        # 4. Payment record
        address, _ = get_wallet_address(payment_method) if payment_method in coin_network_map else (None, None)

        payment = Payment(
            order_id=order.id,
            payment_method=payment_method,
            currency=currency,
            amount=validated["grand_total"],
            tx_reference=payment_reference,
            wallet_network=coin_network_map.get(payment_method),
            wallet_address=address,
            status="pending",
        )
        db.session.add(payment)

        db.session.commit()
        current_app.logger.info(
            f"Payment recorded: order={order.order_number} method={payment_method} "
            f"amount={validated['grand_total']} currency={currency}"
        )

        # 5. Clear cart
        CartService.clear_cart(cart_token)

        current_app.logger.info(f"Order created: {order.order_number}")
        
        # 6. Notifications
        NotificationService.send_order_confirmation(order)
        NotificationService.send_admin_new_order_alert(order)
        
        return order.to_dict(), None

    @staticmethod
    def get_all(page=1, per_page=20, status=None, search=None, 
                date_from=None, date_to=None, payment_method=None, payment_status=None, sort="date_desc"):
        from ..utils.pagination import paginate_query
        from datetime import datetime
        query = Order.query
        
        if status:
            query = query.filter_by(status=status)
        if payment_method:
            query = query.filter_by(payment_method=payment_method)
        if payment_status:
            query = query.filter_by(payment_status=payment_status)
            
        if date_from:
            try:
                dt = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
                query = query.filter(Order.created_at >= dt)
            except ValueError:
                pass
        if date_to:
            try:
                dt = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
                query = query.filter(Order.created_at <= dt)
            except ValueError:
                pass

        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Order.order_number.ilike(term),
                    Order.customer_name.ilike(term),
                    Order.customer_email.ilike(term),
                )
            )
            
        sort_map = {
            "date_desc": Order.created_at.desc(),
            "date_asc": Order.created_at.asc(),
            "amount_desc": Order.total_amount.desc(),
            "amount_asc": Order.total_amount.asc(),
        }
        query = query.order_by(sort_map.get(sort, Order.created_at.desc()))
        
        items, meta = paginate_query(query, page, per_page)
        return [o.to_dict(include_items=False) for o in items], meta

    @staticmethod
    def get_by_order_number(order_number: str):
        order = Order.query.filter_by(order_number=order_number).first()
        if not order:
            return None, "Order not found"
        return order.to_dict(), None

    @staticmethod
    def update_status(order_id: int, status: str):
        valid = {"pending", "paid", "processing", "shipped", "delivered", "cancelled"}
        if status not in valid:
            return None, f"Invalid status. Must be one of: {', '.join(valid)}"
        order = Order.query.get(order_id)
        if not order:
            return None, "Order not found"
        order.status = status
        db.session.commit()
        current_app.logger.info(f"Order status updated: order_id={order_id} new_status={status}")
        
        # Status notifications
        if status == "shipped":
            NotificationService.send_shipping_update(order)
        elif status == "delivered":
            NotificationService.send_delivery_confirmation(order)
            
        return order.to_dict(include_items=False), None
