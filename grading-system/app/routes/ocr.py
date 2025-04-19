import os
import json
import tempfile
from flask import Blueprint, request, jsonify
from app.utils.auth_check import require_api_key
from app.services.ocr_service import extract_handwritten_text

ocr_bp = Blueprint('ocr', __name__, url_prefix="/api/ocr")

@ocr_bp.route('/extract-text', methods=['POST'])
@require_api_key
def extract_handwritten_text_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    temp_file = None
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
        temp_file.close()
        file.save(temp_file.name)
        result = extract_handwritten_text(temp_file.name)
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        return jsonify(json.loads(result))
    except Exception as e:
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except PermissionError:
                print(f"Warning: Could not delete temporary file {temp_file.name}: {str(e)}")
        return jsonify({"error": f"Failed to process handwritten text: {str(e)}"}), 500
