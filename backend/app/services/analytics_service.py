from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from ..extensions import db
from ..models.order import Order
from ..models.order_item import OrderItem
from ..models.product import Product
from ..models.category import Category
from ..models.payment import Payment


class AnalyticsService:

    # ── Internal helper ───────────────────────────────────────────────────────
    @staticmethod
    def _paid_orders_since(cutoff):
        return Order.query.filter(
            Order.created_at >= cutoff,
            Order.payment_status == "paid"
        ).all()

    # ── Sales by period ───────────────────────────────────────────────────────
    @staticmethod
    def get_sales_data(days=30):
        """Daily sales chart for the last `days` days."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        orders = AnalyticsService._paid_orders_since(cutoff)

        sales_by_date = {}
        for o in orders:
            key = o.created_at.strftime("%Y-%m-%d")
            sales_by_date[key] = sales_by_date.get(key, 0.0) + float(o.total_amount)

        chart_data = [{"date": k, "sales": v} for k, v in sorted(sales_by_date.items())]
        total = sum(sales_by_date.values())
        aov = total / len(orders) if orders else 0.0

        return {
            "period": "daily",
            "days": days,
            "chart_data": chart_data,
            "total_sales": round(total, 2),
            "total_orders": len(orders),
            "average_order_value": round(aov, 2),
        }, None

    @staticmethod
    def get_weekly_sales(weeks=12):
        """Weekly sales chart for the last `weeks` weeks."""
        cutoff = datetime.now(timezone.utc) - timedelta(weeks=weeks)
        orders = AnalyticsService._paid_orders_since(cutoff)

        sales_by_week = {}
        for o in orders:
            # ISO week: e.g. "2026-W27"
            key = o.created_at.strftime("%G-W%V")
            sales_by_week[key] = sales_by_week.get(key, 0.0) + float(o.total_amount)

        chart_data = [{"week": k, "sales": v} for k, v in sorted(sales_by_week.items())]
        total = sum(sales_by_week.values())
        aov = total / len(orders) if orders else 0.0

        return {
            "period": "weekly",
            "weeks": weeks,
            "chart_data": chart_data,
            "total_sales": round(total, 2),
            "total_orders": len(orders),
            "average_order_value": round(aov, 2),
        }, None

    @staticmethod
    def get_monthly_sales(months=12):
        """Monthly sales chart for the last `months` months."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)
        orders = AnalyticsService._paid_orders_since(cutoff)

        sales_by_month = {}
        for o in orders:
            key = o.created_at.strftime("%Y-%m")
            sales_by_month[key] = sales_by_month.get(key, 0.0) + float(o.total_amount)

        chart_data = [{"month": k, "sales": v} for k, v in sorted(sales_by_month.items())]
        total = sum(sales_by_month.values())
        aov = total / len(orders) if orders else 0.0

        return {
            "period": "monthly",
            "months": months,
            "chart_data": chart_data,
            "total_sales": round(total, 2),
            "total_orders": len(orders),
            "average_order_value": round(aov, 2),
        }, None

    @staticmethod
    def get_yearly_sales():
        """Yearly sales chart — all time, grouped by year."""
        orders = Order.query.filter(Order.payment_status == "paid").all()

        sales_by_year = {}
        for o in orders:
            key = o.created_at.strftime("%Y")
            sales_by_year[key] = sales_by_year.get(key, 0.0) + float(o.total_amount)

        chart_data = [{"year": k, "sales": v} for k, v in sorted(sales_by_year.items())]
        total = sum(sales_by_year.values())

        return {
            "period": "yearly",
            "chart_data": chart_data,
            "total_sales": round(total, 2),
            "total_orders": len(orders),
        }, None

    # ── Best sellers ──────────────────────────────────────────────────────────
    @staticmethod
    def get_best_sellers(limit=5):
        results = db.session.query(
            Product.id,
            Product.name,
            Product.price,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.line_total).label("total_revenue"),
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .group_by(Product.id)\
         .order_by(func.sum(OrderItem.quantity).desc())\
         .limit(limit).all()

        return [
            {
                "product_id": r.id,
                "product": r.name,
                "price": float(r.price),
                "total_sold": int(r.total_sold),
                "total_revenue": round(float(r.total_revenue), 2),
            }
            for r in results
        ], None

    # ── Most popular categories (by # orders) ─────────────────────────────────
    @staticmethod
    def get_popular_categories(limit=5):
        results = db.session.query(
            Category.id,
            Category.name,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.count(func.distinct(OrderItem.order_id)).label("order_count"),
        ).join(Product, OrderItem.product_id == Product.id)\
         .join(Category, Product.category_id == Category.id)\
         .group_by(Category.id)\
         .order_by(func.count(func.distinct(OrderItem.order_id)).desc())\
         .limit(limit).all()

        return [
            {
                "category_id": r.id,
                "category": r.name,
                "units_sold": int(r.units_sold),
                "order_count": int(r.order_count),
            }
            for r in results
        ], None

    # ── Revenue by category ───────────────────────────────────────────────────
    @staticmethod
    def get_revenue_by_category():
        results = db.session.query(
            Category.id,
            Category.name,
            func.sum(OrderItem.line_total).label("revenue"),
            func.sum(OrderItem.quantity).label("units_sold"),
        ).join(Product, OrderItem.product_id == Product.id)\
         .join(Category, Product.category_id == Category.id)\
         .group_by(Category.id)\
         .order_by(func.sum(OrderItem.line_total).desc())\
         .all()

        return [
            {
                "category_id": r.id,
                "category": r.name,
                "revenue": round(float(r.revenue), 2),
                "units_sold": int(r.units_sold),
            }
            for r in results
        ], None

    # ── Revenue by month ──────────────────────────────────────────────────────
    @staticmethod
    def get_revenue_by_month(months=12):
        cutoff = datetime.now(timezone.utc) - timedelta(days=months * 30)
        orders = Order.query.filter(
            Order.created_at >= cutoff,
            Order.payment_status == "paid"
        ).all()

        revenue_by_month = {}
        order_count_by_month = {}
        for o in orders:
            key = o.created_at.strftime("%Y-%m")
            revenue_by_month[key] = revenue_by_month.get(key, 0.0) + float(o.total_amount)
            order_count_by_month[key] = order_count_by_month.get(key, 0) + 1

        chart_data = [
            {
                "month": k,
                "revenue": round(revenue_by_month[k], 2),
                "orders": order_count_by_month[k],
            }
            for k in sorted(revenue_by_month.keys())
        ]

        return {
            "months": months,
            "chart_data": chart_data,
            "total_revenue": round(sum(revenue_by_month.values()), 2),
        }, None

    # ── Payment method distribution ───────────────────────────────────────────
    @staticmethod
    def get_payment_method_distribution():
        results = db.session.query(
            Payment.payment_method,
            func.count(Payment.id).label("count"),
            func.sum(Payment.amount).label("total"),
        ).filter(Payment.status == "confirmed")\
         .group_by(Payment.payment_method)\
         .all()

        # Also get all-time regardless of status for broader picture
        all_results = db.session.query(
            Payment.payment_method,
            func.count(Payment.id).label("count"),
            func.sum(Payment.amount).label("total"),
        ).group_by(Payment.payment_method).all()

        return [
            {
                "method": r.payment_method,
                "count": int(r.count),
                "total": round(float(r.total or 0), 2),
            }
            for r in all_results
        ], None

    # ── Average Order Value ───────────────────────────────────────────────────
    @staticmethod
    def get_average_order_value(days=30):
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        orders = AnalyticsService._paid_orders_since(cutoff)
        total = sum(float(o.total_amount) for o in orders)
        aov = total / len(orders) if orders else 0.0
        return {
            "days": days,
            "total_orders": len(orders),
            "total_revenue": round(total, 2),
            "average_order_value": round(aov, 2),
        }, None
