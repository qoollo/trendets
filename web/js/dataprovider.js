var d3 = require('./libs/d3');
var coordinator = require('./coordinator');
var data = require('./data');

var quotes = fixDates(data.quotes),
    forecasts = fixDates(data.forecasts);

function fixDates(obj) {
    for (var f in obj) {
        if (typeof obj[f] === 'object')
            obj[f] = fixDates(obj[f]);
        else if (isDateIsoString(obj[f]))
            obj[f] = new Date(obj[f]);
    }
    return obj;
}

function isDateIsoString(str) {
    return typeof str === 'string' && 
           /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d{3}Z$/.test(str);
}


module.exports = {
    loadQuotes: function (start, end) {
        return {
            oil: quotes.oil.filter(function (d) { return d.day >= start && d.day <= end; }),
            dollar: quotes.dollar.filter(function (d) { return d.day >= start && d.day <= end; }),
            euro: quotes.euro.filter(function (d) { return d.day >= start && d.day <= end; }),
        };
    },
    loadForecast: function (start, end) {
        return forecasts.filter(function (d) {
            return d.start.date <= end && d.end.date >= start;
        });
    },
    loadPersons: function () {
        return data.people;
    },
}