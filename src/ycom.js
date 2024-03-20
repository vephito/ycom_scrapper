const fs = require('fs');
const https = require('https');

//function to parse the HTML
function parseHTML(htmlString) {
    const articles = [];

    const titleRegex = /<span class="titleline"><a href="(.*?)">(.*?)<\/a>/g;
    //const commentRegex = /\d+&nbsp;comment/g;
    const commentRegex = /<a href="item\?id=(\d+)">(\d+&nbsp;comments)<\/a>/g;
    
    const idRegex = /<tr class='athing' id='(\d+)'>/g;

    let matchId, matchTitle;
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
    let match;
    while ((match = commentRegex.exec(htmlString)) !== null) {
        ids = match[1];
        comments = match[2].split('&')[0];
      
        articles.forEach((article) => {
            if (article.id === ids) {
                article.comments = comments;
            }
        });   
    }
    return articles;
}

// function to group the articles based on the number of comments
function groupComments(news){
    const groups = {
        '0-100': [],
        '100-200': [],
        '200-300': [],
        '300-n': []
    }
    news.forEach((article) =>{
        let comments = article.comments;
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
    });
    return groups
}

//function to create a JSON file
function commentsToJSON(groups){
    const jsonString = JSON.stringify(groups)
    //console.log(jsonString)
    const fileName = 'ycombinator_com.json'
    fs.writeFile(fileName, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

// main function

const url = 'https://news.ycombinator.com/';
let data = '';

const reqs = https.get(url, (res) => {
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const articles = parseHTML(data);
        const group = groupComments(articles);
        commentsToJSON(group);
        console.log("We are all DONE YAY!!")
        //console.log(data);
    });
});

