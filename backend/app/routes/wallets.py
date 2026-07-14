from flask import Blueprint, Response
from ..services.wallet_service import get_wallet_address, generate_qr
from ..utils.response import success, error

wallets_bp = Blueprint("wallets", __name__)


@wallets_bp.route("/<string:coin>", methods=["GET"])
def get_address(coin):
    address, err = get_wallet_address(coin)
    if err:
        return error(err, 404)
    return success({"coin": coin.upper(), "address": address})


@wallets_bp.route("/<string:coin>/qr", methods=["GET"])
def get_qr(coin):
    buf, err = generate_qr(coin)
    if err:
        return error(err, 404)
    return Response(buf.read(), mimetype="image/png")
