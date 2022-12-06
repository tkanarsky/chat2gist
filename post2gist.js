// Submit new gist to GitHub

(function() {
    let getCodes = () => {
        fetch("chat2gist.tkanarsky.com/get_code", {
            method: 'GET',
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Couldn't fetch Github auth code. Try again in a bit.");
        }).then(data => {
            return data;
        }).catch((error) => {
            alert(error.message);
        });
    }
    
    let getToken = () => {
        const token = localStorage.getItem('chat2gist_token');
        if (token) {
            return token;
        } 
        // Send POST request to https://github.com/login/device/code
        // with client_id=f3c4ae94e8621360c6d8
        // and scope=gist
        // and get back a JSON object with device_code, user_code, verification_uri, expires_in, interval
        // and display user_code and verification_uri to user
        // and poll
        //

       
    };

    // Determine if OAuth token is in local storage.
    var token = localStorage.getItem('chat2gist_token');
    if (token) {
        // If so, use token to create gist.
        createGist(token);
    }

})();