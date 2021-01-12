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
});