import os
from flask import Blueprint, current_app, send_from_directory
from ..utils.response import error

uploads_bp = Blueprint("uploads", __name__)


@uploads_bp.route("/<filename>")
def serve_upload(filename):
    """Serve locally uploaded files if Cloudinary is not used."""
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_dir, filename)
    if not os.path.exists(filepath):
        return error("File not found", 404)
    return send_from_directory(upload_dir, filename)
