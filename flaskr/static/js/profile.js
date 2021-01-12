$(document).ready(function() {
    $(".remove-book-btn").click(function() {
        const book_id = $(this).attr('id').split('-').pop()
        const data = {
            type: "book",
            book_id: book_id
        }
        $.ajax({
            url: '/delete-activity',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(resp) {
                document.getElementById("tr-" + book_id).remove();
                if (document.getElementById("book-content-body").innerHTML.trim() == "") {
                    document.getElementById("empty-book-collection-message").removeAttribute("hidden");
                }
                console.log(resp);
            },
            error: function(err) {
                console.log(err);
            }
        })
    })

    $(".remove-movie-btn").click(function() {
        const movie_id = $(this).attr('id').split('-').pop()
        const data = {
            type: "movie",
            movie_id: movie_id
        }
        $.ajax({
            url: '/delete-activity',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(resp) {
                document.getElementById("card-" + movie_id).remove();

                const elem = `<p hidden="" id="empty-movie-collection-message"> You don't have any saved movies :( <br> Go get <a href="/view-all/movies">one</a> now!</p>`
                if (document.getElementById("movie-content").innerHTML.trim() == elem) {
                    document.getElementById("empty-movie-collection-message").removeAttribute("hidden");
                }
                console.log(resp);
            },
            error: function(err) {
                console.log(err);
            }
        })
    })
    
    // $("#movie-modal-" + movieId).click(function() {
    //     showMovieModalDetail(movie);
    // });

    $(".activity-modal-btn").click(function() {
        const div_id = $(this).attr('id').split('-');
        const activity_type = div_id[0];
        const activity_id = div_id[2];

        let activity = document.getElementById(activity_type+"-"+activity_id).value;
        activity = activity.replace(/'/g, '"');
        const json = JSON.parse(activity)

        showActivityModalDetail(activity_type, json);
    });

    function showActivityModalDetail(type, activity) {
        // const detailModal = document.getElementById('detailModal')
        if (type == "movie") {
            $('#detailModalTitle').text("Movie Details");
            $('#detailModalBodyTitle').text(activity['movie_title']);
            $('#detailModalRelease').text("Released at " + activity['movie_release_date']);
            $('#detailModalOverview').text(activity['movie_overview']);
            $('#detailModalRating').text(activity['movie_rating']+"%");
            $('#detailModalImg').attr('src', activity['movie_img_src']);
    
            $('#detailModalGenres').empty();
            for (idx in activity['movie_genre_names']) {
                let g_name = activity['movie_genre_names'][idx];
                $('#detailModalGenres').append(`<span class="badge badge-primary genre-badge">${g_name}</span>`);
            }
        } else if (type == "tvshow") {
            // console.log(typeof activity)
            $('#detailModalTitle').text("TV Show Details");
            $('#detailModalBodyTitle').text(activity['tvshow_title']);
            $('#detailModalRelease').text("Released at " + activity['tvshow_release_date']);
            $('#detailModalOverview').text(activity['tvshow_overview']);
            $('#detailModalRating').text(activity['tvshow_rating']+"%");
            $('#detailModalImg').attr('src', activity['tvshow_img_src']);

            $('#detailModalGenres').empty();
            for (idx in activity['tvshow_genre_names']) {
                let g_name = activity['tvshow_genre_names'][idx];
                $('#detailModalGenres').append(`<span class="badge badge-primary genre-badge">${g_name}</span>`);
            }
        }
        
        $('#detailModalMoreDetails').attr('href', activity['href']);

        $('#detailModal').modal('show');

        // Find al rating items
        // const ratings = document.querySelectorAll(".movie-rating");
        const rating = document.getElementById("detailModalRating")

        // Get content and get score as an int
        const ratingContent = rating.innerHTML;
        const ratingScore = parseInt(ratingContent, 10);

        // Define if the score is good, meh or bad according to its value
        const scoreClass =
            ratingScore < 40 ? "bad" : ratingScore < 60 ? "meh" : "good";

        rating.classList.remove("bad", "meh", "good"); 
        // Add score class to the rating
        rating.classList.add(scoreClass);

        // After adding the class, get its color
        const ratingColor = window.getComputedStyle(rating).color;

        // Define the background gradient according to the score and color
        const gradient = `background: conic-gradient(${ratingColor} ${ratingScore}%, transparent 0 100%)`;

        // Set the gradient as the rating background
        rating.setAttribute("style", gradient);

        // Wrap the content in a tag to show it above the pseudo element that masks the bar
        rating.innerHTML = `<span>${ratingScore} ${
                            ratingContent.indexOf("%") >= 0 ? "<small>%</small>" : ""
                        }</span>`;
    }
});