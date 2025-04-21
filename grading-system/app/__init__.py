from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    from app.routes.home import home_bp
    from app.routes.grading import grading_bp
    from app.routes.gcs import gcs_bp
    from app.routes.ocr import ocr_bp
    from app.routes.code_eval import code_eval_bp

    app.register_blueprint(home_bp)
    app.register_blueprint(grading_bp)
    app.register_blueprint(gcs_bp)
    app.register_blueprint(ocr_bp)
    app.register_blueprint(code_eval_bp)

    return app
