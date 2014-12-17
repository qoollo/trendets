define(['libs/d3'], function(d3) {
    return {
        loadQuotes: function(start, end) {
            var oil = [];
            var dollar = [];
            var euro = [];

            var d = new Date(start.getTime());;
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
        }
    }
});