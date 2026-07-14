"""
PetStore Hub — Premium Email Service (Brevo / Sendinblue)
Sends branded transactional emails via the Brevo REST API.
"""
import os
import requests
from flask import current_app


BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

ADMIN_EMAIL   = os.getenv("ADMIN_EMAIL",   "petstorehub12@gmail.com")
STORE_NAME    = "PetStore Hub"
STORE_EMAIL   = os.getenv("ADMIN_EMAIL",   "petstorehub12@gmail.com")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
STORE_URL     = os.getenv("FRONTEND_URL",  "http://localhost:5173")

# Premium lifestyle banner images (Using Wikimedia so Gmail doesn't block it)
HERO_BANNER_GENERAL = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/960px-Huskiesatrest.jpg"
HERO_BANNER_CAT     = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Kittyply_edit1.jpg/960px-Kittyply_edit1.jpg"


# ─── UI System Colors ─────────────────────────────────────────────────────────
COLOR_PRIMARY    = "#006e2f"
COLOR_PRIMARY_LT = "#22c55e"
COLOR_BG         = "#F8FAFC"
COLOR_SURFACE    = "#ffffff"
COLOR_TEXT_DARK  = "#121c2a"
COLOR_TEXT_MUTED = "#5d5f5f"
COLOR_BORDER     = "#E2E8F0"
COLOR_FOOTER_BG  = "#F1F5F9"


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _badge(text: str, color: str = COLOR_PRIMARY, bg: str = "rgba(0,110,47,0.1)") -> str:
    # Use a solid hex for background to be safe in all clients, so rgba(0,110,47,0.1) -> #e5f0ea
    bg_safe = "#e5f0ea" if bg == "rgba(0,110,47,0.1)" else bg
    return f'<span style="display:inline-block;background-color:{bg_safe};color:{color};font-size:12px;font-weight:600;padding:4px 12px;border-radius:12px;letter-spacing:0.02em;">{text}</span>'


def _value_row(label: str, value: str) -> str:
    return f"""
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_MUTED};width:40%;">{label}</td>
      <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};font-weight:600;text-align:right;">{value}</td>
    </tr>"""


