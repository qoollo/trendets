define(['libs/d3', 'coordinator'], function(d3, coordinator) {
    var quotes = {
        oil: [],
        dollar: [],
        euro: []
    }

    var forecasts = [];

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
    

    forecasts.sort(function(a, b) { return a.start.date - b.start.date; });
    var leafs = forecasts.slice();

    for (var i = 0; i < forecasts.length; i++) {
        forecasts[i].children = [];
        for (var j = i + 1; j < forecasts.length; j++)
            if (forecasts[i].start.date <= forecasts[j].start.date &&
                (forecasts[i].end.date >= forecasts[j].end.date || forecasts[i].isCameTrue === undefined)) {
                forecasts[i].children.push(forecasts[j]);
                if (leafs.indexOf(forecasts[i]) != -1)
                    leafs.splice(leafs.indexOf(forecasts[i]), 1);

                if (forecasts[j].parents === undefined)
                    forecasts[j].parents = [];
                forecasts[j].parents.push(forecasts[i]);
            }
    }
    
    var parents = [];
    var c = 0;
    while (leafs.length > 0) {
        console.log(c++);
        for (var i = 0; i < leafs.length; i++) {
            if (leafs[i].children.length == 0)
                leafs[i].order = 0;
            else
                leafs[i].order = d3.max(leafs[i].children, function(e) { return e.order; }) + 1;

            if (leafs[i].parents != undefined)
                parents = parents.concat(leafs[i].parents);
        }
        leafs = parents;
        parents = [];
    }


    return {
        loadQuotes: function(start, end) {
            return {
                oil: quotes.oil.filter(function (d) { return d.day >= start && d.day <= end; }),
                dollar: quotes.dollar.filter(function (d) { return d.day >= start && d.day <= end; }),
                euro: quotes.euro.filter(function (d) { return d.day >= start && d.day <= end; }),
            };
        },
        loadForecast: function(start, end) {
            return forecasts.filter(function(d) {
                return d.start.date <= end && d.end.date >= start;
            });
        },
        loadPersons: function() {
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
});