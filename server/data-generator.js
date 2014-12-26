var fs = require('fs');
var coordinator = require('../web/js/coordinator');

function getQuotes() {
    var quotes = {
        oil: [],
        dollar: [],
        euro: []
    }
    for (var i = -200; i <= 0; i++) {
        var d = new Date(coordinator.today().getTime());
        d.setDate(d.getDate() + i);
        quotes.oil.push({
            day: d,
            value: Math.random() * 150,
        });
        quotes.dollar.push({
            day: d,
            value: Math.random() * 150,
        });
        quotes.euro.push({
            day: d,
            value: Math.random() * 150,
        });
    }
    return quotes;
}

function getData() {
    return 'module.exports = JSON.parse(\'' + JSON.stringify({
        quotes: getQuotes()
    }) + '\');';
}

module.exports = {
    generate: function (destPath) {
        fs.writeFile(destPath, getData(), function (err) {
            if (err) 
                console.error(err);
            else
                console.info(destPath + " file generated.");
        });
    }
}