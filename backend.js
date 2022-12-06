const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const app = express();

// Use cors module to set CORS to allow requests from https://chat.openai.com only
app.use(cors({
    origin: 'https://chat.openai.com'
}));

// Set ratelimiting for get_code route to 1 request per 10 seconds
const getCodeLimiter = rateLimit({
    windowMs: 10 * 1000, // 30 seconds
    max: 1,
    message: 'Too many requests, please try again in a bit'
});

app.get('/get_code', getCodeLimiter, (req, res) => {
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
            if (response.data.user_code && response.data.device_code) {
                // Return user_code and device_code to user
                res.status(200).send({
                    user_code: response.data.user_code,
                    device_code: response.data.device_code
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

app.listen(3000, () => console.log('Server listening on port 3000'));
