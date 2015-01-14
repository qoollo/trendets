var express = require('express');

console.log('Starting Express server...');

var app = express();


app.get('/foo', function (req, res) {
    res.send('Hello World')
})

app.listen(3001)