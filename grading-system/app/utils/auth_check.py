import secrets
from functools import wraps
from flask import request, jsonify, current_app

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        client_api_key = request.headers.get("X-API-KEY")
        if not client_api_key or not secrets.compare_digest(client_api_key, current_app.config['GRADIA_API_KEY']):
            return jsonify({"error": "Unauthorized. Invalid Gradia API Key."}), 401
        return f(*args, **kwargs)
    return decorated
