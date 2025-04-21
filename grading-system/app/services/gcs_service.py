import os
import tempfile
from google.cloud import storage

storage_client = storage.Client()

def list_pdfs(bucket_name):
    bucket = storage_client.bucket(bucket_name)
    return [b.name for b in bucket.list_blobs() if b.name.endswith('.pdf')]

def download_pdf(bucket_name, filename, local_path=None):
    if local_path is None:
        local_path = os.path.join(tempfile.gettempdir(), filename)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.download_to_filename(local_path)
    return local_path

def upload_file(bucket_name, file):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)

def delete_file(bucket_name, file_name):
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    blob.delete()

def create_bucket(bucket_name):
    storage_client.create_bucket(bucket_name)

def delete_bucket(bucket_name):
    bucket = storage_client.bucket(bucket_name)
    bucket.delete(force=True)
