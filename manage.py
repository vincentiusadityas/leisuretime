# from flask.cli import FlaskGroup
# from werkzeug.security import generate_password_hash

# from flaskr.models import User
# from flaskr import app, db


# cli = FlaskGroup(app)


# @cli.command("create_db")
# def create_db():
#     db.drop_all()
#     db.create_all()
#     db.session.commit()

# @cli.command("seed_db")
# def seed_db():
#     hashed_password = generate_password_hash('admin', method='sha256')
#     user_1 = User(email="vasundjaja@gmail.com", firstname="Vincentius Aditya",
#                   lastname="Sundjaja", password=hashed_password)
#     user_2 = User(email="test@gmail.com", firstname="Number 1",
#                   lastname="Test", password=hashed_password)
#     user_3 = User(email="test2@gmail.com", firstname="Number 2",
#                   lastname="Test", password=hashed_password)
    
#     db.session.add(user_1)
#     db.session.add(user_2)
#     db.session.add(user_3)
#     db.session.commit()


# if __name__ == "__main__":
#     cli()

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
from werkzeug.security import generate_password_hash

from flaskr.models import User
from flaskr import app, db

migrate = Migrate(app, db)
manager = Manager(app)

"""
db commands:
$ python manage.py db init
$ python manage.py db migrate
$ python manage.py db upgrade
$ python manage.py db --help
"""
manager.add_command('db', MigrateCommand)


"""
extra db commands:
$ python manage.py create_db --> I think the same as db init
$ python manage.py seed_db
"""
@manager.command
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()

@manager.command
def seed_db():
    hashed_password = generate_password_hash('admin', method='sha256')
    user_1 = User(email="vasundjaja@gmail.com", firstname="Vincentius Aditya",
                  lastname="Sundjaja", password=hashed_password)
    user_2 = User(email="test@gmail.com", firstname="Number 1",
                  lastname="Test", password=hashed_password)
    user_3 = User(email="test2@gmail.com", firstname="Number 2",
                  lastname="Test", password=hashed_password)
    
    db.session.add(user_1)
    db.session.add(user_2)
    db.session.add(user_3)
    db.session.commit()

if __name__ == '__main__':
    manager.run()