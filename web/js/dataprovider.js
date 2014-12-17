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
                    start: {
                        date: startDay,
                    },
                    end: {
                        estimateDate: endDay,
                    },
                })
            }
            result.sort(function(a, b) { return a.end.estimateDate - b.end.estimateDate; });
            return result;
        },
    }
});