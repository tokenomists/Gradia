import os
import tempfile
import fitz
from google.cloud import storage
from dotenv import load_dotenv

load_dotenv()

storage_client = storage.Client()

def list_pdfs_in_gcs(bucket_name):
    bucket = storage_client.bucket(bucket_name)
    return [blob.name for blob in bucket.list_blobs() if blob.name.endswith(".pdf")]

def download_pdf_from_gcs(bucket_name, filename, local_path=None):
    if local_path is None:
        local_path = os.path.join(tempfile.gettempdir(), filename)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.download_to_filename(local_path)
    return local_path

def extract_text_from_pdf(pdf_path):
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text("text") + "\n"
    return text

def upload_file_to_gcs(bucket_name, file):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)

def delete_file_from_gcs(bucket_name, file_name):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    blob.delete()

def create_gcs_bucket(bucket_name):
    storage_client.create_bucket(bucket_name)

def delete_gcs_bucket(bucket_name):
    bucket = storage_client.bucket(bucket_name)
    bucket.delete(force=True)