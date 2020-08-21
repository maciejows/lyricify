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
    console.log(query);
    getData(`${geniusApiBase}/search?q=${query}`)
        .then(data => {
            if (data.response.hits[0]) {
                scrapeLyrics(data.response.hits[0].result.path)
                .then(lyrics => {
                    res.send(lyrics);
                })
                .catch(error => res.status(404).send({message: 'Something went wrong'}));
            }
            else res.status(404).send({message: 'Lyrics not found'});
        });
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
    const response = await fetch(`https://genius.com${url}`);
    const text = await response.text();
    const $ = cheerio.load(text);
    const lyrics = $('.lyrics').text().trim();
    console.log(lyrics);
    return lyrics;
}