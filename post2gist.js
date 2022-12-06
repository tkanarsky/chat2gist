// Submit new gist to GitHub

(function() {
    let getCodes = (callback) => {
        fetch("https://chat2gist.tkanarsky.com/get_code", {
            method: 'GET',
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Couldn't fetch Github auth code. Try again in a bit.");
        }).then(data => {
            callback(data);
        }).catch((error) => {
            alert(error.message);
        });
    }
    
    let fetchToken = (device_code, interval, callback) => {
        fetch("https://chat2gist.tkanarsky.com/get_token", {
            method: 'POST',
            body: JSON.stringify({
                device_code: device_code,
                interval: interval
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Couldn't fetch Github auth token. Try again in a bit.");
        }).then(data => {
            callback(data);
        }).catch((error) => {
            alert(error.message);
        });
    };




    // Determine if OAuth token is in local storage.
    var token = localStorage.getItem('chat2gist_token');
    if (token) {
        // If so, use token to create gist.
        createGist(token);
    }
    
    
})();