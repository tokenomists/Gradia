import io
import json
from google.cloud import vision_v1p3beta1 as vision

def extract_handwritten_text(path):
    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    image_context = vision.ImageContext(language_hints=["en-t-i0-handwrit"])
    response = client.document_text_detection(image=image, image_context=image_context)
    result = {"extracted_text": response.full_text_annotation.text}
    json_result = json.dumps(result, indent=2)
    return json_result