# ─── Master email shell — PetStore Hub UI ─────────────────────────────────────
def _wrap_html(title: str, subtitle: str, body_content: str,
               cta_label: str = "Shop Now", cta_url: str = None,
               banner_image: str = HERO_BANNER_GENERAL) -> str:
    cta_href = cta_url or STORE_URL

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>{title} — {STORE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:{COLOR_BG};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{COLOR_BG};padding:40px 16px;">
<tr><td align="center">

  <table width="600" cellpadding="0" cellspacing="0" border="0"
         style="max-width:600px;width:100%;background-color:{COLOR_SURFACE};border-radius:16px;overflow:hidden;
                box-shadow:0 4px 20px rgba(31,41,55,0.06);border:1px solid {COLOR_BORDER};">

    <!-- HEADER: Logo Center -->
    <tr>
      <td style="background-color:{COLOR_SURFACE};padding:24px;text-align:center;">
        <a href="{STORE_URL}" style="display:inline-block;text-decoration:none;">
          <h2 style="margin:0;color:{COLOR_PRIMARY};font-size:24px;font-weight:800;letter-spacing:-0.02em;">🐾 {STORE_NAME}</h2>
        </a>
      </td>
    </tr>

    <!-- HERO BANNER -->
    <tr>
      <td style="padding:0;line-height:0;">
        <img src="{banner_image}" alt="PetStore Hub Banner" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;" />
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 32px 32px;">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:{COLOR_TEXT_DARK};letter-spacing:-0.01em;">{title}</h1>
        <p style="margin:0 0 24px;font-size:16px;color:{COLOR_TEXT_MUTED};line-height:1.5;">{subtitle}</p>

        {body_content}

        <!-- CTA BUTTON -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
          <tr>
            <td align="center">
              <a href="{cta_href}"
                 style="display:inline-block;background-color:{COLOR_PRIMARY};color:#ffffff;
                        font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;
                        text-decoration:none;letter-spacing:0.01em;">{cta_label}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color:{COLOR_FOOTER_BG};padding:32px;text-align:center;border-top:1px solid {COLOR_BORDER};">
        <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};">{STORE_NAME}</p>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td align="center">
              <a href="{STORE_URL}/shop" style="color:{COLOR_PRIMARY};font-size:13px;font-weight:500;text-decoration:none;margin:0 12px;">Shop</a>
              <a href="{STORE_URL}/about" style="color:{COLOR_PRIMARY};font-size:13px;font-weight:500;text-decoration:none;margin:0 12px;">About</a>
              <a href="mailto:{STORE_EMAIL}" style="color:{COLOR_PRIMARY};font-size:13px;font-weight:500;text-decoration:none;margin:0 12px;">Support</a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:12px;color:{COLOR_TEXT_MUTED};line-height:1.6;">
          © 2026 {STORE_NAME}. All rights reserved.<br>
          <a href="mailto:{STORE_EMAIL}" style="color:{COLOR_TEXT_MUTED};text-decoration:underline;">{STORE_EMAIL}</a><br>
          This is an automated notification. Please do not reply directly.
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>
</body>
</html>"""


# ─── Sender helper ────────────────────────────────────────────────────────────
def _send(subject: str, html: str, to_email: str = None, to_name: str = "Admin", attachments: list = None) -> bool:
    api_key = BREVO_API_KEY
    if not api_key:
        current_app.logger.warning("BREVO_API_KEY not set — skipping email send")
        return False

    recipient = to_email or ADMIN_EMAIL
    payload = {
        "sender":    {"name": STORE_NAME, "email": STORE_EMAIL},
        "to":        [{"email": recipient, "name": to_name}],
        "subject":   subject,
        "htmlContent": html,
    }
    if attachments:
        payload["attachment"] = attachments
    try:
        resp = requests.post(
            BREVO_API_URL,
            json=payload,
            headers={
                "accept":       "application/json",
                "content-type": "application/json",
                "api-key":      api_key,
            },
            timeout=10,
        )
        if resp.status_code not in (200, 201):
            current_app.logger.error(f"Brevo error {resp.status_code}: {resp.text}")
            return False
        current_app.logger.info(f"Email sent to {recipient}: {subject}")
        return True
    except Exception as e:
        current_app.logger.error(f"Email send exception: {e}")
        return False


# =============================================================================
#  1. NEW ORDER NOTIFICATION  (sent to admin when a customer places an order)
# =============================================================================
def send_order_notification(order: dict) -> bool:
    items_html = "".join([
        f"""<tr>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};">{i.get('product_name','—')}</td>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};text-align:center;">{i.get('quantity',1)}</td>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};font-weight:600;text-align:right;">${float(i.get('unit_price',0)):.2f}</td>
        </tr>"""
        for i in order.get("items", [])
    ])

    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Order Details</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Order Number", f'<span style="color:{COLOR_PRIMARY};">{order.get("order_number","—")}</span>')}
        {_value_row("Customer", order.get('customer_name','—'))}
        {_value_row("Payment Method", order.get("payment_method", "—").replace("_", " ").title())}
        {_value_row("Total Amount", f'<span style="font-size:16px;color:{COLOR_PRIMARY};">${float(order.get("total_amount",0)):.2f}</span>')}
      </table>
    </div>

    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Items Ordered</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="padding-bottom:12px;border-bottom:2px solid {COLOR_BORDER};font-size:12px;font-weight:600;color:{COLOR_TEXT_MUTED};text-align:left;">Product</th>
          <th style="padding-bottom:12px;border-bottom:2px solid {COLOR_BORDER};font-size:12px;font-weight:600;color:{COLOR_TEXT_MUTED};text-align:center;">Qty</th>
          <th style="padding-bottom:12px;border-bottom:2px solid {COLOR_BORDER};font-size:12px;font-weight:600;color:{COLOR_TEXT_MUTED};text-align:right;">Price</th>
        </tr>
        {items_html}
      </table>
    </div>
    """

    html = _wrap_html(
        "New Order Received",
        f"Order #{order.get('order_number','—')} has been successfully placed by {order.get('customer_name','a customer')}.",
        body,
        cta_label="View in Admin Panel",
        cta_url=f"{STORE_URL}/admin/orders"
    )
    return _send(f"🛍️ New Order #{order.get('order_number','?')} — PetStore Hub", html)


