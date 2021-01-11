from flask_login import UserMixin
from sqlalchemy.sql.sqltypes import PickleType
from . import db
from sqlalchemy import Table, Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(db.Model, UserMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True) # primary keys are required by SQLAlchemy
    email = Column(String(100), unique=True)
    firstname = Column(String(100))
    lastname = Column(String(100))
    password = Column(String(100))

    activities = relationship("Activity", backref="users", lazy="dynamic")

class Activity(db.Model):
    __tablename__ = "activity"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    href = Column(String(100))
    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity':'activity',
        'polymorphic_on':type
    }

class Book(Activity):
    __tablename__ = "book"

    book_id = Column(Integer)
    book_author = Column(String(100))
    book_title = Column(String(100))
    # book_publisher = Column(String(100))
    # book_average_rating = Column(String(100))
    # book_total_rating = Column(String(100))
    book_rating_elem = Column(String(1000))
    book_img_src = Column(String(200))
    book_img_src_small = Column(String(200))

    __mapper_args__ = {
        'polymorphic_identity':'book',
    }

class Movie(Activity):
    __tablename__ = "movie"
    
    movie_id = Column(Integer)
    movie_title = Column(String(100))
    movie_overview = Column(String(1000))
    movie_release_date = Column(String(100))
    movie_rating = Column(String(100))
    movie_img_src = Column(String(200))

    __mapper_args__ = {
        'polymorphic_identity':'movie',
    }

class TVShow(Activity):
    __tablename__ = "tvshow"

    tvshow_id = Column(Integer)
    tvshow_title = Column(String(100))
    tvshow_overview = Column(String(1000))
    tvshow_release_date = Column(String(100))
    tvshow_rating = Column(String(100))
    tvshow_img_src = Column(String(200))

    __mapper_args__ = {
        'polymorphic_identity':'tvshow',
    }

# class Genre(db.Model):
#     __tablename__ = "genre"
    
#     activity_id = Column(Integer, ForeignKey("activity.id"))
#     genre_id = Column(Integer)
#     genre_name = Column(Integer)

#     __mapper_args__ = {
#         "primary_key": [activity_id, genre_id]
#     }