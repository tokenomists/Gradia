from flask import Blueprint, request, jsonify
from app.utils.auth_check import require_api_key
from app.services.grading_service import grade_answer, grade_code

grading_bp = Blueprint('grading', __name__, url_prefix="/api/grading")

@grading_bp.route('/grade-answer', methods=['POST'])
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
    
    grading_result = grade_answer(question, student_answer, max_mark, bucket_name, rubrics)
    return jsonify(grading_result)


@grading_bp.route('/grade-code', methods=['POST'])
@require_api_key
def grade_code_endpoint():
    data = request.get_json()
    question = data.get("question")
    student_code = data.get("student_code")
    max_mark = data.get("max_mark")

    if not question or not student_code or max_mark is None:
        return jsonify({"error": "Missing required fields: question, student_code, max_mark"}), 400

    if not isinstance(max_mark, int) or max_mark <= 0:
        return jsonify({"error": "max_mark must be a positive integer"}), 400
    
    grading_result = grade_code(question, student_code, max_mark)
    return jsonify(grading_result)
