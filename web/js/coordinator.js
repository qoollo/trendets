define(['libs/d3', 'settings', 'dom'], function(d3, settings, dom) {
    var today = new Date();

    function dateDiff(d1, d2) {
        return (d1 - d2) / 86400000 * settings.dayWidth;
    }

    return {
        startDate: function() {
            var res = new Date(today.getTime());
            res.setDate(res.getDate() - 30);
            return res;
        },
        stopDate: function() { return new Date(today.getTime())},
        datePosition: function(d, type) {
            return dom.containerWidth - settings.futureMargin + dateDiff(d, today);
        },
        quotePosition: function(v, type) {
            return -settings.graphicsHeight * (v - settings.scales[type].min) /
                (settings.scales[type].max - settings.scales[type].min);
        }
    }
});