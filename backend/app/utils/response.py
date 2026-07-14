from flask import jsonify


def success(data=None, message="Success", status=200, meta=None):
    """Return a standardized success response."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    if meta is not None:
        response["meta"] = meta
    return jsonify(response), status


def error(message="An error occurred", status=400, errors=None):
    """Return a standardized error response."""
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status
