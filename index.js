const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

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

function commentsToJSON(groups){
    const jsonString = JSON.stringify(groups)
    console.log(jsonString)
    const fileName = 'ycombinator.json'
    fs.writeFile(fileName, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    
    })
}

async function scrape_ycom(){
    const response = await axios.get('https://news.ycombinator.com/')
    // console.log(response.data)
    
    const $ = cheerio.load(response.data)
    const articles = []
    $('.athing').each((i, elem) => {
        articles[i] = {
            title: $(elem).find('.titleline').text(),
            link: $(elem).find('.titleline a').attr('href'),
            comments: null,
        }
    })
    $('.subtext').each((i,elem)=>{
        articles[i].comments = $(elem).find('a').last().text().replace(/\D/g, '');
    })
    //console.log(articles)

    const groupedArticles = groupComments(articles)
    //console.log(groupedArticles)
    commentsToJSON(groupedArticles)

}



scrape_ycom()