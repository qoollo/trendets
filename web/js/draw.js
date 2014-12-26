var d3 = require('./libs/d3');
var dom = require('./dom');
var settings = require('./settings');
var dataProvider = require('./dataprovider');
var coordinator = require('./coordinator');
var events = require('./events');

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
    this.parentNode.appendChild(this);
    });
};

function drawLayout() {
    // graph background grid
    dom.bgGrid.append('rect')
        .attr('x',0)            
        .attr('y',-settings.graphicsHeight)            
        .attr('height',settings.graphicsHeight)            
        .attr('width',x)
        .classed('grid-bg',true);

    // timescale
    dom.timeScale.container
        .attr('transform', 'translate(0,' + settings.graphicsHeight + ')');

    dom.timeScale.background.append('line')
            .attr('x1', 0)
            .attr('y1', settings.graphicsHeight)
            .attr('x2', dom.containerWidth)                
            .attr('y2', settings.graphicsHeight)
            .attr('class', 'divider');
    dom.timeScale.background.append('line')
            .attr('x1', 0)
            .attr('y1', settings.graphicsHeight + settings.timeScaleHeight)
            .attr('x2', dom.containerWidth)                
            .attr('y2', settings.graphicsHeight + settings.timeScaleHeight)
            .attr('class', 'axis');

    // today
    var x = coordinator.datePosition(coordinator.today());
    dom.today.append('line')
        .attr('id', 'today')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', dom.containerHeight);

    // today footprint
    var footprintWidth = 300;
    dom.today.append('rect')
             .classed('today-footprint',true)
             .attr('x',x-footprintWidth)
             .attr('y',0)
             .attr('width',footprintWidth)
             .attr('height',settings.graphicsHeight-1);

    // quotes
    dom.graphics.container.attr('transform', 'translate(0,' + settings.graphicsHeight + ')');

    // forecasts
    dom.forecasts.container.attr('transform', 'translate(0,' + (settings.graphicsHeight + settings.timeScaleHeight) + ')');
}

function addPatterns() {
    var persons = dataProvider.loadPersons();
    console.log(persons);

    var patterns = d3.select('svg defs').selectAll('pattern')
            .data(persons)
        .enter().append('pattern')
            .attr('id', function(d) { return 'photo' + d.id; })
            .attr('width', settings.photoSize * 2)
            .attr('height', settings.photoSize * 2)
            .attr('patternUnits', 'objectBoundingBox');
    patterns.append('image')
        .attr('xlink:href', function(d) { return 'img/' + d.photo; })
        .attr('width', settings.photoSize * 2)
        .attr('height', settings.photoSize * 2);

}

function drawBackground() {
    dom.background.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', dom.containerWidth)
        .attr('height', dom.containerHeight);
}

function drawTimeScale(start, stop) {
    var days = [];
    var d = new Date(start.getTime());
    while (d <= stop) {
        days.push(d);
        d = new Date(d.getTime());
        d.setDate(d.getDate() + 1);
    }

    var days = dom.timeScale.container.selectAll('.day')
            .data(days, function(d) { return d; });

    var elements = days.enter().append('g').classed('day', true);
    
    elements.append('text')
            .attr('x', coordinator.datePosition)
            .attr('y', settings.timeScaleHeight - 15)
            .text(function(d) { return d.getDate(); });

    elements.append('line')
            .attr("x1",coordinator.datePosition)
            .attr("y1",1)
            .attr("x2",coordinator.datePosition)
            .attr("y2",5)
            .classed('ruler-marks',true);

    elements.append('line')
            .attr("x1",coordinator.datePosition)
            .attr("y1",18)
            .attr("x2",coordinator.datePosition)
            .attr("y2",settings.timeScaleHeight-1)
            .classed('ruler-marks',true);

    days.exit().remove();
}

