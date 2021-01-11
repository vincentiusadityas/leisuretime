from flask import Blueprint, render_template, redirect, url_for, request, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from .models import User
from . import db

#Auth configuration
auth = Blueprint('auth', __name__)

#Render signup page
@auth.route('/signup')
def signup_page():
    if current_user.is_authenticated:
        return redirect(url_for('main.activities'))
    return render_template('signup.html')

#Route to sign up a new user
@auth.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')
    password = request.form.get('password')

    # check if user already in database
    user = User.query.filter_by(email=email).first() 
    
    if user:   
        flash(['signup-error','Email address already exists'])
        return redirect(url_for('auth.signup'))

    # create new user with the form data with hashed password
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(email=email, firstname=firstname, lastname=lastname, password=hashed_password)

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    flash(['signup-success','Sign up success! Please try logging in.'])
    return redirect(url_for('auth.login'))

#Render login page
@auth.route('/login')
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('main.activities'))
    return render_template('login.html')

#Route to login a user
@auth.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    remember = True if request.form.get('remember') else False

    user = User.query.filter_by(email=email).first()

    # check if user actually exists and the password is correct
    if not user or not check_password_hash(user.password, password): 
        flash(['login-error','Incorrect email/password. Please try again.'])
        return redirect(url_for('auth.login')) # if user doesn't exist or password is wrong, reload the page

    login_user(user, remember=remember)
    return redirect(url_for('main.activities'))

@auth.route('/logout')
@login_required
def logout():
    # fb_auth.signOut()
    logout_user()
    return redirect(url_for('main.index'))