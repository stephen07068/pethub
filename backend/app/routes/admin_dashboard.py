from flask import Blueprint
from ..services.admin_dashboard_service import AdminDashboardService
from ..middleware.auth_middleware import admin_required
from ..utils.response import success, error

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)

@admin_dashboard_bp.route("/", methods=["GET"])
@admin_required
def get_dashboard():
    data, err = AdminDashboardService.get_summary()
    if err:
        return error(err, 500)
    return success(data)
