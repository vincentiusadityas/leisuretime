$(document).ready(function() {
    let page = "1";
    let totalPages;

    const mainContent = document.getElementById("tvshow-content");

    // search form elements
    const form = document.getElementById("search-form");
    const search = document.getElementById("search");

    // page indicator
    const tvshowPage = document.getElementById("tvshow-pages")

    // pagination elements
    const pageLinks = document.querySelectorAll(".page-link");

    // genres_id
    let genres_id = [];

    // initially get the most popular tv shows list's first page
    getTVShows(page);

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
            if (pageLink.id === "next" && page < totalPages) {
                page++;
                if (search.value) {
                    getTVShows(page, search.value)
                } else if (genres_id) {
                    getTVShows(page, '', genres_id)
                } else {
                    getTVShows(page);
                }
            }
            if (pageLink.id === "previous" && page > 1) {
                page--;
                if (search.value) {
                    getTVShows(page, search.value)
                } else if (genres_id) {
                    getTVShows(page, '', genres_id)
                } else {
                    getTVShows(page);
                }
            }
        });
    });

    // search for a tv show
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        page = 1;
        const query = search.value;
        resetFilter();
        if (query) {
            resetFilter();
            getTVShows(page, query, []);
        } else {
            if (query == "") {
                getTVShows(page);
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
        
        getTVShows(page, '', genres_id);
    })

    async function getTVShows(page=1, query="", genres=[]) {
        $('body').toggleClass('loading');

        const data = { "page": page, "query": query, "genres": genres }
        $.ajax({
                url: '/view-tvshows',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(resp) {
                    totalPages = resp.total_pages
                    showTVShows(resp.tvshows, resp.page, resp.total_pages);
                    $('body').toggleClass('loading');
                },
                error: function(err) {
                    console.log(err);
                }
            })
    }

    function removeTVShowFromDB(tvshow) {
        const data = {
            type: "tvshow",
            tvshow_id: tvshow.tvshow_id
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

    function saveTVShowToDB(tvshow) {
        const data = {
            type: "tvshow",
            href: tvshow.href,
            tvshow_id: tvshow.tvshow_id,
            tvshow_title: tvshow.tvshow_title,
            tvshow_release_date: tvshow.tvshow_release_date,
            tvshow_rating: tvshow.tvshow_rating,
            tvshow_genre_ids: tvshow.tvshow_genre_ids,
            tvshow_genre_names: tvshow.tvshow_genre_names,
            tvshow_overview: tvshow.tvshow_overview,
            tvshow_img_src: tvshow.tvshow_img_src
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

    function showTVShowModalDetail(tvshow) {

        $('#detailModalTitle').text("TV Show Details");
        $('#detailModalBodyTitle').text(tvshow['tvshow_title']);
        $('#detailModalRelease').text("Released at " + tvshow['tvshow_release_date']);
        $('#detailModalOverview').text(tvshow['tvshow_overview']);
        $('#detailModalRating').text(tvshow['tvshow_rating']+"%");
        $('#detailModalImg').attr('src', tvshow['tvshow_img_src']);

        $('#detailModalGenres').empty();
        for (idx in tvshow['tvshow_genre_names']) {
            let g_name = tvshow['tvshow_genre_names'][idx];
            $('#detailModalGenres').append(`<span class="badge badge-primary genre-badge">${g_name}</span>`);
        }
        
        $('#detailModalMoreDetails').attr('href', tvshow['href']);

        $('#detailModal').modal('show');

        // Find al rating items
        // const ratings = document.querySelectorAll(".tvshow-rating");
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

    function showTVShows(tvshows, page=1, total_pages) {
        mainContent.innerHTML = "";

        tvshowPage.innerHTML = `Page ${page} out of <span id="total-pages">${total_pages}</span>`;
        // const totalPage = document.createTextNode(total_pages);
        // totalPageSpan.appendChild(totalPage)
        // tvshowPage.childNodes[0].nodeValue = total_pages

        tvshows.forEach((tvshow) => {
            const tvshowId = tvshow.tvshow_id;
            const tvshowTitle = tvshow.tvshow_title;
            const tvshowPoster = tvshow.tvshow_img_src;
            const tvshowVote = tvshow.tvshow_rating;
            const tvshowElm = document.createElement("div");
            const tvshowHref = tvshow.href;
            tvshowElm.classList.add(
                "col-xs-12",
                "col-sm-6",
                "col-md-4",
                "col-lg-3",
                "p-0"
            );
            tvshowElm.innerHTML = `
            <div class="tvshow-card">
                <div class="tvshow-img-content">
                    <div class="content-overlay"></div>
                    <img
                        class="img-fluid tvshow-img"
                        src="${tvshowPoster}"
                        onError="this.onerror=null;this.src='https://i.ebayimg.com/images/g/1EMAAMXQdGJR2-n3/s-l1600.jpg';"
                        alt="Sorry, something went wrong"
                    />
                    <div class="content-details fadeIn-bottom">
                        <h3 class="content-title" id="content-title-${tvshowId}">save show</h3>
                        <p class="content-text" class="content-text" id="content-text-${tvshowId}">Click the heart to save this show</p>
                        <a id="icon-${tvshowId}" class="heart-icon" title="Save Show">
                            <i class="fa fa-heart-o"></i>
                        </a>
                    </div>
                </div>
                <div class="row tvshow-description p-3 d-flex justify-content-between align-items-center">
                    <div class="col-md-12">
                    <a id="tvshow-modal-${tvshowId}" data-toggle="modal"  href="">   
                        <h3 class="tvshow-title">${tvshowTitle}</h3>
                    </a>
                    </div>
                    <div class="col-md-12">
                    <h3 class="tvshow-vote">${tvshowVote}</h3>
                    </div>
                </div>
            </div>`;
            mainContent.appendChild(tvshowElm);

            if (tvshow.saved == '1') {
                $("#icon-" + tvshowId).html('<i class="fa fa-heart" aria-hidden="true"></i>');
                $("#icon-" + tvshowId).addClass("liked");
                $("#content-title-" + tvshowId).text("show saved")
                $("#content-text-" + tvshowId).text("Click the heart to unsave this show")
            }

            $("#icon-" + tvshowId).click(function() {
                if ($("#icon-" + tvshowId).hasClass("liked")) {
                    $("#icon-" + tvshowId).html('<i class="fa fa-heart-o" aria-hidden="true"></i>');
                    $("#icon-" + tvshowId).removeClass("liked");
                    removeTVShowFromDB(tvshow)
                    $("#content-title-" + tvshowId).text("save show")
                    $("#content-text-" + tvshowId).text("Click the heart to save this show")
                } else {
                    $("#icon-" + tvshowId).html('<i class="fa fa-heart" aria-hidden="true"></i>');
                    $("#icon-" + tvshowId).addClass("liked");
                    saveTVShowToDB(tvshow)
                    $("#content-title-" + tvshowId).text("show saved")
                    $("#content-text-" + tvshowId).text("Click the heart to unsave this show")
                }
            });

            $("#tvshow-modal-" + tvshowId).click(function() {
                showTVShowModalDetail(tvshow);
            });
        });
    }
});