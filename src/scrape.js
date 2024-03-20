var fs = require('fs');
var https = require('https');
//function to parse the HTML
function parseHTML(htmlString) {
    var articles = [];
    var titleRegex = /<span class="titleline"><a href="(.*?)">(.*?)<\/a>/g;
    //const commentRegex = /\d+&nbsp;comment/g;
    var commentRegex = /<a href="item\?id=(\d+)">(\d+&nbsp;comments)<\/a>/g;
    var idRegex = /<tr class='athing' id='(\d+)'>/g;
    var matchId, matchTitle;
    // extract the article id, title,link and push them into the articles array
    while ((matchId = idRegex.exec(htmlString)) !== null && (matchTitle = titleRegex.exec(htmlString)) !== null) {
        articles.push({
            id: matchId[1],
            title: matchTitle[2],
            link: matchTitle[1],
            comments: null
        });
    }
    // extract the comments and add them to the articles array
    var match;
    var _loop_1 = function () {
        // ids = match[1];
        // comments = match[2].split('&')[0];
        var id = match[1];
        var comments = parseInt(match[2].split('&')[0]);
        articles.forEach(function (article) {
            if (article.id === id) {
                article.comments = comments;
            }
        });
    };
    while ((match = commentRegex.exec(htmlString)) !== null) {
        _loop_1();
    }
    return articles;
}
// function to group the articles based on the number of comments
function groupComments(news) {
    var groups = {
        '0-100': [],
        '100-200': [],
        '200-300': [],
        '300-n': []
    };
    news.forEach(function (article) {
        var comments = article.comments;
        if (comments !== null) {
            if (comments <= 100) {
                groups['0-100'].push(article);
            }
            else if (comments > 100 && comments <= 200) {
                groups['100-200'].push(article);
            }
            else if (comments > 200 && comments <= 300) {
                groups['200-300'].push(article);
            }
            else if (comments > 300) {
                groups['300-n'].push(article);
            }
        }
    });
    return groups;
}
//function to create a JSON file
function commentsToJSON(groups) {
    var jsonString = JSON.stringify(groups);
    //console.log(jsonString)
    var fileName = 'ycom_ts.json';
    fs.writeFile(fileName, jsonString, function (err) {
        if (err) {
            console.log('Error writing file', err);
        }
        else {
            console.log('Successfully wrote file');
        }
    });
}
// main function
var url = 'https://news.ycombinator.com/';
var data = '';
var reqs = https.get(url, function (res) {
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        var articles = parseHTML(data);
        var group = groupComments(articles);
        commentsToJSON(group);
        console.log("We are all DONE YAY!!");
        //console.log(data);
    });
});
