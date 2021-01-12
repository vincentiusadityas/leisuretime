from flask import Blueprint, render_template, send_from_directory, request, json, Markup
from flask_login import login_required, current_user
from flask_cors import CORS, cross_origin
import requests
from .models import *
from . import db
from bs4 import BeautifulSoup
from .scraper import bookScrapper, getMovies, getTVShows, genres

#App configuration
main = Blueprint('main', __name__)

cors = CORS(main, resources={r"/view-all/*": {"origins": "*"}})

#Data source
# users = [{'uid': 1, 'name': 'Vincentius Aditya'}]

################## ACTIVITIES LIST ##################
books = bookScrapper()
movies = getMovies()['movies']
tvshows = getTVShows()['tvshows']
# genres = getGenres()
# print(genres)


@main.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('index.html', data=current_user)
    else:
        return render_template('index.html')


#Api route to get users
@main.route('/profile')
@login_required
def profile():
    # filter saved books according to user
    books_db = Book.query.filter_by(user_id=current_user.id).filter_by(type="book").all()
    saved_books = []
    for book in books_db:
        a_book = book.__dict__
        a_book['book_rating_elem'] = Markup(a_book['book_rating_elem'])
        saved_books.append(a_book)

    # filter saved movies according to user
    movies_db = Movie.query.filter_by(user_id=current_user.id).filter_by(type="movie").all()
    saved_movies = []
    for movie in movies_db:
        del movie.__dict__['_sa_instance_state']
        a_movie = movie.__dict__
        saved_movies.append(a_movie)

    # filter saved tv shows according to user
    tvshows_db = TVShow.query.filter_by(user_id=current_user.id).filter_by(type="tvshow").all()
    saved_tvshows = []
    for tvshow in tvshows_db:
        del tvshow.__dict__['_sa_instance_state']
        a_tvshow = tvshow.__dict__
        saved_tvshows.append(a_tvshow)
    
    return render_template("profile.html", 
                            data=current_user, 
                            saved_books=saved_books, 
                            saved_movies=saved_movies,
                            saved_tvshows=saved_tvshows)


@main.route('/activities')
# @login_required
def activities():
    # print(books)
    # books = bookScrapper()
    if current_user.is_authenticated:
        # current_user = {"firstname": "Good", "lastname": "People"}
        # mod_books = checkSavedActivity(current_user.id, books, 'book')
        # mod_movies = checkSavedActivity(current_user.id, movies, 'movie')
        return render_template("activities.html", data=current_user, books=books, movies=movies, tvshows=tvshows)
    else:
        return render_template("activities.html", books=books, movies=movies, tvshows=tvshows)


@main.route('/view-movies', methods=['POST'])
@login_required
def viewMovies():
    page = request.json['page']
    query = request.json['query']
    selected_genres = request.json['genres']

    movies = getMovies(page, query, selected_genres)
    
    genre_names = []
    # for m_genre in genres['movie_genres']:
    #     # print(m_genre)
    #     if int(m_genre['id']) in movies['movie_genre_ids']:
    #         genre_names.append(m_genre['name'])
    
    # print(genre_names)
        

    # the checkSavedActivity mutated the movies dict (so dont need to assign to variable actually)
    mod_movies = checkSavedActivity(current_user.id, movies['movies'], 'movie')

    return json.dumps(
        {'status': 'OK', 
         'movies': mod_movies, 
         'page': movies['page'], 
         'total_pages': movies['total_pages']})


@main.route('/view-tvshows', methods=['POST'])
@login_required
def viewTVShows():
    page = request.json['page']
    query = request.json['query']
    selected_genres = request.json['genres']

    tvshows = getTVShows(page, query, selected_genres)
    
    # the checkSavedActivity mutated the movies dict (so dont need to assign to variable actually)
    mod_tvshows = checkSavedActivity(current_user.id, tvshows['tvshows'], 'tvshow')

    return json.dumps(
        {'status': 'OK', 
         'tvshows': mod_tvshows, 
         'page': tvshows['page'], 
         'total_pages': tvshows['total_pages']})


# function to check if the activities loaded is already saved by the user
def checkSavedActivity(user_id, activities, type_):
    mod_activities = []
    saved = 0
    for activity in activities:
        if (type_ == 'book'):
            book_id = activity['book_id']
            book = Book.query.filter_by(user_id=user_id).filter_by(book_id=book_id).first()
            saved = 1 if book else 0

        elif (type_ == 'movie'):
            movie_id = activity['movie_id']
            movie = Movie.query.filter_by(user_id=user_id).filter_by(movie_id=movie_id).first()
            saved = 1 if movie else 0
        
        elif (type_ == 'tvshow'):
            tvshow_id = activity['tvshow_id']
            tvshow = TVShow.query.filter_by(user_id=user_id).filter_by(tvshow_id=tvshow_id).first()
            saved = 1 if tvshow else 0

        activity['saved'] = saved
        mod_activities.append(activity)

    return mod_activities


@main.route('/view-all/<string:activity>')
@cross_origin()
@login_required
def view_all(activity):

    # movies and tv shows are called from the js file and called the viewMovies and viewTVShows in this file
    mod_books = checkSavedActivity(current_user.id, books, 'book')

    activity_genres = {}

    if (activity == "movies"): activity_genres = genres['movie_genres']
    elif (activity == "tv shows"): activity_genres = genres['tvshow_genres']

    return render_template("view-all.html", data=current_user, title=activity.upper(), books=mod_books, genres=activity_genres)


