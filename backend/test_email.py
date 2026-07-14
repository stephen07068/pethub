import os, sys
sys.path.insert(0, '.')
os.environ['FLASK_ENV'] = 'development'

from app import create_app
from app.services.email_service import _wrap_html, _send

app = create_app()
with app.app_context():
    body = """
    <p style="margin:0 0 16px;font-size:11px;color:#888888;font-weight:700;">Hey Customer,</p>
    <p style="margin:0 0 24px;font-size:13px;color:#555555;line-height:1.6;">
      It looks like you haven't finished checking out yet. The good news? We saved your cart for you. Go on and complete your order now before your cart expires.
    </p>
    """
    html = _wrap_html(
        "YOU LEFT SOMETHING PAWSOME BEHIND!",
        "Don't worry, we won't tell your pet!",
        body,
        cta_label="FINISH CHECKOUT"
    )
    _send("✨ EXACT Replica Test", html, "petstorehub12@gmail.com")
    print("Test email sent!")
