import requests
import json
from datetime import datetime
from bs4 import BeautifulSoup
from flask import Markup
from flask_login import current_user
from .models import *
from . import db

TMDB_API_KEY = "cf2cf097b666e6ab18b62a58db2ff0ef"

def bookScrapper():
    books = []

    URL = 'https://www.goodreads.com/list/popular_lists'
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')
    results = soup.find(id='topRow')
    links = results.find_all('a', class_='listTitle')

    # get the top list (most popular list)
    URL2 = 'https://www.goodreads.com' + links[0]['href']
    page2 = requests.get(URL2)
    soup = BeautifulSoup(page2.content, 'html.parser')
    results = soup.find(id='all_votes')
    tr_list = results.find_all('tr') if results else []

    # print(tr_list[0])
    for tr in tr_list:
        book_id = tr.find('input', {'id': 'book_id'}).get('value')
        img_elem = tr.find('img', class_='bookCover')
        title_elem = tr.find('a', class_='bookTitle')
        rating_elem = Markup(tr.find('span', class_='greyText smallText uitext'))
        author_elem = tr.find('a', class_='authorName')
        href = 'https://www.goodreads.com' + title_elem['href']

        split = img_elem['src'].split('/')
        convert1 = split[-2].replace('i','l')
        convert2 = split[-1].split('.')
        convert2.pop(1)
        convert2 = '.'.join(convert2)
        split[-2] = convert1
        split[-1] = convert2
        # rejoin
        img_src = '/'.join(split)

        

        a_book = {"book_id": book_id,
                  "img": img_src,
                  "img_small": img_elem['src'],
                  "title": title_elem.text,
                  "href": href,
                  "ratingElem": rating_elem,
                  "author": author_elem.text}
                #   "saved": saved}
        books.append(a_book)
    # print(books[0])
    return books

def getGenres():
    genres = {}
    API_MOVIE_GENRE = "https://api.themoviedb.org/3/genre/movie/list?api_key="+TMDB_API_KEY+"&language=en-US"
    API_TVSHOW_GENRE = "https://api.themoviedb.org/3/genre/tv/list?api_key="+TMDB_API_KEY+"&language=en-US"

    resp1 = requests.get(API_MOVIE_GENRE)
    resp2 = requests.get(API_TVSHOW_GENRE)
    json1 = resp1.json()
    json2 = resp2.json()

    genres["movie_genres"] = json1["genres"]
    genres["tvshow_genres"] = json2["genres"]
    return genres

genres = getGenres()

def getMovies(page=1, query="", selected_genres=[]):
    movies = []
    API_URL = "https://api.themoviedb.org/3/discover/movie?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=true&page="+str(page)
    IMAGE_PATH = "https://image.tmdb.org/t/p/w500"

    if query: 
        API_URL = "https://api.themoviedb.org/3/search/movie?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=true&query="+query+"&page="+str(page)
        # print("QUERY API_URL:", API_URL)

    if selected_genres:
        genres_str = "%2C%20".join(str(g) for g in selected_genres)
        API_URL = "https://api.themoviedb.org/3/discover/movie?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_adult=true&include_video=false&with_genres="+genres_str+"&page="+str(page)

    resp = requests.get(API_URL)
    movie_data = resp.json()
    
    # json_formatted = json.dumps(movie_data, indent=2)
    # print("movie_data", json_formatted)

    for movie in movie_data['results']:

        img_src = IMAGE_PATH + movie['poster_path'] if movie['poster_path'] else ""

        if ('release_date' in movie and movie['release_date']):
            release_date_f1 = datetime.strptime(movie['release_date'],'%Y-%m-%d')
            release_date_f2 = release_date_f1.strftime('%b %d, %Y')
        else:
            release_date_f2 = ''

        ratings = str(int(float(movie['vote_average'])*10))

        genre_names = []
        for genre in genres['movie_genres']:
            if genre['id'] in movie['genre_ids']:
                genre_names.append(genre['name'])

        a_movie = {"movie_img_src": img_src,
                   "movie_title": movie['original_title'],
                   "movie_overview": movie['overview'],
                   "movie_id": movie['id'],
                   "movie_release_date": release_date_f2,
                   "movie_genre_ids": movie['genre_ids'],
                   "movie_genre_names": genre_names,
                   "movie_rating": ratings,
                   "href": "https://www.themoviedb.org/movie/" + str(movie['id'])}
        movies.append(a_movie)
    
    # print(movies)
    return {"movies": movies, "page": page, "total_pages": movie_data['total_pages']}

def getTVShows(page=1, query="", selected_genres=[]):
    tvshows = []

    API_URL = "https://api.themoviedb.org/3/discover/tv?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_video=true&page="+str(page)
    IMAGE_PATH = "https://image.tmdb.org/t/p/w500"

    if query: 
        API_URL = "https://api.themoviedb.org/3/search/tv?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_video=true&query="+query+"&page="+str(page)
        # print("QUERY API_URL:", API_URL)

    if selected_genres:
        genres_str = "%2C%20".join(str(g) for g in selected_genres)
        API_URL = "https://api.themoviedb.org/3/discover/tv?api_key="+TMDB_API_KEY+"&language=en-US&sort_by=popularity.desc&include_video=false&with_genres="+genres_str+"&page="+str(page)


    resp = requests.get(API_URL)
    tvshow_data = resp.json()
    for tvshow in tvshow_data['results']:

        img_src = IMAGE_PATH + tvshow['poster_path'] if tvshow['poster_path'] else ""

        if (tvshow['first_air_date']):
            release_date_f1 = datetime.strptime(tvshow['first_air_date'],'%Y-%m-%d')
            release_date_f2 = release_date_f1.strftime('%b %d, %Y')
        else:
            release_date_f2 = ''

        ratings = str(int(float(tvshow['vote_average'])*10))

        genre_names = []
        for genre in genres['tvshow_genres']:
            if genre['id'] in tvshow['genre_ids']:
                genre_names.append(genre['name'])

        a_tv = {"tvshow_img_src": img_src,
                   "tvshow_title": tvshow['original_name'],
                   "tvshow_overview": tvshow['overview'],
                   "tvshow_id": tvshow['id'],
                   "tvshow_release_date": release_date_f2,
                   "tvshow_genre_ids": tvshow['genre_ids'],
                   "tvshow_genre_names": genre_names,
                   "tvshow_rating": ratings,
                   "href": "https://www.themoviedb.org/tv/" + str(tvshow['id'])}
        tvshows.append(a_tv)
    # print("LEN:", len(tvshows))
    return {"tvshows": tvshows, "page": page, "total_pages": tvshow_data['total_pages']}
