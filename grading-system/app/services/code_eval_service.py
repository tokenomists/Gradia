import os
import time
import requests

JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY")

HEADERS = {
    'X-RapidAPI-Key': JUDGE0_API_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
}

LANGUAGE_CONFIGS = {
    'python3': {
        'id': 71,
        'template': '''
{user_code}

# Input handling
input_value = input().strip()
result = solution(int(input_value))
print(result)
'''
    },
    'javascript': {
        'id': 63,
        'template': '''
{user_code}

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
console.log(solution(parseInt(input, 10)));
'''
    }
}

class CodeSubmissionError(Exception):
    pass

def get_supported_languages():
    return list(LANGUAGE_CONFIGS.keys())

def prepare_source_code(user_code, language):
    if language not in LANGUAGE_CONFIGS:
        raise CodeSubmissionError(f"Unsupported language: {language}")
    
    lang_config = LANGUAGE_CONFIGS[language]
    return lang_config['template'].format(user_code=user_code)

def submit_code_to_judge0(source_code, language_id, stdin=''):
    payload = {
        'source_code': source_code,
        'language_id': language_id,
        'stdin': stdin,
        'compile_output_only': False
    }
    
    try:
        response = requests.post(
            "https://judge0-ce.p.rapidapi.com/submissions", 
            json=payload, 
            headers=HEADERS

        )
        response.raise_for_status()
        token = response.json().get('token')
        return token
    except requests.exceptions.RequestException as e:
        raise CodeSubmissionError(f"Submission failed: {str(e)}")

def get_submission_result(token, timeout=30):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(
                f"https://judge0-ce.p.rapidapi.com/submissions/{token}", 
                headers=HEADERS
            )
            response.raise_for_status()
            result = response.json()
            
            # Check if processing is complete
            status_id = result.get('status', {}).get('id')
            
            if status_id > 2: 
                return result
            
            time.sleep(0.5)
        except requests.exceptions.RequestException as e:
            raise CodeSubmissionError(f"Result retrieval failed: {str(e)}")
    raise CodeSubmissionError("Submission processing timeout")

def parse_submission_result(result, expected_output):
    status = result.get('status', {})
    status_id = status.get('id')
    status_description = status.get('description', 'Unknown')
    stdout = (result.get('stdout', '') or '').strip()
    stderr = (result.get('stderr', '') or '').strip()
    compile_output = (result.get('compile_output', '') or '').strip()
    if status_id == 3: 
        passed = stdout == str(expected_output).strip()
        verdict = 'Accepted' if passed else 'Wrong Answer'
    elif status_id in [4, 5, 6]: 
        passed = False
        verdict = 'Failed'
    else:
        passed = False
        verdict = 'Error'
    return {
        'status': status_description,
        'compile_output': compile_output,
        'stdout': stdout,
        'stderr': stderr,
        'time': result.get('time'),
        'memory': result.get('memory'),
        'passed': passed,
        'verdict': verdict,
        'actual_output': stdout
    }

def submit_code(source_code, language, test_cases):
    try:
        language_config = LANGUAGE_CONFIGS.get(language)
        if not language_config:
            raise CodeSubmissionError(f"Unsupported language: {language}")

        prepared_source_code = prepare_source_code(source_code, language)
        test_results = []

        for idx, test_case in enumerate(test_cases, 1):
            try:
                input_data = str(test_case.get("input", ""))
                expected_output = test_case.get("expected_output", "")

                token = submit_code_to_judge0(
                    prepared_source_code,
                    language_config["id"],
                    stdin=input_data,
                )

                result = get_submission_result(token)
                parsed_result = parse_submission_result(result, expected_output)
                parsed_result.update(
                    {
                        "test_case_id": idx,
                        "input": input_data,
                        "expected_output": expected_output,
                    }
                )

                test_results.append(parsed_result)

            except CodeSubmissionError as e:
                test_results.append(
                    {
                        "test_case_id": idx,
                        "error": f"Code submission failed: {str(e)}",
                        "passed": False,
                        "verdict": "Error",
                    }
                )

            except Exception as e:
                test_results.append(
                    {
                        "test_case_id": idx,
                        "error": f"Unexpected error occurred: {str(e)}",
                        "passed": False,
                        "verdict": "Error",
                    }
                )

        overall_result = {
            "total_test_cases": len(test_results),
            "passed_test_cases": sum(1 for result in test_results if result.get("passed")),
            "test_results": test_results,
        }

        return overall_result

    except CodeSubmissionError as e:
        raise CodeSubmissionError(f"Submission process failed: {str(e)}") from e

    except Exception as e:
        raise RuntimeError(f"Unexpected error in submit_code: {str(e)}") from e
