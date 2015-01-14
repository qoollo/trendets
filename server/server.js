var express = require('express'),
    settings = require('./settings'),
    path = require('path');

console.log('Starting Express server...');

var app = express();

app.get('/admin', function (res, res) {
    res.sendFile(path.join(settings.path, '/web/admin.html'));
})

app.get('/foo', function (req, res) {
    res.send('Hello World')
})

app.listen(settings.port)