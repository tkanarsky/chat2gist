# chat2gist

Export your ChatGPT conversations as Github Gists

Features [full markdown support](https://gist.github.com/tkanarsky/8858d339f02567d5cd25fcf9c42911e2)!

Just copy the contents of bookmarklet.js into a bookmark in your browser.

I wanted the authentication flow to be entirely client-side, but Github's OAuth API does not set CORS allow-origin header. Therefore, I had to make a small backend that would proxy requests to the Github API without running into CORS issues.

(Bonus Markdown chessboard -- [how cool is that?](https://gist.github.com/tkanarsky/178952ff3b81ceed11e6ad367b9a2899))

Enjoy!
