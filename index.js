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
        .then(data => scrapeLyrics(data.response.hits[0].result.path))
        .then(lyrics => res.send(lyrics));
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
    return $('.lyrics')
        .text()
        .trim();
}