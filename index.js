require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const app = express();
const dns = require('dns');
var mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyparser.urlencoded({extended: "false"}))
app.use(bodyparser.json())

mongoose.connect(process.env.MONGO_URI);

const shortUrlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
    res.json({greeting: 'hello API'});
});

function isValidUrl(url) {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    return urlPattern.test(url);
}

app.post('/api/shorturl', async function (req, res) {

    const original_url = req.body.url;

    if (!isValidUrl(original_url)) {
        return res.json({error: "invalid url"});
    }

    const already = await ShortUrl.findOne({original_url});

    if (already) {
        return res.json({original_url: already.original_url, short_url: already.short_url});
    }

    const short_url = Math.floor(Math.random() * 1000);

    await ShortUrl.create({
        original_url,
        short_url,
    });

    res.json({original_url, short_url});
});

app.get('/api/shorturl/:short_url', async function (req, res) {

    const short_url = req.params.short_url;

    const already = await ShortUrl.findOne({short_url});

    if (!already) {
        return res.json({error: "invalid url"});
    }

    res.redirect(already.original_url);
});

app.get("*", (req, res) => {
    res.send("Not Found!");
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
