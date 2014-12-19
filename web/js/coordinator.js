define(['libs/d3', 'settings', 'dom'], function(d3, settings, dom) {
    var today = new Date(),
        xTranslate = 0,
        startDate,
        stopDate;

    function calcStartDate() {
        var count = parseInt((dom.containerWidth - settings.futureMargin) / settings.dayWidth);
        startDate = new Date(today.getTime());
        startDate.setDate(startDate.getDate() - count);
    }

    function calcStopDate() {
        var count = parseInt(settings.futureMargin / settings.dayWidth);
        stopDate = new Date(today.getTime());
        stopDate.setDate(stopDate.getDate() + count);
    }

    var xScale = d3.time.scale()
        .rangeRound([0, dom.containerWidth]);

    function dateDiff(d1, d2) {
        return (d1 - d2) / 86400000 * settings.dayWidth;
    }

    return {
        startDate: function() { return startDate; },
        stopDate: function() { return new Date(today.getTime())},
        endTimelineDate: function() { return stopDate; },     
        datePosition: function(d) { return xScale(d); },
        quotePosition: function(v, type) {
            return -settings.graphicsHeight * (v - settings.scales[type].min) /
                (settings.scales[type].max - settings.scales[type].min);
        },
        setTranslate: function(dX) {
            xTranslate = dX;
            calcStartDate();
            calcStopDate();
            xScale.domain([startDate, stopDate]);
        }
    }
});