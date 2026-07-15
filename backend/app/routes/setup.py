from flask import Blueprint, request
from ..extensions import db, bcrypt
from ..models.admin import Admin
from ..utils.response import success, error
import os

setup_bp = Blueprint("setup", __name__)

@setup_bp.route("/init-admin", methods=["POST"])
def init_admin():
    """One-time admin setup endpoint. Protected by a setup key."""
    # Must provide the secret setup key to use this endpoint
    setup_key = request.get_json(silent=True, force=True) or {}
    provided_key = setup_key.get("setup_key", "")
    expected_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")

    if provided_key != expected_key:
        return error("Forbidden", 403)

    # Delete existing admin and recreate
    Admin.query.delete()
    db.session.commit()

    admin = Admin(
        full_name="PetStore Admin",
        email="petstorehub12@gmail.com",
        password_hash=bcrypt.generate_password_hash("Admin@12345").decode("utf-8"),
        role="admin",
    )
    db.session.add(admin)
    db.session.commit()
    return success({"email": "petstorehub12@gmail.com", "password": "Admin@12345"}, "Admin created successfully")
