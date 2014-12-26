var d3 = require('./libs/d3');
var coordinator = require('./coordinator');
var data = require('./data');

var quotes = fixDates(data.quotes);

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

var forecasts = [];

for (var i = 0; i < 10; i++) {
    var d = parseInt(Math.random() * 100);
    var startDay = new Date(coordinator.today().getTime()),
        endDay = new Date(coordinator.today().getTime());
    startDay.setDate(startDay.getDate() - 100 + d);
    endDay.setDate(endDay.getDate() + parseInt(Math.random() * 200));
    forecasts.push({
        id: 'o' + i,
        isCameTrue: undefined,
        start: {
            date: startDay,
            personId: parseInt(10 * Math.random()),
            title: 'Герман Греф верит в Джа',
            cite: 'Футбольные команды армий Великобритании и Германии сыграли матч в память о рождественском перемирии 1914 года — необъявленном прекращении огня на многих участках западного фронта во время Первой мировой войны. Матч, состоявшийся на стадионе клуба «Олдершот Таун» в графстве Гэмпшир, завершился победой британской команды со счетом 1:0.',
            source: {
                name: 'Russia Today',
                link: 'http://citysoftgroup.ru',
            },
        },
        end: {
            date: endDay,
        },
    })
}

for (var i = 0; i < 70; i++) {
    var startDay = new Date(coordinator.today().getTime());
    startDay.setDate(startDay.getDate() - parseInt(Math.random() * 200));
    var endDay = new Date(startDay.getTime());
    endDay.setDate(endDay.getDate() + 1 + parseInt(Math.random() * 20));
    if (endDay > coordinator.today()) {
        i--;
        continue;
    }

    forecasts.push({
        id: 'c' + i,
        isCameTrue: Math.random() > 0.5,
        start: {
            date: startDay,
            personId: parseInt(10 * Math.random()),
            title: 'Герман Греф верит в Джа',
            cite: 'Футбольные команды армий Великобритании и Германии сыграли матч в память о рождественском перемирии 1914 года — необъявленном прекращении огня на многих участках западного фронта во время Первой мировой войны. Матч, состоявшийся на стадионе клуба «Олдершот Таун» в графстве Гэмпшир, завершился победой британской команды со счетом 1:0.',
            source: {
                name: 'Russia Today',
                link: 'http://citysoftgroup.ru',
            },
        },
        end: {
            date: endDay,
            title: 'Герман Греф верит в Джа',
            cite: 'Футбольные команды армий Великобритании и Германии сыграли матч в память о рождественском перемирии 1914 года — необъявленном прекращении огня на многих участках западного фронта во время Первой мировой войны. Матч, состоявшийся на стадионе клуба «Олдершот Таун» в графстве Гэмпшир, завершился победой британской команды со счетом 1:0.',
            source: {
                name: 'Russia Today',
                link: 'http://citysoftgroup.ru',
            },
        },
    })
}


forecasts.sort(function (a, b) { return a.start.date - b.start.date; });

var children = [];

var leafs = forecasts.slice();

for (var i = 0; i < forecasts.length; i++) {
    forecasts[i].order = 0;
    children[i] = [];
    for (var j = i + 1; j < forecasts.length; j++)
        if (forecasts[i].start.date <= forecasts[j].start.date &&
            (forecasts[i].end.date >= forecasts[j].end.date || forecasts[i].isCameTrue === undefined)) {
            children[i].push(j);
        }
}
console.log('123');

for (var i = forecasts.length - 1; i >= 0; i--) {
    var chI = children[i].slice();
    console.log(children[i].length);
    for (var j = 0; j < chI.length; j++) {
        var chJ = children[chI[j]];
        for (var k = 0; k < chJ.length; k++) {
            var index = children[i].indexOf(chJ[k]);
            if (index != -1)
                children[i].splice(index, 1);
        }
    }
    if (children[i].length > 0)
        forecasts[i].order = d3.max(children[i], function (el) { return forecasts[el].order; }) + 1;
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
        var result = {};
        for (var i = 0; i < 10; i++) {
            results[i] = {
                id: i,
                name: i % 2 ? 'Герман Германович Греф' : 'ЦБ РФ',
                photo: i % 2 ? '00001.png' : '00002.png',
            }
        }
        return result;
    },
}