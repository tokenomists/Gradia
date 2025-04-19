import os
import json
import tempfile
import secrets

from functools import wraps
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from utils import list_pdfs_in_gcs, extract_text_from_pdf, download_pdf_from_gcs, upload_file_to_gcs, delete_file_from_gcs, create_gcs_bucket, delete_gcs_bucket
from grading import grade_answer, create_vector_db, retrieve_relevant_text
from handwritten_ocr import detect_handwritten_text
from code_evaluator import submit_code, get_supported_languages, CodeSubmissionError

app = Flask(__name__)

load_dotenv()

PORT = os.getenv("PORT")
GRADIA_API_KEY = os.getenv("GRADIA_API_KEY")

def require_api_key(f):
    @wraps(f)
    def gradia_api_verify(*args, **kwargs):
        client_api_key = request.headers.get("X-API-KEY")
        if not client_api_key or not secrets.compare_digest(client_api_key, GRADIA_API_KEY):
            return jsonify({"error": "Unauthorized. Invalid Gradia API Key."}), 401
        return f(*args, **kwargs)
    return gradia_api_verify


@app.route("/", methods=["GET"])
@require_api_key
def home_endpoint():
    return "The Gradia Grading System is up and running :)"


@app.route("/grade", methods=["POST"])
@require_api_key
def grade_answer_endpoint():
    data = request.get_json()
    question = data.get("question")
    student_answer = data.get("student_answer")
    max_mark = data.get("max_mark")
    bucket_name = data.get("bucket_name")
    rubrics = data.get("rubrics")

    if not question or not student_answer or max_mark is None or not bucket_name:
        return jsonify({"error": "Missing required fields: question, student_answer, max_mark, bucket_name"}), 400

    if not isinstance(max_mark, int) or max_mark <= 0:
        return jsonify({"error": "max_mark must be a positive integer"}), 400

    pdf_files = list_pdfs_in_gcs(bucket_name)
    all_text_chunks = []
    for pdf_file in pdf_files:
        pdf_path = download_pdf_from_gcs(bucket_name, pdf_file)
        pdf_text = extract_text_from_pdf(pdf_path)
        text_chunks = [pdf_text[i:i + 500] for i in range(0, len(pdf_text), 500)]
        all_text_chunks.extend(text_chunks)

    embeddings, stored_chunks = create_vector_db(all_text_chunks)
    retrieved_text = retrieve_relevant_text(question, embeddings, stored_chunks)
    
    grading_result = grade_answer(question, student_answer, max_mark, retrieved_text, rubrics) if rubrics else grade_answer(question, student_answer, max_mark, retrieved_text)
    return jsonify(grading_result)


@app.route("/create-gcs-bucket", methods=["POST"])
@require_api_key
def create_gcs_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        create_gcs_bucket(bucket_name)
        return jsonify({"message": f"Bucket '{bucket_name}' created successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/delete-gcs-bucket", methods=["DELETE"])
@require_api_key
def delete_gcs_bucket_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        delete_gcs_bucket(bucket_name)
        return jsonify({"message": f"Bucket '{bucket_name}' deleted successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/list-gcs-files", methods=["POST"])
@require_api_key
def list_pdfs_in_gcs_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        pdf_files = list_pdfs_in_gcs(bucket_name)
        return jsonify({"pdf_files": pdf_files})
    except Exception as e:
        return jsonify({"error": f"Failed to list PDFs: {str(e)}"}), 500


@app.route("/upload-gcs-file", methods=["POST"])
@require_api_key
def upload_file_to_gcs_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    file = request.files["file"]
    bucket_name = request.form.get("bucket_name")
    if not bucket_name:
        return jsonify({"error": "Missing required field: bucket_name"}), 400
    try:
        upload_file_to_gcs(bucket_name, file)
        return jsonify({"message": f"File '{file.filename}' uploaded successfully to bucket '{bucket_name}'."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/delete-gcs-file", methods=["DELETE"])
@require_api_key
def delete_file_from_gcs_endpoint():
    data = request.get_json()
    bucket_name = data.get("bucket_name")
    file_name = data.get("file_name")
    if not bucket_name or not file_name:
        return jsonify({"error": "Missing required fields: bucket_name, file_name"}), 400
    try:
        delete_file_from_gcs(bucket_name, file_name)
        return jsonify({"message": f"File '{file_name}' deleted successfully from bucket '{bucket_name}'."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/handwritten-ocr", methods=["POST"])
@require_api_key
def detect_handwritten_text_endpoint():
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
        result = detect_handwritten_text(temp_file.name)
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
    

@app.route('/get-languages', methods=['GET'])
@require_api_key
def get_supported_languages_endpoint():
    return jsonify(get_supported_languages())


@app.route('/submit-code', methods=['POST'])
@require_api_key
def submit_code_endpoint():
    try:
        data = request.get_json()
        
        required_fields = ['source_code', 'language', 'test_cases']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing {field}'}), 400
        
        result = submit_code(
            source_code=data['source_code'],
            language=data['language'],
            test_cases=data['test_cases']
        )

        return jsonify(result)
    
    except CodeSubmissionError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
