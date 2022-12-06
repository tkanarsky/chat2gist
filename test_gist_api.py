import requests
import time

# Set the client ID and scope for your application
client_id = 'f3c4ae94e8621360c6d8'
scope = 'gist'

# Set the URL for the POST request
url = 'https://github.com/login/device/code'

# Set the parameters for the POST request
params = {'client_id': client_id, 'scope': scope}

# Send the POST request
response = requests.post(url, params=params)

# Check the response status code
if response.status_code == 200:
    # If the request was successful, parse the JSON response
    print(response.text)
    response_json = response.json()

    # Extract the device code, user code, verification URI, and other values from the JSON response
    device_code = response_json['device_code']
    user_code = response_json['user_code']
    verification_uri = response_json['verification_uri']
    expires_in = response_json['expires_in']
    interval = response_json['interval']

    # Display the user code and verification URI to the user
    print(f'Please visit {verification_uri} and enter the code {user_code}')

    # Poll the API periodically to check if the user has authenticated successfully
    while True:
        # Set the URL for the polling request
        polling_url = 'https://github.com/login/oauth/access_token'

        # Set the parameters for the polling request
        polling_params = {'client_id': client_id, 'device_code': device_code}

        # Send the polling request
        polling_response = requests.post(polling_url, params=polling_params)

        # Check the polling response status code
        if polling_response.status_code == 200:
            # If the request was successful, parse the JSON response
            polling_response_json = polling_response.json()

            # Check if the user has authenticated successfully
            if 'access_token' in polling_response_json:
                # If the user has authenticated, extract the access token from the JSON response
                access_token = polling_response_json['access_token']

                # Use the access token to access the user's gists
                gists_url = 'https://api.github.com/gists'
                gists_headers = {'Authorization': f'Bearer {access_token}'}
                gists_response = requests.get(gists_url, headers=gists_headers)

                # Print the user's gists
                print(gists_response.json())
                break
            elif 'error' in polling_response_json:
                # If there was an error, print the error message
                print(polling_response_json['error'])
                break
            else:
                # If the user has not yet authenticated, wait for the specified interval before polling again
                time.sleep(interval)
        else:
            # If the request failed, print the error message
            print(polling_response.text)
            break
else:
    # If the initial request failed, print the error message
    print(response.text)