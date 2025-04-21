from flask import Blueprint, request, jsonify, send_file
from app.utils.auth_check import require_api_key
from app.services.gcs_service import (
    create_bucket, 
    delete_bucket,
    list_pdfs, 
    upload_file, 
    delete_file,
    download_pdf
)

gcs_bp = Blueprint('gcs', __name__, url_prefix="/api/gcs")

@gcs_bp.route('/create-bucket', methods=['POST'])
@require_api_key
def create_gcs_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        create_bucket(bucket_name)
        return jsonify({"message": f"Bucket '{bucket_name}' created successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gcs_bp.route('/delete-bucket', methods=['DELETE'])
@require_api_key
def delete_gcs_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        delete_bucket(bucket_name)
        return jsonify({"message": f"Bucket '{bucket_name}' deleted successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gcs_bp.route('/list-files', methods=['POST'])
@require_api_key
def list_pdfs_in_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        pdf_files = list_pdfs(bucket_name)
        return jsonify({"pdf_files": pdf_files})
    except Exception as e:
        return jsonify({"error": f"Failed to list PDFs: {str(e)}"}), 500


@gcs_bp.route('/upload-file', methods=['POST'])
@require_api_key
def upload_file_to_bucket_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files["file"]
    bucket_name = request.form.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        upload_file(bucket_name, file)
        return jsonify({"message": f"File '{file.filename}' uploaded successfully to bucket '{bucket_name}'."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gcs_bp.route('/delete-file', methods=['DELETE'])
@require_api_key
def delete_file_from_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    file_name = data.get("file_name")
    if not bucket_name or not file_name:
        return jsonify({"error": "Missing required fields: bucket_name, file_name"}), 400
    try:
        delete_file(bucket_name, file_name)
        return jsonify({"message": f"File '{file_name}' deleted successfully from bucket '{bucket_name}'."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gcs_bp.route('/download-file', methods=['POST'])
@require_api_key
def download_file_from_gcs():
    data = request.get_json()
    bucket_name = data.get('bucket_name')
    file_name = data.get('file_name')

    if not bucket_name or not file_name:
        return jsonify({"error": "Missing required fields: bucket_name, file_name"}), 400

    local_path = download_pdf(bucket_name, file_name)
    return send_file(local_path, as_attachment=True)
