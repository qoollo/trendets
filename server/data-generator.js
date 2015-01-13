var fs = require('fs');
var coordinator = require('../web/js/coordinator');
var d3 = require('d3');
var TrendetsDb = require('./db');
var q = require('q');

function getQuotes() {
    var quotes = [];
    for (var i = -200; i <= 0; i++) {
        var d = new Date(coordinator.today().getTime());
        d.setDate(d.getDate() + i);
        quotes.push({
            day: d,
            oil: Math.random() * 150,
            dollar: Math.random() * 150,
            euro: Math.random() * 150,
        });
    }
    return quotes;
}

function getForecasts() {
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
                shortCite: 'Футбольные фанаты будут наказаны',
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
                shortCite: 'Директор Сбербанка предсказал укрупление юаня на фондовой бирже Севастополя',
                cite: 'Футбольные команды армий Великобритании и Германии сыграли матч в память о рождественском перемирии 1914 года — необъявленном прекращении огня на многих участках западного фронта во время Первой мировой войны. Матч, состоявшийся на стадионе клуба «Олдершот Таун» в графстве Гэмпшир, завершился победой британской команды со счетом 1:0.',
                source: {
                    name: 'Russia Today',
                    link: 'http://citysoftgroup.ru',
                },
            },
            end: {
                date: endDay,
                personId: parseInt(10 * Math.random()),
                title: 'Герман Греф не верит в Джа',
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
    //console.log('123');

    for (var i = forecasts.length - 1; i >= 0; i--) {
        var chI = children[i].slice();
        //console.log(children[i].length);
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

    return forecasts;
}

function getPeople() {
    var result = [];
    for (var i = 0; i < 10; i++) {
        result[i] = {
            id: i,
            name: i % 2 ? 'Герман Германович Греф' : 'ЦБ РФ',
            shortName: i % 2 ? 'Г.Г. Греф' : 'В. Якунин',
            photo: i % 2 ? 'gref.jpg' : 'yakunin.jpg',
        }
    }
    return result;
}

function getFileContents(objData) {
    return 'module.exports = ' + JSON.stringify(objData, null, 4) + ';';
}

function getData() {
    var d = q.defer(),
        res = getFileContents({
            quotes: getQuotes(),
            forecasts: getForecasts(),
            people: getPeople()
        });
    d.resolve(res);
    return d.promise;
}

function getDataFromDb() {
    var db = new TrendetsDb();
    return db.connect().then(function () {

        return q.all([db.Quotes.all(), db.People.all(), db.CitationSources.all(), db.Forecasts.all()])
                .then(function (results) {
                    var quotes = results[0],
                        forecasts = results[3],
                        people = results[1];

                    for (var i = 0; i < quotes.length; i++) {
                        var c = quotes[i],
                            q = {
                                day: c.date,
                                oil: c.oil,
                                dollar: c.usd,
                                euro: c.eur
                            };
                        quotes[i] = q;
                    }

                    for (var i = 0; i < people.length; i++) {
                        var c = people[i],
                            p = {
                                id: c.id,
                                name: c.name,
                                shortName: c.shortName,
                                photo: c.photo,
                            }; 
                        people[i] = p;
                    }

                    return getFileContents({
                        quotes: quotes,
                        forecasts: forecasts,
                        people: people
                    });
                }, console.error)

    }, console.error);
}

module.exports = {
    generate: function (destPath, fromDb) {
        var dataPromise = fromDb ? getDataFromDb() : getData();
        dataPromise.then(function (data) {
            fs.unlinkSync(destPath);
            fs.writeFile(destPath, data, function (err) {
                if (err)
                    console.error(err);
                else
                    console.info(destPath + " file generated.");
            });
        }, console.error);
    }
}
