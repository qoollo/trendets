var dom = require('./../dom');
var d3 = require('./../libs/d3');
var coordinator = require('./../coordinator');
var settings = require('./../settings');
var dataProvider = require('./../dataprovider');

var drawing = {
    bubble: require('./bubble'),
}


function addPhoto(container, type) {
    container.append('clipPath')
        .attr('id', function(d) { return 'cp-' + d.id; })
        .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', settings.photoSize);

    container.append('image')
        .attr('xlink:href', function(d) {
            return 'img/' + dataProvider.getPersonById(d[type].personId).photo;
        })
        .attr('clip-path', function(d) { return 'url(#cp-' + d.id + ')'; })
        .attr('width', 2 * settings.photoSize)
        .attr('height', 2 * settings.photoSize)
        .attr('x', -settings.photoSize)
        .attr('y', -settings.photoSize);

    container.append('circle')
        .attr('r', settings.photoSize)
        .attr('cx', 0)
        .attr('cy', 0);
}

function drawNewClosedForecasts(lines, photos) {
    var minDate = coordinator.startDate();

    lines.append('path')
        .attr('d', function(d, i) {
            var y = coordinator.forecastPosition(d.order);
            var startX = coordinator.datePosition(d.start.date),
                stopX = coordinator.datePosition(d.end.date);
            return 'M' + startX + ',0 C' + startX + ',' + y + 
                ' ' + stopX + ',' + y + ' ' + stopX + ',0';
        });

    var photoStart = photos.append('g').classed('photo', true)
        .attr('transform', function(d) {
            return 'translate(' + coordinator.datePosition(d.start.date) + ',0)';
        });
    addPhoto(photoStart, 'start');

    var photoEnd = photos.append('g').classed('photo', true)
        .attr('transform', function(d) {
            return 'translate(' + coordinator.datePosition(d.end.date) + ',0)';
        });
    addPhoto(photoEnd, 'end');
}

function drawNewOpenForecasts(lines, photos) {
    var todayPosition = coordinator.datePosition(coordinator.today()) + 30;

    lines.append('path')
        .attr('d', function(d, i) {
            var y = coordinator.forecastPosition(d.order);
            var startX = coordinator.datePosition(d.start.date),
                stopX = coordinator.datePosition(d.end.date);
            return 'M' + startX + ',0 Q' + startX + ',' + y + 
                ' ' + todayPosition + ',' + y;
        });

    var photoStart = photos.append('g').classed('photo', true)
        .attr('transform', function(d) {
            return 'translate(' + coordinator.datePosition(d.start.date) + ',0)';
        });
    addPhoto(photoStart, 'start');

    var photoEnd = photos.append('g').classed('photo', true)
        .attr('transform', function(d) {
            return 'translate(' + todayPosition +
                ',' + coordinator.forecastPosition(d.order) + ')';
        });
    addPhoto(photoEnd, 'start');
}

function drawForecast(forecasts) {
    function closedFilter(d) { return d.isCameTrue !== undefined; }
    function openFilter(d) { return d.isCameTrue === undefined; }

    var lines = dom.forecasts.lines.selectAll('.forecast')
            .data(forecasts, function(d) { return d.id; });
    var newLines = lines.enter().append('g')
            .classed('forecast', true);
    lines.exit().remove();

    var photos = dom.forecasts.photos.selectAll('.forecast')
            .data(forecasts, function(d) { return d.id; });
    var newPhotos = photos.enter().append('g')
            .classed('forecast', true);
    photos.exit().remove();

    drawNewClosedForecasts(newLines.filter(closedFilter), newPhotos.filter(closedFilter));
    drawNewOpenForecasts(newLines.filter(openFilter), newPhotos.filter(openFilter));


    lines.on('mouseover', function(d) { highlightForecast(d); drawing.bubble.showBubble(d); });
    photos.on('mouseover', function(d) { highlightForecast(d); drawing.bubble.showBubble(d); });
    lines.on('mousemove', drawing.bubble.moveBubble);
    photos.on('mousemove', drawing.bubble.moveBubble);
    lines.on('mouseout', function(d) { hideHighlightedForecast(d); drawing.bubble.hideBubble(d); });
    photos.on('mouseout', function(d) { hideHighlightedForecast(d); drawing.bubble.hideBubble(d); });
    lines.on('click', function(d) { selectForecast(d); drawing.bubble.showDetails(d); });
    photos.on('click', function(d) { selectForecast(d); drawing.bubble.showDetails(d); });
}


function selectForecast(d) {
    d3.selectAll('.forecast.selected')
        .classed('selected', false);

    d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
        .classed('selected', true);
}

function highlightForecast(d) {
    var f = d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
        .classed('hovered', true);
    f.moveToFront();
}

function hideHighlightedForecast(d) {
    d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
        .classed('hovered', false);
}


module.exports = {
    drawForecast: drawForecast,
}