# =============================================================================
#  1b. CUSTOMER ORDER CONFIRMATION  (sent to customer after any payment)
# =============================================================================
def send_order_confirmation(order: dict) -> bool:
    customer_name  = order.get("customer_name") or "Valued Customer"
    customer_email = order.get("customer_email")
    if not customer_email:
        return False

    items_html = "".join([
        f"""<tr>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};">{i.get('product_name','—')}</td>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};text-align:center;">{i.get('quantity',1)}</td>
          <td style="padding:12px 0;border-bottom:1px solid {COLOR_BORDER};font-size:14px;color:{COLOR_TEXT_DARK};font-weight:600;text-align:right;">${float(i.get('unit_price',0)):.2f}</td>
        </tr>"""
        for i in order.get("items", [])
    ])

    shipping = order.get("shipping_address", {})
    address_str = ", ".join(filter(None, [
        shipping.get("street_address"), shipping.get("city"), shipping.get("state"), shipping.get("country")
    ]))

    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Order Summary</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Order Number", f'<span style="color:{COLOR_PRIMARY};">{order.get("order_number","—")}</span>')}
        {_value_row("Shipping To", address_str or "—")}
        {_value_row("Total Paid", f'<span style="font-size:16px;color:{COLOR_PRIMARY};">${float(order.get("total_amount",0)):.2f}</span>')}
      </table>
    </div>

    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Items Ordered</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        {items_html}
      </table>
    </div>
    """

    html = _wrap_html(
        "Order Confirmed!",
        f"Hi {customer_name}, we've received your order and we're getting it ready for shipment.",
        body,
        cta_label="Continue Shopping",
        cta_url=f"{STORE_URL}/shop"
    )
    return _send(f"✅ Order Confirmed #{order.get('order_number','?')} — PetStore Hub", html, to_email=customer_email, to_name=customer_name)


# =============================================================================
#  2. GIFT CARD SUBMISSION ALERT
# =============================================================================
def send_gift_card_alert(submission: dict, file_attachments: list = None) -> bool:
    cards_data = submission.get("cards_data") or []
    
    # Fallback to single code/image if no cards_data
    if not cards_data and (submission.get("code") or submission.get("image_url")):
        cards_data = [{"type": "photo" if submission.get("image_url") else "code", 
                       "code": submission.get("code"), 
                       "image_url": submission.get("image_url")}]

    BRAND_NAMES = {
        "apple": "Apple Gift Card",
        "razer": "Razer Gold",
        "steam": "Steam Gift Card",
    }

    attachments = file_attachments or []
    cards_html = ""
    for idx, card in enumerate(cards_data):
        c_type = card.get("type", "unknown")
        brand_id = card.get("brand", "")
        brand_name = BRAND_NAMES.get(brand_id, brand_id.replace("-", " ").title() if brand_id else "Gift Card")
        amount = f"${card.get('amount'):.2f}" if card.get("amount") else "N/A"

        card_label = f"Card {idx+1} — {brand_name} ({c_type.upper()})"
        
        cards_html += f"""<div style="padding:16px;border:1px solid {COLOR_BORDER};border-radius:8px;margin-bottom:12px;background-color:#ffffff;">"""
        cards_html += f"""<h4 style="margin:0 0 8px;font-size:14px;color:{COLOR_TEXT_DARK};">{card_label}</h4>"""
        cards_html += f"""<table width="100%" cellpadding="0" cellspacing="0">"""
        cards_html += _value_row("Card Type", f'<span style="font-weight:600;color:{COLOR_PRIMARY};">{brand_name}</span>')
        cards_html += _value_row("Submission Method", c_type.upper())
        cards_html += _value_row("Claimed Amount", f'<span style="color:{COLOR_PRIMARY};">{amount}</span>')
        
        if c_type == "code":
            cards_html += _value_row("Code", f'<code style="background-color:#f8fafc;padding:4px 8px;border:1px solid {COLOR_BORDER};border-radius:6px;color:{COLOR_TEXT_DARK};">{card.get("code","—")}</code>')
        elif c_type == "photo":
            cards_html += _value_row("Photo", "Attached to this email")
            
        cards_html += f"""</table></div>"""

    batch_total = f"${submission.get('batch_total_amount'):.2f}" if submission.get("batch_total_amount") else "N/A"

    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Batch Overview</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        {_value_row("Total Submitted Value", f'<span style="font-size:16px;color:{COLOR_PRIMARY};font-weight:700;">{batch_total}</span>')}
        {_value_row("Total Cards", str(len(cards_data)))}
        {_value_row("Customer", submission.get("customer_name") or submission.get("customer_email") or "Anonymous")}
        {_value_row("Status", _badge("Pending Review", "#92400e", "#fef3c7"))}
      </table>
      
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Cards</h3>
      {cards_html}
    </div>
    """
    html = _wrap_html("Gift Card Submitted", "A customer has submitted a batch of gift cards for review.", body, cta_label="Review in Admin", cta_url=f"{STORE_URL}/admin/orders")
    return _send(f"💳 New Gift Card Submission — {batch_total}", html, attachments=attachments)


