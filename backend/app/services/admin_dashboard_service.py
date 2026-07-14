from sqlalchemy import func
from ..extensions import db
from ..models.order import Order
from ..models.product import Product
from ..models.category import Category
from ..models.payment import Payment
from ..models.settings import Settings

class AdminDashboardService:
    @staticmethod
    def get_summary():
        total_orders = db.session.query(func.count(Order.id)).scalar()
        total_sales = db.session.query(func.sum(Order.total_amount)).filter(Order.payment_status == 'paid').scalar() or 0.0
        total_products = db.session.query(func.count(Product.id)).scalar()
        total_categories = db.session.query(func.count(Category.id)).scalar()
        
        pending_orders = db.session.query(func.count(Order.id)).filter(Order.status == 'pending').scalar()
        processing_orders = db.session.query(func.count(Order.id)).filter(Order.status == 'processing').scalar()
        shipped_orders = db.session.query(func.count(Order.id)).filter(Order.status == 'shipped').scalar()
        delivered_orders = db.session.query(func.count(Order.id)).filter(Order.status == 'delivered').scalar()
        cancelled_orders = db.session.query(func.count(Order.id)).filter(Order.status == 'cancelled').scalar()

        settings = Settings.query.first()
        low_stock_threshold = settings.low_stock_threshold if settings else 5
        
        low_stock_products = db.session.query(func.count(Product.id)).filter(Product.stock <= low_stock_threshold).scalar()
        
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
        recent_payments = Payment.query.order_by(Payment.created_at.desc()).limit(5).all()

        return {
            "totals": {
                "orders": total_orders,
                "sales": float(total_sales),
                "products": total_products,
                "categories": total_categories,
                "revenue": float(total_sales) # Assuming sales == revenue here
            },
            "order_status_counts": {
                "pending": pending_orders,
                "processing": processing_orders,
                "shipped": shipped_orders,
                "delivered": delivered_orders,
                "cancelled": cancelled_orders
            },
            "low_stock_count": low_stock_products,
            "recent_orders": [o.to_dict(include_items=False) for o in recent_orders],
            "recent_payments": [p.to_dict() for p in recent_payments]
        }, None
