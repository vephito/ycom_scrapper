const fs = require('fs');
const https = require('https');

interface Article {
    id:string,
    title:string,
    link:string,
    comments:number | null
}
interface Groups {
    '0-100':Article[]
    '100-200':Article[]
    '200-300':Article[]
    '300-n':Article[]
}

//function to parse the HTML
function parseHTML(htmlString:string):Article[] {
    const articles:Article[] = [];

    const titleRegex = /<span class="titleline"><a href="(.*?)">(.*?)<\/a>/g;
    //const commentRegex = /\d+&nbsp;comment/g;
    const commentRegex = /<a href="item\?id=(\d+)">(\d+&nbsp;comments)<\/a>/g;
    
    const idRegex = /<tr class='athing' id='(\d+)'>/g;

    let matchId:string[]|null, matchTitle:string[]|null;
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
    let match:string[] | null; 
    while ((match = commentRegex.exec(htmlString)) !== null) {
        // ids = match[1];
        // comments = match[2].split('&')[0];
        let id: string = match[1]
        let comments: number = parseInt(match[2].split('&')[0])
        articles.forEach((article) => {
            if (article.id === id ) {
                article.comments = comments;
            }
        });   
    }
    return articles;
}

// function to group the articles based on the number of comments
function groupComments(news:Article[]):Groups{
    const groups:Groups = {
        '0-100': [],
        '100-200': [],
        '200-300': [],
        '300-n': []
    }
    news.forEach((article:Article) =>{
        let comments:number | null = article.comments;
        if (comments !== null){
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
    return groups
}

//function to create a JSON file
function commentsToJSON(groups:Groups):void {
    const jsonString:string = JSON.stringify(groups)
    //console.log(jsonString)
    const fileName:string = 'ycom_ts.json'
    fs.writeFile(fileName, jsonString, (err : any ) => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

// main function

const url:string = 'https://news.ycombinator.com/';
let data:string = '';

const reqs = https.get(url, (res:any) => {
    res.on('data', (chunk:string) => {
        data += chunk;
    });
    res.on('end', () => {
        const articles:Article[] = parseHTML(data);
        const group:Groups = groupComments(articles);
        commentsToJSON(group);
        console.log("We are all DONE YAY!!")
        //console.log(data);
    });
});

