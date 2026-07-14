from flask import Blueprint, request
from ..services.settings_service import SettingsService
from ..middleware.auth_middleware import admin_required
from ..validators.validators import validate_settings
from ..utils.response import success, error

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/", methods=["GET"])
def get_settings():
    return success(SettingsService.get())


@settings_bp.route("/", methods=["PUT"])
@admin_required
def update_settings():
    data = request.get_json(silent=True) or {}
    errs = validate_settings(data)
    if errs:
        return error("Validation failed", 422, errs)
    settings = SettingsService.update(data)
    return success(settings, "Settings updated")