@main.route('/search-book', methods=['GET', 'POST'])
@login_required
def searchBook():
    URL = request.json['url']
    # print(URL)

    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'lxml')
    works = soup.find_all("work")

    books = []
    works = works if len(works) <= 50 else works[0:50]
    for work in works:
        avg_rating = work.find("average_rating").text
        ratings_count = work.find("ratings_count").text

        avg_rating_int = int(float(avg_rating)*10)
        p10 = avg_rating_int // 10
        p6 = 0 if (avg_rating_int % 10) < 5 else 1
        p3 = 0 if (avg_rating_int % 10) >= 5 else 1
        p0 = 4 - p10
        staticStar = "<span class='staticStar p10' size='12x12'></span>"*p10 + \
                     "<span class='staticStar p6' size='12x12'></span>"*p6 + \
                     "<span class='staticStar p3' size='12x12'></span>"*p3 + \
                     "<span class='staticStar p0' size='12x12'></span>"*p0

        rating_elem = "<span class='greyText smallText uitext'>\
                        <span class='minirating'>\
                            <span class='stars staticStars notranslate'>\
                                {}\
                            </span>\
                            {} avg rating — {} ratings\
                        </span>\
                      </span>".format(staticStar, avg_rating, ratings_count)
        rating_elem = Markup(rating_elem)

        book_id = work.find("best_book").find("id").text
        title = work.find("best_book").find("title").text
        author = work.find("best_book").find("author").find("name").text
        img_src = work.find("best_book").find("image_url").text
        img_src_small  = work.find("best_book").find("small_image_url").text
        href = "https://www.goodreads.com/book/show/" + book_id

        book = Book.query.filter_by(user_id=current_user.id).filter_by(book_id=book_id).first()
        saved = 1 if book else 0
        print(title, saved)

        a_book = {"book_id": book_id,
                  "img": img_src,
                  "img_small": img_src_small,
                  "title": title,
                  "href": href,
                  "ratingElem": rating_elem,
                  "author": author,
                  "saved": saved}
        books.append(a_book)

    return json.dumps({'status':'OK', 'books':books})


@main.route('/delete-activity', methods=['POST'])
@login_required
def deleteActivity():
    user_id = current_user.id
    type_ = request.json['type']

    if (type_ == 'book'):
        book_id = request.json['book_id']
        Book.query.filter_by(user_id=user_id).filter_by(book_id=book_id).delete()
        db.session.commit()
    elif (type_ == 'movie'):
        movie_id = request.json['movie_id']
        Movie.query.filter_by(user_id=user_id).filter_by(movie_id=movie_id).delete()
        db.session.commit()
    elif (type_ == 'tvshow'):
        tvshow_id = request.json['tvshow_id']
        TVShow.query.filter_by(user_id=user_id).filter_by(tvshow_id=tvshow_id).delete()
        db.session.commit()

    message = 'successfully deleted a {} activity'.format(type_)
    return json.dumps({'status':'OK', 'message':message})


@main.route('/save-activity', methods=['POST'])
@login_required
def saveActivity():
    user_id = current_user.id
    type_ = request.json['type']
    
    user = User.query.filter_by(id=user_id).first()

    if (type_ == 'book'):
        book_id = request.json['book_id']
        book_href = request.json['href']
        book_author = request.json['book_author']
        book_title = request.json['book_title']
        # book_publisher = request.json['book_publisher']
        # book_average_rating = request.json['book_average_rating']
        # book_total_rating = request.json['book_total_rating']
        book_rating_elem = request.json['book_rating_elem']
        book_img_src = request.json['book_img_src']
        book_img_src_small = request.json['book_img_src_small']

        new_book = Book(book_id=book_id, book_author=book_author, book_title=book_title,
                        book_rating_elem=book_rating_elem, book_img_src=book_img_src,
                        book_img_src_small=book_img_src_small, href=book_href, users=user)
        
        user.activities.append(new_book)
        db.session.add(new_book)
        db.session.commit()
    
    elif (type_ == 'movie'):
        movie_id = request.json['movie_id']
        movie_href = request.json['href']
        movie_title = request.json['movie_title']
        movie_release_date = request.json['movie_release_date']
        movie_rating = request.json['movie_rating']
        movie_genre_ids = request.json['movie_genre_ids']
        movie_overview = request.json['movie_overview']
        movie_img_src = request.json['movie_img_src']

        new_movie = Movie(movie_id=movie_id, movie_title=movie_title, href=movie_href,
                        movie_release_date=movie_release_date, movie_rating=movie_rating,
                        movie_img_src=movie_img_src, movie_overview=movie_overview, users=user)
        
        # for g_id in movie_genre_ids:
        #     g_name = genres['movie_genres'][g_id]


        user.activities.append(new_movie)
        db.session.add(new_movie)
        db.session.commit()
    
    elif (type_ == 'tvshow'):
        tvshow_id = request.json['tvshow_id']
        tvshow_href = request.json['href']
        tvshow_title = request.json['tvshow_title']
        tvshow_release_date = request.json['tvshow_release_date']
        tvshow_rating = request.json['tvshow_rating']
        tvshow_genre_ids = request.json['tvshow_genre_ids']
        tvshow_overview = request.json['tvshow_overview']
        tvshow_img_src = request.json['tvshow_img_src']

        new_tvshow = TVShow(tvshow_id=tvshow_id, tvshow_title=tvshow_title, href=tvshow_href,
                        tvshow_release_date=tvshow_release_date, tvshow_rating=tvshow_rating,
                        tvshow_img_src=tvshow_img_src, tvshow_overview=tvshow_overview, users=user)

        user.activities.append(new_tvshow)
        db.session.add(new_tvshow)
        db.session.commit()

    message = 'successfully added a {} activity'.format(type_)
    return json.dumps({'status':'OK', 'message':message})

# @main.route("/static/<path:filename>")
# def staticfiles(filename):
#     return send_from_directory(app.config["STATIC_FOLDER"], filename)

