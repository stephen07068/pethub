from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..utils.response import error
from ..models.admin import Admin


def admin_required(fn):
    """Decorator: requires a valid JWT token belonging to an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            admin_id = get_jwt_identity()
            # identity is stored as string; convert to int for DB lookup
            admin = Admin.query.get(int(admin_id))
            if not admin:
                return error("Admin not found", 401)
            return fn(*args, **kwargs)
        except Exception as e:
            return error(str(e), 401)
    return wrapper
