javascript: (function () {

    /* https://gist.github.com/styfle/c4bba2d29e6cb9b585de72207c006af7 */
    const tableToMarkdown = (doc) => {
        let s = '| ';

        let thead = doc.querySelector('thead');
        let headcells = thead.querySelectorAll('td, th');
        for (let i = 0; i < headcells.length; i++) {
            let cell = headcells[i];
            s += cell.textContent.trim() + ' | ';
        }

        s += '\n';

        for (let i = 0; i < headcells.length; i++) {
            s += '|---------';
        }

        s += '|\n';

        let tbody = doc.querySelector('tbody');
        let trs = tbody.querySelectorAll('tr');
        for (let i = 0; i < trs.length; i++) {
            s += '| ';
            let tr = trs.item(i);
            let tds = tr.querySelectorAll('td');
            for (let j = 0; j < tds.length; j++) {
                let td = tds.item(j);
                s += td.textContent.trim() + ' | ';
            }
            s += '\n';
        }
        return s;
    };

    /* https://gist.github.com/dvdbng/1762527 */
    const markdownEscape = (text) => {
        return text ? text.replace(/\s+/g, " ").replace(/[\\\-*_>#]/g, "\\$&") : '';
    };

    const repeat = (str, times) => {
        return (new Array(times + 1)).join(str);
    };

    const childsToMarkdown = (tree, mode) => {
        var res = "";
        for (var i = 0, l = tree.childNodes.length; i < l; ++i) {
            res += nodeToMarkdown(tree.childNodes[i], mode);
        }
        return res;
    };

    const nodeToMarkdown = (tree, mode) => {
        var nl = "\n\n";
        if (tree.nodeType == 3) {
            return markdownEscape(tree.nodeValue);
        } else if (tree.nodeType == 1) {
            if (mode == "block") {
                switch (tree.tagName.toLowerCase()) {
                    case "br":
                        return nl;
                    case "hr":
                        return nl + "---" + nl;
                    case "p":
                    case "div":
                    case "section":
                    case "address":
                    case "center":
                        return nl + childsToMarkdown(tree, "block") + nl;
                    case "ul":
                        return nl + childsToMarkdown(tree, "u") + nl;
                    case "ol":
                        return nl + childsToMarkdown(tree, "o") + nl;
                    case "pre":
                        return "```\n" + tree.querySelector("code").innerText + "```" + nl;

                    case "code":
                        if (tree.childNodes.length == 1) {
                            break;
                        }
                        return nl + "    " + childsToMarkdown(tree, "inline") + nl;
                    case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": case "h7":
                        return nl + repeat("#", +tree.tagName[1]) + "  " + childsToMarkdown(tree, "inline") + nl;
                    case "blockquote": {
                        let res = "";
                        for (let child in tree.childNodes) {
                            res += "\n> " + childsToMarkdown(child, "inline") + "\n>";
                        }
                        return res;
                    }

                    case "table":
                        return nl + tableToMarkdown(tree) + nl;
                }
            }
            if (/^[ou]+$/.test(mode)) {
                if (tree.tagName == "LI") {
                    return "\n" + repeat("  ", mode.length - 1) + (mode[mode.length - 1] == "o" ? "1. " : "- ") + childsToMarkdown(tree, mode + "l");
                } else {
                    console.log("[toMarkdown] - invalid element at this point " + mode.tagName);
                    return childsToMarkdown(tree, "inline");
                }
            } else if (/^[ou]+l$/.test(mode)) {
                if (tree.tagName == "UL") {
                    return childsToMarkdown(tree, mode.substr(0, mode.length - 1) + "u");
                } else if (tree.tagName == "OL") {
                    return childsToMarkdown(tree, mode.substr(0, mode.length - 1) + "o");
                }
            }

            switch (tree.tagName.toLowerCase()) {
                case "strong":
                case "b":
                    return "**" + childsToMarkdown(tree, "inline") + "**";
                case "del":
                    return "~~" + childsToMarkdown(tree, "inline") + "~~";
                case "em":
                case "i":
                    return "_" + childsToMarkdown(tree, "inline") + "_";
                case "code":
                    return "`" + childsToMarkdown(tree, "inline") + "`";
                case "a":
                    return "[" + childsToMarkdown(tree, "inline") + "](" + tree.getAttribute("href") + ")";
                case "img":
                    return nl + "[_Image_: " + markdownEscape(tree.getAttribute("alt")) + "](" + tree.getAttribute("src") + ")" + nl;
                case "script":
                case "style":
                case "meta":
                    return "";
                default:
                    console.log("[toMarkdown] - undefined element " + tree.tagName);
                    return childsToMarkdown(tree, mode);
            }
        }
    };

    const toMarkdown = (node) => {
        return nodeToMarkdown(node, "block").replace(/[\n]{2,}/g, "\n\n").replace(/^[\n]+/, "").replace(/[\n]+$/, "");
    };

    const getMarkdownForChat = () => {
        /* Select all elements that have a class of "whitespace-pre-wrap"
        Not an exact science, but from poking around this reliably 
        isolates divs containing user and assistant messages */
        const elements = document.querySelectorAll(".whitespace-pre-wrap");
        let md = "";
        for (var i = 0; i < elements.length; i++) {
            /* Determine if child elements have a class of "prose"
                If child elements have a class of "prose", from experience 
                this is an assistant message */
            const hasProse = elements[i].querySelector(".prose");
            if (!hasProse) {
                md += "### User\n\n" + elements[i].innerText + "\n\n---\n\n";
            } else {
                /* When assistant replies, reply may contain multiple 
                children depending on formatting. Render as markdown.*/
                md += "### ChatGPT\n\n" + toMarkdown(elements[i]) + "\n\n---\n\n";
            }
        }
        md += "<sub>chat2gist v0.1</sub>\n\n";
        return md;
    };

    const getCodes = (callback) => {
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
    };

    const fetchToken = (device_code, interval, callback) => {
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
            throw new Error("Couldn't fetch Github auth token. Check console for error.");
        }).then(data => {
            callback(data);
        }).catch((error) => {
            alert(error.message);
        });
    };

    const postGist = (token, filename, text, callback) => {
        fetch("https://api.github.com/gists", {
            method: 'POST',
            body: JSON.stringify({
                public: false,
                files: {
                    [filename]: {
                        content: text
                    }
                }
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status == 401) {
                window.localStorage.removeItem("chat2gist_token");
                throw new Error("Github auth token expired. Try running bookmarklet again.");
            } else {
                throw new Error("Couldn't post gist. Check console for error.");
            }
        }).then(
            json => callback(json.html_url)
        ).catch(error => {
            alert(error.message);
        });
    };

    const codeEntryRedirect = (data) => {  
        /* Redirect to GitHub code entry page */
        const val = confirm("Enter the following code on the GitHub authorization page (click ok to go there): " + data.user_code);
        if (val) {
            /* Open page in new tab */
            window.open("https://github.com/login/device", 'mozillaTab');
        }
    };

    const handleGistURL = (url) => {
        /* Copy URL to clipboard */
        navigator.clipboard.writeText(url).then(() => {
            alert("Gist posted! URL copied to clipboard.");
        }).catch(() => {
            alert("Gist posted! URL: " + url);
        });
    };

    const main = () => {
        /* If url is not chat.openai.com, return early */
        if (window.location.href.indexOf("chat.openai.com") == -1) {
            alert("Bookmarklet only works on chat.openai.com");
            return;
        }
        /* Get markdown */
        const md = getMarkdownForChat();

        /* Create title for gist: "chatgpt_yyyymmdd_hhmmss.md" */
        const date = new Date();
        const filename = "chatgpt_" + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + "_" + date.getHours() + date.getMinutes() + date.getSeconds() + ".md";

        /* If token is present in local storage, use it */
        const token = localStorage.getItem("chat2gist_token");
        if (!token) {
            getCodes((data) => {
                codeEntryRedirect(data);
                fetchToken(data.device_code, data.interval, (json) => {
                    localStorage.setItem("chat2gist_token", json.access_token);
                    alert("Success! Authenticated. Posting gist...");
                    postGist(json.access_token, filename, md, (url) => {
                        handleGistURL(url);
                    });
                });
            });
        } else {
            postGist(token, filename, md, (url) => {
                handleGistURL(url);
            });
        }
    };

    main();
})();
