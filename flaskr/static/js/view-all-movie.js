$(document).ready(function() {
    let page = "1";
    let totalPages;

    const mainContent = document.getElementById("movie-content");

    // search form elements
    const form = document.getElementById("search-form");
    const search = document.getElementById("search");

    // page indicator
    const moviePage = document.getElementById("movie-pages")

    // pagination elements
    const pageLinks = document.querySelectorAll(".page-link");

    // genres_id
    let genres_id = [];

    // initially get the most popular movies list's first page
    // getMovies(API_DISCOVER_MOVIE + page);
    getMovies(page);

    function resetFilter() {
        genres_id = []
        genre_checkboxes = document.getElementsByName('genre-checkbox');
        for (let i=0; i<genre_checkboxes.length; i++) {
            genre_checkboxes[i].checked = false;
        }
    }

    // previous and next page
    pageLinks.forEach((pageLink) => {
        pageLink.addEventListener("click", () => {
            console.log(totalPages)
            if (pageLink.id === "next" && page < totalPages) {
                page++;
                // getMovies(API_DISCOVER_MOVIE + page);
                if (search.value) {
                    getMovies(page, search.value)
                } else if (genres_id) {
                    getMovies(page, '', genres_id)
                } else {
                    getMovies(page);
                }
            }
            if (pageLink.id === "previous" && page > 1) {
                page--;
                // getMovies(API_DISCOVER_MOVIE + page);
                if (search.value) {
                    getMovies(page, search.value)
                } else if (genres_id) {
                    getMovies(page, '', genres_id)
                } else {
                    getMovies(page);
                }
            }
        });
    });

    // search for a movie
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        page = 1;
        const query = search.value;
        resetFilter();
        // console.log(query)
        if (query) {
            resetFilter();
            getMovies(page, query, []);
        } else {
            if (query == "") {
                console.log("hahaha")
                getMovies(page);
            }
        }
    });

    const reset_filter_btn = document.getElementsByClassName("reset-filter")[0];
    reset_filter_btn.addEventListener("click", (e) => {
        e.preventDefault();
        resetFilter();
    })

    const apply_filter_btn = document.getElementsByClassName("apply-filter")[0];
    apply_filter_btn.addEventListener("click", (e) => {
        e.preventDefault()
        genre_checkboxes = document.getElementsByName('genre-checkbox');
        search.value = ""
        genres_id = []
        for (let i=0; i<genre_checkboxes.length; i++) {
            if (genre_checkboxes[i].checked) {
                genres_id.push(genre_checkboxes[i].value)
            }
        }
        // console.log(checkboxes_id)
        getMovies(page, '', genres_id);
    })

    // async function getMovies(url) {
    //     $('body').toggleClass('loading');
    //     const resp = await fetch(url);
    //     const respData = await resp.json();

    //     const data = { "data": respData.results }

    //     $.ajax({
    //             url: '/check-saved-activity',
    //             type: 'POST',
    //             dataType: 'json',
    //             contentType: 'application/json',
    //             data: JSON.stringify(data),
    //             success: function(resp) {
    //                 console.log(resp.status);
    //                 showMovies(resp.movies);
    //                 $('body').toggleClass('loading');
    //             },
    //             error: function(err) {
    //                 console.log(err);
    //             }
    //         })
    // }

    async function getMovies(page=1, query="", genres=[]) {
        $('body').toggleClass('loading');

        const data = { "page": page, "query": query, "genres": genres }
        console.log(data)
        $.ajax({
                url: '/view-movies',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(resp) {
                    console.log(resp.movies);
                    totalPages = resp.total_pages
                    showMovies(resp.movies, resp.page, resp.total_pages);
                    $('body').toggleClass('loading');
                },
                error: function(err) {
                    console.log(err);
                }
            })
    }

    function removeMovieFromDB(movie) {
        const data = {
            type: "movie",
            movie_id: movie.movie_id
        }
        $.ajax({
            url: '/delete-activity',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(resp) {
                console.log(resp);
            },
            error: function(err) {
                console.log(err);
            }
        })
    }

    function saveMovieToDB(movie) {
        console.log(movie)
        const data = {
            type: "movie",
            href: movie.href,
            movie_id: movie.movie_id,
            movie_title: movie.movie_title,
            movie_release_date: movie.movie_release_date,
            movie_rating: movie.movie_rating,
            movie_img_src: movie.movie_img_src
        }
        $.ajax({
            url: '/save-activity',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(resp) {
                console.log(resp);
            },
            error: function(err) {
                console.log(err);
            }
        })
    }

    function showMovieModalDetail(movie) {
        // const detailModal = document.getElementById('detailModal')
        console.log(movie)
        $('#detailModalBodyTitle').text("Movie Details");
        $('#detailModalTitle').text(movie['movie_title']);
        $('#detailModalRelease').text("Released at " + movie['movie_release_date']);
        $('#detailModalOverview').text(movie['movie_overview']);
        $('#detailModalRating').text(movie['movie_rating']+"%");
        $('#detailModalImg').attr('src', movie['movie_img_src']);

        $('#detailModalGenres').empty();
        for (idx in movie['movie_genre_names']) {
            let g_name = movie['movie_genre_names'][idx];
            $('#detailModalGenres').append(`<span class="badge badge-primary genre-badge">${g_name}</span>`);
        }
        
        $('#detailModalMoreDetails').attr('href', movie['href']);

        $('#detailModal').modal('show');
        // detailModal.

        // Find al rating items
        // const ratings = document.querySelectorAll(".movie-rating");
        const rating = document.getElementById("detailModalRating")

        // // Iterate over all rating items
        // ratings.forEach((rating) => {
            // Get content and get score as an int
            const ratingContent = rating.innerHTML;
            console.log(ratingContent)
            const ratingScore = parseInt(ratingContent, 10);

            // Define if the score is good, meh or bad according to its value
            const scoreClass =
                ratingScore < 40 ? "bad" : ratingScore < 60 ? "meh" : "good";

            rating.classList.remove("bad", "meh", "good"); 
            // Add score class to the rating
            rating.classList.add(scoreClass);

            // After adding the class, get its color
            const ratingColor = window.getComputedStyle(rating).color;
            console.log("ratingColor:", ratingColor)

            // Define the background gradient according to the score and color
            const gradient = `background: conic-gradient(${ratingColor} ${ratingScore}%, transparent 0 100%)`;

            // Set the gradient as the rating background
            rating.setAttribute("style", gradient);

            // Wrap the content in a tag to show it above the pseudo element that masks the bar
            rating.innerHTML = `<span>${ratingScore} ${
                                ratingContent.indexOf("%") >= 0 ? "<small>%</small>" : ""
                            }</span>`;
        // });
    }


    

    function showMovies(movies, page=1, total_pages) {
        mainContent.innerHTML = "";

        moviePage.innerHTML = `Page ${page} out of <span id="total-pages">${total_pages}</span>`;
        // const totalPage = document.createTextNode(total_pages);
        // totalPageSpan.appendChild(totalPage)
        // moviePage.childNodes[0].nodeValue = total_pages

        console.log("MOVIES:", movies)
        movies.forEach((movie) => {
            const movieId = movie.movie_id;
            const movieTitle = movie.movie_title;
            const moviePoster = movie.movie_img_src;
            const movieVote = movie.movie_rating;
            const movieElm = document.createElement("div");
            const movieHref = movie.href;
            movieElm.classList.add(
                "col-xs-12",
                "col-sm-6",
                "col-md-4",
                "col-lg-3",
                "p-0"
            );
            movieElm.innerHTML = `
            <div class="movie-card">
                <div class="movie-img-content">
                    <div class="content-overlay"></div>
                    <img
                        class="img-fluid movie-img"
                        src="${moviePoster}"
                        onError="this.onerror=null;this.src='https://i.ebayimg.com/images/g/1EMAAMXQdGJR2-n3/s-l1600.jpg';"
                        alt="Sorry, something went wrong"
                    />
                    <div class="content-details fadeIn-bottom">
                        <h3 class="content-title" id="content-title-${movieId}">save movie</h3>
                        <p class="content-text" class="content-text" id="content-text-${movieId}">Click the heart to save this movie</p>
                        <a id="icon-${movieId}" class="heart-icon" title="Save Movie">
                            <i class="fa fa-heart-o"></i>
                        </a>
                    </div>
                </div>
                <div class="row movie-description p-3 d-flex justify-content-between align-items-center">
                    <div class="col-md-12">
                    <a id="movie-modal-${movieId}" data-toggle="modal"  href="">   
                        <h3 class="movie-title">${movieTitle}</h3>
                    </a>
                    </div>
                    <div class="col-md-12">
                    <h3 class="movie-vote">${movieVote}</h3>
                    </div>
                </div>
            </div>`;
            mainContent.appendChild(movieElm);

            if (movie.saved == '1') {
                $("#icon-" + movieId).html('<i class="fa fa-heart" aria-hidden="true"></i>');
                $("#icon-" + movieId).addClass("liked");
                $("#content-title-" + movieId).text("movie saved")
                $("#content-text-" + movieId).text("Click the heart to unsave this movie")
            }

            $("#icon-" + movieId).click(function() {
                if ($("#icon-" + movieId).hasClass("liked")) {
                    $("#icon-" + movieId).html('<i class="fa fa-heart-o" aria-hidden="true"></i>');
                    $("#icon-" + movieId).removeClass("liked");
                    removeMovieFromDB(movie);
                    $("#content-title-" + movieId).text("save movie")
                    $("#content-text-" + movieId).text("Click the heart to save this movie")
                } else {
                    $("#icon-" + movieId).html('<i class="fa fa-heart" aria-hidden="true"></i>');
                    $("#icon-" + movieId).addClass("liked");
                    saveMovieToDB(movie);
                    $("#content-title-" + movieId).text("movie saved")
                    $("#content-text-" + movieId).text("Click the heart to unsave this movie")
                }
            });

            $("#movie-modal-" + movieId).click(function() {
                showMovieModalDetail(movie);
            });
        });
    }
});