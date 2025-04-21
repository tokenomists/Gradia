from flask import Blueprint, request, jsonify
from app.utils.auth_check import require_api_key
from app.services.code_eval_service import submit_code, get_supported_languages, CodeSubmissionError

code_eval_bp = Blueprint('code_eval', __name__, url_prefix="/api/code-eval")

@code_eval_bp.route('/get-languages', methods=['GET'])
@require_api_key
def get_languages():
    return jsonify(get_supported_languages())


@code_eval_bp.route('/submit', methods=['POST'])
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
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
