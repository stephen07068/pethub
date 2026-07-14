from flask import Blueprint, request
from ..services.email_service import send_contact_message
from ..utils.response import success, error

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("/", methods=["POST"])
def submit_contact():
    data = request.get_json(silent=True) or {}

    name    = (data.get("name") or "").strip()
    email   = (data.get("email") or "").strip()
    subject = (data.get("subject") or "General Inquiry").strip()
    message = (data.get("message") or "").strip()

    if not name:
        return error("Name is required", 422)
    if not email or "@" not in email:
        return error("A valid email address is required", 422)
    if not message:
        return error("Message cannot be empty", 422)

    sent = send_contact_message(name, email, subject, message)
    if not sent:
        return error("Failed to send message. Please try again later.", 500)

    return success({"sent": True}, "Your message has been sent! We'll be in touch shortly.", 200)