function drawQuote(data, type) {
    var q = dom.graphics.container.selectAll('.' + type)
            .data(data.slice(1), function(d) { return type + d.day; });
        
    q.enter().append('line')
        .classed(type, true)
        .attr('x1', function(d) { return coordinator.datePosition(d.day); })
        .attr('y1', function(d) { return coordinator.quotePosition(d.value, type); })
        .attr('x2', function(d, i) { return coordinator.datePosition(data[i].day); })
        .attr('y2', function(d, i) { return coordinator.quotePosition(data[i].value, type); });

    q.enter().append('circle')
        .classed(type, true)
        .attr('cx', function(d, i) { return coordinator.datePosition(data[i].day); })
        .attr('cy', function(d, i) { return coordinator.quotePosition(data[i].value, type); })
        .attr('r',2)
        .attr('style','fill:white;');

        var boobie_y = coordinator.quotePosition(data[data.length-1].value, type);
        var boobies = dom.graphics.container.append('g').attr('id','boobies');
        boobies.append('circle')
               .attr('cx',coordinator.datePosition(coordinator.today()))     
               .attr('cy',boobie_y)     
               .attr('r',4)
               .classed(type+"-boobie",true);


    q.exit().remove();
}

function drawQuotes(quotes) {
    drawQuote(quotes.oil, 'oil');
    drawQuote(quotes.dollar, 'dollar');
    drawQuote(quotes.euro, 'euro');
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

    var photoStart = photos.append('g').classed('photo', true);
    photoStart.append('circle')
        .attr('fill', function(d) { return 'url(#photo' + d.start.personId + ')'; })
        .attr('r', settings.photoSize)
        .attr('cx', function(d) { return coordinator.datePosition(d.start.date); })
        .attr('cy', 0);

    var photoEnd = photos.append('g').classed('photo', true);
    photoEnd.append('circle')
        .attr('fill', function(d) { return 'url(#photo' + d.end.personId + ')'; })
        .attr('r', settings.photoSize)
        .attr('cx', function(d) { return coordinator.datePosition(d.end.date); })
        .attr('cy', 0);
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

    var photoStart = photos.append('g').classed('photo', true);
    photoStart.append('circle')
        .attr('fill', function(d) { return 'url(#photo' + d.start.personId + ')'; })
        .attr('r', settings.photoSize)
        .attr('cx', function(d) { return coordinator.datePosition(d.start.date); })
        .attr('cy', 0);

    var photoEnd = photos.append('g').classed('photo', true);
    photoEnd.append('circle')
        .attr('fill', function(d) { return 'url(#photo' + d.start.personId + ')'; })
        .attr('r', settings.photoSize)
        .attr('cx', todayPosition)
        .attr('cy', function(d, i) { return coordinator.forecastPosition(d.order); });
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



    lines.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    photos.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    lines.on('mousemove', moveBubble);
    photos.on('mousemove', moveBubble);
    lines.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
    photos.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
}

function highlightForecast(d) {
    hideHighlightedForecast();

    var f = d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
        .classed('hovered', true);
    f.moveToFront();
}

function hideHighlightedForecast(d) {
    d3.selectAll('.forecast')
        .classed('hovered', false);
}

function showBubble(d) {
    dom.forecastHoverBubble.container.datum(d);

    dom.forecastHoverBubble.getChild('date').text(function(d) { return d.start.date; });
    dom.forecastHoverBubble.getChild('name').text(function(d) { return d.start.personId; });
    dom.forecastHoverBubble.getChild('title').text(function(d) { return d.start.title; });
    dom.forecastHoverBubble.getChild('city').text(function(d) { return d.start.cite; });
    dom.forecastHoverBubble.getChild('link').text(function(d) {
        return '<a href="' + d.start.source.link + '">' + d.start.source.name + '</a>';
    });

    dom.forecastHoverBubble.container.style('display', 'block');
}

function moveBubble() {
    var x = d3.event.clientX + 10,
        y = d3.event.clientY + 20;

    dom.forecastHoverBubble.container.style('left', x + 'px');
    dom.forecastHoverBubble.container.style('top', y + 'px');
}

function hideBubble() {
    dom.forecastHoverBubble.container.style('display', 'none');
}

function redraw() {
    var loadingStartDate = coordinator.loadingStartDate(),
        loadingStopDate = coordinator.loadingStopDate();

    drawTimeScale(loadingStartDate, coordinator.loadingStopDate(true));
    drawQuotes(dataProvider.loadQuotes(loadingStartDate, loadingStopDate));
    var forecasts = dataProvider.loadForecast(loadingStartDate, loadingStopDate);
    drawForecast(forecasts);
}

module.exports = function() {
    coordinator.setTranslate(0);
    drawLayout();
    addPatterns();
    drawBackground();
    events.setRedrawCallback(redraw);
    redraw();
}
