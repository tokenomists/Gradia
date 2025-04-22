# Gradia Installation Guide

### 1. Repository Setup
```bash
git clone https://github.com/tokenomists/Gradia.git
cd Gradia
```

## 2. Install Frontend Dependencies
Navigate to the `frontend` directory and install the required dependencies:
```bash
cd frontend
npm install
```

## 3. Install Backend Dependencies
Navigate to the `backend` directory and install the required dependencies:
```bash
cd ../backend
npm install
```

## 4. Set Up the Grading System
Navigate to the `grading-system` directory:
```bash
cd ../grading-system
```

Create a virtual environment:
```bash
python -m venv .venv
```
Activate the virtual environment:
- For Windows:
  ```bash
  .\.venv\Scripts\activate
  ```
- For Linux:
  ```bash
  source .venv/bin/activate
  ```

Install the required Python dependencies:
```bash
pip install -r requirements.txt
```

## 5. Create Google Cloud Project and Configure Services
Before setting the environment variables, create a Google Cloud project and set up the following services:

- Cloud Storage
- Google Cloud Vision OCR
- Gemini API
- Google OAuth
- Other necessary APIs

Then, create a service account with the required permissions in IAM and download the `service account credentials` as a JSON file. Store the full path of this credentials file in the `GOOGLE_APPLICATION_CREDENTIALS` variable in the `grading-system` `.env` file as mentioned below.

## 6. Set Up Environment Variables
- In the `frontend` directory, create a `.env` file with the following:

    ```plaintext
    NEXT_PUBLIC_API_BASE_URL="YOUR_API_BASE_URL"
    ```
- In the `backend` directory, create a `.env` file with the following:

    ```plaintext
    PORT=YOUR_BACKEND_PORT
    MONGO_URI="YOUR_MONGODB_URI"
    JWT_SECRET="YOUR_JWT_SECRET"
    FRONTEND_URL="YOUR_FRONTEND_URL"
    BACKEND_URL="YOUR_BACKEND_URL"
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
    GOOGLE_APPLICATION_CREDENTIALS="PATH_TO_YOUR_GOOGLE_APPLICATION_CREDENTIALS"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    GRADIA_API_KEY="YOUR_GRADIA_API_KEY"
    GRADIA_PYTHON_BACKEND_URL="YOUR_GRADIA_PYTHON_BACKEND_URL"
    ```
- In the `grading-system` directory, create a `.env` file with the following:
    ```plaintext
    PORT=YOUR_PYTHON_BACKEND_PORT
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    GOOGLE_APPLICATION_CREDENTIALS="PATH_TO_YOUR_GOOGLE_APPLICATION_CREDENTIALS"
    GOOGLE_CLOUD_PROJECT="YOUR_GCP_PROJECT_ID"
    GRADIA_API_KEY="YOUR_GRADIA_API_KEY"
    JUDGE0_API_KEY="YOUR_JUDGE0_API_KEY"
    ```

## 7. Run the Application
Go to the `frontend` directory and run:
```bash
npm run dev
```

Go to the `backend` directory and run:
```bash
npm run dev
```

Go to the `grading-system` directory, after activating the virtual environment, run:
- For Windows:
    ```bash
    python run.py
    ```
- For Linux or Docker (Recommended: use Gunicorn for production):
    ```bash
    gunicorn -b 0.0.0.0:8080 run:app
    ```
    > ⚠️ **Note**: Gunicorn is not supported on Windows unless you use something like WSL.

This will start all components of the platform on their respective servers. 
