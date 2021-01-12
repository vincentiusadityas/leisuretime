import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TMDB_API_KEY = os.getenv('TMDB_API_KEY')
    SECRET_KEY = "eac634658c6fdd527d1cfff5"
    STATIC_FOLDER = f"{os.getenv('APP_FOLDER')}/flaskr/static"


class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = "production"


class StagingConfig(Config):
    DEVELOPMENT = True
    DEBUG = True


class DevelopmentConfig(Config):
    DEVELOPMENT = True
    DEBUG = True
    FLASK_ENV = "development"


class TestingConfig(Config):
    TESTING = True