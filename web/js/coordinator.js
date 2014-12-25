var d3 = require('./libs/d3');
var dom = require('./dom');
var settings = require('./settings');

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
}

calcStartDate();
calcStopDate();

var xScale = d3.time.scale()
    .rangeRound([0, dom.containerWidth])
    .domain([startDate, stopDate]);

function dateDiff(d1, d2) {
    return (d1 - d2) / 86400000 * settings.dayWidth;
}

module.exports = {
    startDate: function () { return startDate; },
    stopDate: function () { return stopDate; },
    loadingStartDate: function () { return loadingStartDate; },
    loadingStopDate: function (afterToday) {
        if (afterToday || loadingStopDate < today)
            return loadingStopDate;
        else
            return today;
    },
    today: function () { return today; },
    datePosition: function (d) { return xScale(d); },
    quotePosition: function (v, type) {
        return -settings.graphicsHeight * (v - settings.scales[type].min) /
            (settings.scales[type].max - settings.scales[type].min);
    },
    forecastPosition: function (order) {
        return 30 + 30 * order;
    },
    leftPosition: function () {
        return -xTranslate;
    },
    setTranslate: function (dX) {
        xTranslate = dX;
        calcStartDate();
        calcStopDate();
    }
}