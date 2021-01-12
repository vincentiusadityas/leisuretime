$(document).ready(function() {
    // THIS API KEY IS NO LONGER ACTIVE
    const GOODREAD_API_KEY = "FzGldfU37IpDe8ksTmc2w"
    const GOODREAD_API_SEARCH = "https://www.goodreads.com/search/index.xml?"

    // search form elements
    const form = document.getElementById("search-form");
    const search = document.getElementById("search");
    var mainContent = document.getElementById("book-content-body");

    const prevMainContent = document.getElementById("book-content-table");
    const oldContent = prevMainContent.innerHTML;

    // search for a book
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const params = { key: GOODREAD_API_KEY, q: search.value };
        const query = jQuery.param(params);


        if (search.value) {
            getBooks(GOODREAD_API_SEARCH + query);
        } else {
            if (search.value == "") {
                prevMainContent.innerHTML = "";

                const bookElem = document.createElement("tbody");
                bookElem.setAttribute("id", "book-content-body");
                bookElem.innerHTML = oldContent
                prevMainContent.appendChild(bookElem);
            }
        }
    });

    async function getBooks(api) {
        // const resp = await fetch(url, { mode: 'cors' });
        const data = { url: api }
        $('body').toggleClass('loading');
        $.ajax({
            type: 'POST',
            url: '/search-book',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                const books = response['books']
                showBooks(books);
                $('body').toggleClass('loading');

            },
            error: function(error) {
                console.log(error)
            }
        })
    }

    function showBooks(books) {
        mainContent = document.getElementById("book-content-body");
        mainContent.innerHTML = "";
        books.forEach((book) => {
            const book_id = book.book_id;
            const img = book.img;
            const img_small = book.img_small;
            const title = book.title;
            const href = book.href;
            const ratingElem = book.ratingElem;
            const author = book.author;

            const bookElem = document.createElement("tr");

            bookElem.innerHTML = `
            <td class="book-cover-td">
                <img class="img-cover-small" src="${img}">
            </td>
            <td>
                <div class="book-description">
                    <a href="${href}" , target="_blank" style="color:black;">
                        <p class="title ">${title}
                            <span class="author ">by ${author}</span>
                        </p>
                    </a>
                    <div class="book-rating-table">
                        ${ratingElem}
                    </div>
                </div>
            </td>
            <td>
                <button id="save-book-btn-${book_id}" class="save-book-btn">
                    <span>SAVE BOOK</span>
                </button>
            </td>`;

            mainContent.appendChild(bookElem);

            $("#save-book-btn-" + book_id).click(function() {
                if ($(this).hasClass("saved")) {
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
                            console.log(resp);
                        },
                        error: function(err) {
                            console.log(err);
                        }
                    })
                    $(this).removeClass("saved");
                    $(this).text("SAVE BOOK")
                } else {
                    const data = {
                        type: "book",
                        book_id: book_id,
                        href: href,
                        book_author: author,
                        book_title: title,
                        book_rating_elem: ratingElem,
                        book_img_src: img,
                        book_img_src_small: img_small
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
                    $(this).addClass("saved");
                    $(this).text("BOOK SAVED")
                }
            });
        });
    }

    $(".save-book-btn").click(function() {
        
        book_id = $(this).attr('id').split('-').pop()
        
        if ($(this).hasClass("saved")) {
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
                    console.log(resp);
                },
                error: function(err) {
                    console.log(err);
                }
            })
            $(this).removeClass("saved");
            $(this).text("SAVE BOOK")
        } else {
            const data = {
                type: "book",
                book_id: book_id,
                href: document.getElementById("href-" + book_id).value,
                book_author: document.getElementById("author-" + book_id).value,
                book_title: document.getElementById("title-" + book_id).value,
                book_rating_elem: document.getElementById("ratingElem-" + book_id).innerHTML,
                book_img_src: document.getElementById("img-" + book_id).value,
                book_img_src_small: document.getElementById("img_small-" + book_id).value
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
            $(this).addClass("saved");
            $(this).text("BOOK SAVED")
        }
    });
});