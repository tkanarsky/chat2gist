const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const app = express();
app.set('trust proxy', 1);

// Use cors module to set CORS to allow requests from https://chat.openai.com only
app.use(cors({
    origin: 'https://chat.openai.com'
}));

// Set ratelimiting for get_code route to 1 request per 10 seconds
const rateLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 1,
    message: 'Too many requests, please try again in a bit'
});

const jsonParser = bodyParser.json();

app.get('/get_code', rateLimiter, (req, res) => {
    // Send POST request to https://github.com/login/device/code with required parameters
    axios.post('https://github.com/login/device/code', {
        client_id: 'f3c4ae94e8621360c6d8',
        scope: 'gist'
    }, {
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log(response.data);
            // Check if user_code and device_code are present in response
            if (response.data) {
                // Return user_code and device_code to user
                res.status(200).send({
                    user_code: response.data.user_code,
                    device_code: response.data.device_code,
                    interval: response.data.interval
                });
            } else {
                // Return error 500 if user_code is not present
                res.status(500).send({ error: 'user_code not found' });
            }
        })
        .catch(error => {
            // Return error from Github API to user
            res.status(error.response.status).send(error.response.data);
        });
});

app.post('/get_token', jsonParser, rateLimiter, (req, res) => {
    // Get the device_code from the request body
    console.log(req.body);
    const deviceCode = req.body.device_code;
    const interval = req.body.interval;

    // Set timeout for polling the Github API
    const timeout = setTimeout(() => {
        // Return error if timeout is reached
        res.status(500).send({ error: 'Timeout reached' });
    }, 90 * 1000); // 90 seconds

    // Poll the Github API until successful response is received
    const pollAccessToken = () => {
        // Send POST request to https://github.com/login/oauth/access_token with required parameters and Accept: application/json header
        axios.post('https://github.com/login/oauth/access_token', {
            client_id: 'f3c4ae94e8621360c6d8',
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        }, {
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                // Set 'Content-Type' header to accept application/json
                res.set('Content-Type', 'application/json');

                // Check if access_token is present in response
                if (response.data.access_token) {
                    clearTimeout(timeout);
                    // Return access_token to user
                    res.status(200).send({ access_token: response.data.access_token });
                } else {
                    // Poll again after the interval specified in the response
                    setTimeout(pollAccessToken, interval * 1000);
                }
            })
            .catch(error => {
                // Set 'Content-Type' header to accept application/json
                res.set('Content-Type', 'application/json');

                // Return error from Github API to user
                res.status(error.response.status).send(error.response.data);
            });
    };

    // Start polling the Github API
    pollAccessToken();
});

app.listen(3000, () => console.log('Server listening on port 3000'));
