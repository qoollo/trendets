define(['libs/d3'], function(d3) {
    return {
        loadQuotes: function(start, end) {
            var oil = [];
            var dollar = [];
            var euro = [];

            var d = new Date(start.getTime());
            while (d <= end) {
                oil.push({
                    day: d,
                    value: Math.random() * 150,
                })
                dollar.push({
                    day: d,
                    value: Math.random() * 150,
                })
                euro.push({
                    day: d,
                    value: Math.random() * 150,
                })
                d = new Date(d.getTime());
                d.setDate(d.getDate() + 1);
            }
            return {
                oil: oil,
                dollar: dollar,
                euro: euro,
            };
        },
        loadOpenForecast: function(start, end) {
            var result = [];
            for (var i = 0; i < 5; i++) {
                var d = parseInt(Math.random() * (end - start) / 86400000);
                var startDay = new Date(start.getTime()),
                    endDay = new Date(end.getTime());
                startDay.setDate(startDay.getDate() + d);
                endDay.setDate(endDay.getDate() + parseInt(Math.random() * 100));
                result.push({
                    startDate: startDay,
                    expectedEndDate: endDay,
                    personId: parseInt(10 * Math.random()),
                    title: 'Герман Греф верит в Джа',
                    cite: 'Футбольные команды армий Великобритании и Германии сыграли матч в память о рождественском перемирии 1914 года — необъявленном прекращении огня на многих участках западного фронта во время Первой мировой войны. Матч, состоявшийся на стадионе клуба «Олдершот Таун» в графстве Гэмпшир, завершился победой британской команды со счетом 1:0.',
                    source: {
                        name: 'Russia Today',
                        link: 'http://citysoftgroup.ru',
                    },
                })
            }
            result.sort(function(a, b) { return a.expectedEndDate - b.expectedEndDate; });
            return result;
        },
        loadClosedForecast: function(start, end) {
            var result = [];
            for (var i = 0; i < 5; i++) {
                var k1 = 0.8 * Math.random();
                var k2 = k1 + 0.1 + Math.random() * (0.9 - k1);
                var d1 = parseInt(k1 * (end - start) / 86400000),
                    d2 = parseInt(k2 * (end - start) / 86400000);
                var startDay = new Date(start.getTime()),
                    endDay = new Date(start.getTime());
                startDay.setDate(startDay.getDate() + d1);
                endDay.setDate(endDay.getDate() + d2);
                result.push({
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
            return result;
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