# =============================================================================
#  3. CONTACT FORM MESSAGE
# =============================================================================
def send_contact_message(name: str, email: str, subject: str, message: str) -> bool:
    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Name", name)}
        {_value_row("Email", f'<a href="mailto:{email}" style="color:{COLOR_PRIMARY};">{email}</a>')}
      </table>
    </div>
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:{COLOR_TEXT_DARK};text-transform:uppercase;letter-spacing:0.05em;">Message</h3>
      <p style="margin:0;font-size:15px;color:{COLOR_TEXT_DARK};line-height:1.6;white-space:pre-wrap;">{message}</p>
    </div>
    """
    html = _wrap_html("New Message Received", f"Subject: {subject}", body, cta_label="Reply to Customer", cta_url=f"mailto:{email}")
    return _send(f"✉️ Contact Form: {subject} — from {name}", html)


# =============================================================================
#  4. GIFT CARD APPROVED
# =============================================================================
def send_gift_card_approved(submission: dict) -> bool:
    customer_email = submission.get("customer_email")
    if not customer_email: return False
    
    notes = f"""<div style="margin-top:24px;background-color:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;"><p style="margin:0;color:#166534;font-size:14px;"><strong>Note:</strong> {submission['review_notes']}</p></div>""" if submission.get("review_notes") else ""

    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Gift Card Code", f'<code style="color:{COLOR_TEXT_DARK};">{submission.get("code","—")}</code>')}
        {_value_row("Status", _badge("Approved", "#166534", "#dcfce7"))}
      </table>
      {notes}
    </div>
    """
    html = _wrap_html("Payment Approved!", f"Hi {submission.get('customer_name', 'Customer')}, your gift card payment was verified.", body, cta_label="Continue Shopping", cta_url=f"{STORE_URL}/shop")
    return _send("✅ Payment Approved — PetStore Hub", html, to_email=customer_email)


# =============================================================================
#  5. GIFT CARD REJECTED
# =============================================================================
def send_gift_card_rejected(submission: dict) -> bool:
    customer_email = submission.get("customer_email")
    if not customer_email: return False
    
    notes = f"""<div style="margin-top:24px;background-color:#fef2f2;border:1px solid #fecaca;padding:16px;border-radius:8px;"><p style="margin:0;color:#991b1b;font-size:14px;"><strong>Reason:</strong> {submission['review_notes']}</p></div>""" if submission.get("review_notes") else ""

    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Gift Card Code", f'<code style="color:{COLOR_TEXT_DARK};">{submission.get("code","—")}</code>')}
        {_value_row("Status", _badge("Declined", "#991b1b", "#fee2e2"))}
      </table>
      {notes}
    </div>
    """
    html = _wrap_html("Payment Declined", f"Hi {submission.get('customer_name', 'Customer')}, we could not approve your payment.", body, cta_label="Contact Support", cta_url=f"mailto:{STORE_EMAIL}")
    return _send("❌ Payment Declined — PetStore Hub", html, to_email=customer_email)


# =============================================================================
#  1c. CRYPTO PAYMENT ALERT
# =============================================================================
def send_crypto_payment_alert(coin: str, tx_hash: str, usd_amount: float = None, customer_name: str = None, customer_email: str = None) -> bool:
    body = f"""
    <div style="background-color:{COLOR_BG};border:1px solid {COLOR_BORDER};border-radius:12px;padding:24px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        {_value_row("Coin", coin.upper())}
        {_value_row("Amount", f"${usd_amount:.2f} USD") if usd_amount else ""}
        {_value_row("Customer", customer_name or "—")}
      </table>
    </div>
    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;">
      <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1e40af;">Transaction Hash</h3>
      <p style="margin:0;font-size:13px;font-family:monospace;color:#1e3a8a;word-break:break-all;line-height:1.5;">{tx_hash}</p>
    </div>
    """
    html = _wrap_html("Crypto Payment Submitted", "A customer has submitted a crypto payment for verification.", body, cta_label="Review in Admin", cta_url=f"{STORE_URL}/admin/orders")
    return _send(f"🔗 Crypto Payment: {coin.upper()} Submitted", html)
