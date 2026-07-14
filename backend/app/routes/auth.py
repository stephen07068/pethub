from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from ..services.auth_service import AuthService
from ..utils.response import success, error
from ..extensions import limiter
from ..validators.validators import validate_login
from ..middleware.auth_middleware import admin_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True) or {}
    errs = validate_login(data)
    if errs:
        return error("Validation failed", 422, errs)
    result, err = AuthService.login(data["email"], data["password"])
    if err:
        return error(err, 401)
    return success(result, "Login successful")


@auth_bp.route("/me", methods=["GET"])
@admin_required
def me():
    from ..models.admin import Admin
    admin_id = get_jwt_identity()
    admin = Admin.query.get(admin_id)
    return success(admin.to_dict())


@auth_bp.route("/logout", methods=["POST"])
@admin_required
def logout():
    # JWT is stateless; client drops the token.
    # For Phase 2, add token blocklist via Redis.
    return success(message="Logged out successfully")
