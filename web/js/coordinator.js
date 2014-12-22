define(['libs/d3', 'settings', 'dom'], function(d3, settings, dom) {
    var today = new Date(),
        xTranslate = 0,
        startDate,
        stopDate,
        loadingStartDate,
        loadingStopDate;

    function calcStartDate() {
        var count = parseInt((dom.containerWidth - settings.futureMargin + xTranslate) / settings.dayWidth);
        startDate = new Date(today.getTime());
        startDate.setDate(startDate.getDate() - count);

        loadingStartDate = new Date(startDate.getTime());
        var bufferCount = parseInt(dom.containerWidth / settings.dayWidth);
        loadingStartDate.setDate(loadingStartDate.getDate() - bufferCount);
    }

    function calcStopDate() {
        var count = parseInt((settings.futureMargin - xTranslate) / settings.dayWidth);
        stopDate = new Date(today.getTime());
        stopDate.setDate(stopDate.getDate() + count);

        loadingStopDate = new Date(stopDate.getTime());
        var bufferCount = parseInt(dom.containerWidth / settings.dayWidth);
        loadingStopDate.setDate(loadingStopDate.getDate() + bufferCount);
        if (loadingStopDate > today)
            loadingStopDate = today;
    }

    calcStartDate();
    calcStopDate();

    var xScale = d3.time.scale()
        .rangeRound([0, dom.containerWidth])
        .domain([startDate, stopDate]);

    function dateDiff(d1, d2) {
        return (d1 - d2) / 86400000 * settings.dayWidth;
    }

    return {
        startDate: function() { return startDate; },
        stopDate: function() { return stopDate; },
        loadingStartDate: function() { return loadingStartDate; },
        loadingStopDate: function() { return loadingStopDate; },
        today: function() { return today; },   
        datePosition: function(d) { return xScale(d); },
        quotePosition: function(v, type) {
            return -settings.graphicsHeight * (v - settings.scales[type].min) /
                (settings.scales[type].max - settings.scales[type].min);
        },
        setTranslate: function(dX) {
            xTranslate = dX;
            calcStartDate();
            calcStopDate();
        }
    }
});