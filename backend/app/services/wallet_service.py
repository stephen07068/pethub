import io
import qrcode
from flask import current_app


def get_wallet_address(coin: str):
    """Return wallet address for a given coin symbol."""
    wallets = current_app.config.get("WALLETS", {})
    address = wallets.get(coin.lower())
    if not address:
        return None, f"Wallet not configured for '{coin}'"
    return address, None


def generate_qr(coin: str, amount=None):
    """Generate a QR code PNG for a wallet address."""
    address, err = get_wallet_address(coin)
    if err:
        return None, err

    # Encode amount into URI if provided (BIP-21 style)
    data = address
    if amount:
        prefix_map = {
            "btc": "bitcoin",
            "eth": "ethereum",
            "sol": "solana",
        }
        prefix = prefix_map.get(coin.lower())
        if prefix:
            data = f"{prefix}:{address}?amount={amount}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#006e2f", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf, None
