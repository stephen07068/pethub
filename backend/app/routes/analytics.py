from flask import Blueprint, request
from ..services.analytics_service import AnalyticsService
from ..middleware.auth_middleware import admin_required
from ..utils.response import success, error

analytics_bp = Blueprint("analytics", __name__)


# ── Daily sales ───────────────────────────────────────────────────────────────
@analytics_bp.route("/sales", methods=["GET"])
@admin_required
def get_sales():
    days = request.args.get("days", 30, type=int)
    data, err = AnalyticsService.get_sales_data(days=days)
    if err:
        return error(err, 500)
    return success(data)


# ── Weekly sales ──────────────────────────────────────────────────────────────
@analytics_bp.route("/sales/weekly", methods=["GET"])
@admin_required
def get_weekly_sales():
    weeks = request.args.get("weeks", 12, type=int)
    data, err = AnalyticsService.get_weekly_sales(weeks=weeks)
    if err:
        return error(err, 500)
    return success(data)


# ── Monthly sales ─────────────────────────────────────────────────────────────
@analytics_bp.route("/sales/monthly", methods=["GET"])
@admin_required
def get_monthly_sales():
    months = request.args.get("months", 12, type=int)
    data, err = AnalyticsService.get_monthly_sales(months=months)
    if err:
        return error(err, 500)
    return success(data)


# ── Yearly sales ──────────────────────────────────────────────────────────────
@analytics_bp.route("/sales/yearly", methods=["GET"])
@admin_required
def get_yearly_sales():
    data, err = AnalyticsService.get_yearly_sales()
    if err:
        return error(err, 500)
    return success(data)


# ── Best sellers ──────────────────────────────────────────────────────────────
@analytics_bp.route("/best-sellers", methods=["GET"])
@admin_required
def get_best_sellers():
    limit = request.args.get("limit", 5, type=int)
    data, err = AnalyticsService.get_best_sellers(limit=limit)
    if err:
        return error(err, 500)
    return success(data)


# ── Most popular categories ───────────────────────────────────────────────────
@analytics_bp.route("/popular-categories", methods=["GET"])
@admin_required
def get_popular_categories():
    limit = request.args.get("limit", 5, type=int)
    data, err = AnalyticsService.get_popular_categories(limit=limit)
    if err:
        return error(err, 500)
    return success(data)


# ── Revenue by category ───────────────────────────────────────────────────────
@analytics_bp.route("/revenue-by-category", methods=["GET"])
@admin_required
def get_revenue_by_category():
    data, err = AnalyticsService.get_revenue_by_category()
    if err:
        return error(err, 500)
    return success(data)


# ── Revenue by month ──────────────────────────────────────────────────────────
@analytics_bp.route("/revenue-by-month", methods=["GET"])
@admin_required
def get_revenue_by_month():
    months = request.args.get("months", 12, type=int)
    data, err = AnalyticsService.get_revenue_by_month(months=months)
    if err:
        return error(err, 500)
    return success(data)


# ── Payment method distribution ───────────────────────────────────────────────
@analytics_bp.route("/payment-methods", methods=["GET"])
@admin_required
def get_payment_methods():
    data, err = AnalyticsService.get_payment_method_distribution()
    if err:
        return error(err, 500)
    return success(data)


# ── Average Order Value ───────────────────────────────────────────────────────
@analytics_bp.route("/aov", methods=["GET"])
@admin_required
def get_aov():
    days = request.args.get("days", 30, type=int)
    data, err = AnalyticsService.get_average_order_value(days=days)
    if err:
        return error(err, 500)
    return success(data)
