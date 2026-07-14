from flask import current_app
from flask_jwt_extended import create_access_token
from ..extensions import db, bcrypt
from ..models.admin import Admin


class AuthService:

    @staticmethod
    def login(email: str, password: str):
        """Validate credentials and return JWT token."""
        admin = Admin.query.filter_by(email=email.lower().strip()).first()
        if not admin:
            return None, "Invalid email or password"
        if not bcrypt.check_password_hash(admin.password_hash, password):
            return None, "Invalid email or password"
        token = create_access_token(identity=str(admin.id))
        current_app.logger.info(f"Admin login: {admin.email}")
        return {"token": token, "admin": admin.to_dict()}, None

    @staticmethod
    def create_admin(full_name: str, email: str, password: str, role="admin"):
        """Create a new admin account."""
        if Admin.query.filter_by(email=email.lower()).first():
            return None, "Email already registered"
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        admin = Admin(
            full_name=full_name,
            email=email.lower().strip(),
            password_hash=hashed,
            role=role,
        )
        db.session.add(admin)
        db.session.commit()
        return admin, None
