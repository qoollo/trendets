define(['libs/d3', 'coordinator'], function(d3, coordinator) {
    var quotes = {
        oil: [],
        dollar: [],
        euro: []
    }

    var closedForecasts = [];
    var openForecasts = [];

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

    for (var i = 0; i < 20; i++) {
        var d = parseInt(Math.random() * 200);
        var startDay = new Date(coordinator.today().getTime()),
            endDay = new Date(coordinator.today().getTime());
        startDay.setDate(startDay.getDate() - 200 + d);
        endDay.setDate(endDay.getDate() + parseInt(Math.random() * 200));
        openForecasts.push({
            id: 'o' + i,
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
                expectedDate: endDay,
            },
        })
    }
    openForecasts.sort(function(a, b) { return a.end.expectedDate - b.end.expectedDate; });

    for (var i = 0; i < 70; i++) {
        var startDay = new Date(coordinator.today().getTime());
        startDay.setDate(startDay.getDate() - parseInt(Math.random() * 200));
        var endDay = new Date(startDay.getTime());
        endDay.setDate(endDay.getDate() + 1 + parseInt(Math.random() * 50));
        if (endDay > coordinator.today()) {
            i--;
            continue;
        }

        closedForecasts.push({
            id: 'c' + i,
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


    return {
        loadQuotes: function(start, end) {
            return {
                oil: quotes.oil.filter(function (d) { return d.day >= start && d.day <= end; }),
                dollar: quotes.dollar.filter(function (d) { return d.day >= start && d.day <= end; }),
                euro: quotes.euro.filter(function (d) { return d.day >= start && d.day <= end; }),
            };
        },
        loadOpenForecast: function(start, end) {
            console.log(openForecasts.length);
            console.log(openForecasts.filter(function(d) {
                return d.start.date <= end;
            }).length);
            return openForecasts.filter(function(d) {
                return d.start.date <= end;
            });
        },
        loadClosedForecast: function(start, end) {
            return closedForecasts.filter(function(d) {
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