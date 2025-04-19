from flask import Blueprint
from app.utils.auth_check import require_api_key

home_bp = Blueprint('home', __name__, url_prefix="/api")

@home_bp.route('/', methods=['GET'], strict_slashes=False)
@require_api_key
def home():
    return "The Gradia Grading System is up and running :)"
