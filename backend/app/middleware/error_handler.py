from flask import jsonify
from flask_jwt_extended.exceptions import NoAuthorizationError, InvalidHeaderError


class APIError(Exception):
    """Custom API Error"""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['success'] = False
        rv['message'] = self.message
        return rv


def register_error_handlers(app):
    """Register centralized error handlers."""

    @app.errorhandler(APIError)
    def handle_api_error(e):
        return jsonify(e.to_dict()), e.status_code

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad request", "error": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"success": False, "message": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"success": False, "message": "Unprocessable entity"}), 422

    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({"success": False, "message": "Rate limit exceeded"}), 429

    @app.errorhandler(500)
    def server_error(e):
        app.logger.error(f"Server error: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

    @app.errorhandler(NoAuthorizationError)
    def handle_no_auth(e):
        return jsonify({"success": False, "message": "Missing authorization token"}), 401

    @app.errorhandler(InvalidHeaderError)
    def handle_invalid_header(e):
        return jsonify({"success": False, "message": "Invalid authorization header"}), 401
