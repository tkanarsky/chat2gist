// Submit new gist to GitHub

(function () {
   






    // Determine if OAuth token is in local storage.
    var token = localStorage.getItem('chat2gist_token');
    if (token) {
        // If so, use token to create gist.
        createGist(token);
    }


})();