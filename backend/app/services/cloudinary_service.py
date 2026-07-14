import os
import uuid
from flask import current_app


def _cloudinary_available():
    return bool(
        current_app.config.get("CLOUDINARY_CLOUD_NAME") and
        current_app.config.get("CLOUDINARY_API_KEY") and
        current_app.config.get("CLOUDINARY_API_SECRET")
    )


def upload_image(file_storage, folder="petstorehub/products"):
    """Upload image. Uses Cloudinary if configured, else saves locally."""
    if _cloudinary_available():
        return _upload_cloudinary(file_storage, folder)
    return _save_locally(file_storage)


def _upload_cloudinary(file_storage, folder):
    import cloudinary.uploader
    import cloudinary

    cloudinary.config(
        cloud_name=current_app.config["CLOUDINARY_CLOUD_NAME"],
        api_key=current_app.config["CLOUDINARY_API_KEY"],
        api_secret=current_app.config["CLOUDINARY_API_SECRET"],
        secure=True,
    )
    result = cloudinary.uploader.upload(
        file_storage,
        folder=folder,
        allowed_formats=["jpg", "jpeg", "png", "webp"],
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return result.get("secure_url"), None


def _save_locally(file_storage):
    """Fallback: save file to uploads directory and return URL."""
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    ext = os.path.splitext(file_storage.filename)[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(upload_dir, filename)
    file_storage.save(filepath)
    url = f"/api/uploads/{filename}"
    return url, None


def delete_image(public_id: str):
    """Delete image from Cloudinary."""
    if _cloudinary_available():
        import cloudinary.uploader
        cloudinary.uploader.destroy(public_id)
