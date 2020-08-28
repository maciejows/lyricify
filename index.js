if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
app.use(cors({
    origin: 'http://localhost:4200'
}));

const PORT = process.env.PORT || 3000;

const accessToken = process.env.ACCESS_TOKEN;

const geniusApiBase = 'https://api.genius.com'

app.get('/lyrics', (req, res) => {
    const query = req.query['search'];
    const slugged = slugify(query);
    console.log("Called for: " + slugged);
    getData(`${geniusApiBase}/search?q=${slugged}`)
        .then(data => {
            if (data.response.hits[0]) {
                scrapeLyrics(data.response.hits[0].result.path)
                .then(lyrics => {
                    res.send(lyrics);
                })
                .catch(error => res.status(404).send({message: 'Something went wrong'}));
            }
            else res.status(404).send({message: 'Lyrics not found'});
        })
        .catch(error => res.status(401).send({message: 'Unauthorized - invalid token'}));
        
})

app.listen(PORT, () => {
    console.log(`Listening at port: ${PORT}`)
})

async function getData(url=''){
    const response = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    return response.json();
}

async function scrapeLyrics(url){
    let response = await fetch(`https://genius.com${url}`);
    let text = await response.text();
    let $ = cheerio.load(text);
    let lyrics = $('.lyrics').text();
    while(lyrics.length === 0) {
        response = await fetch(`https://genius.com${url}`);
        let text = await response.text();
        $ = cheerio.load(text);
        lyrics = $('.lyrics').text();
    }
    return lyrics;
}

function slugify(text){
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
}