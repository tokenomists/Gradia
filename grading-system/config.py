import os

class Config:
    PORT = os.getenv("PORT", 8080)
    GRADIA_API_KEY = os.getenv("GRADIA_API_KEY")
    JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")