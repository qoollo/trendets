var d3 = require('./libs/d3');
var dom = require('./dom');
var settings = require('./settings');
var dataProvider = require('./dataprovider');
var coordinator = require('./coordinator');
var events = require('./events');

function drawLayout() {
    // timescale
    dom.timeScale.container
        .attr('transform', 'translate(0,' + settings.graphicsHeight + ')');

    dom.timeScale.container.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', dom.containerWidth)                
            .attr('y2', 0)
            .attr('class','divider');
    dom.timeScale.container.append('line')
            .attr('x1', 0)
            .attr('y1', settings.timeScaleHeight)
            .attr('x2', dom.containerWidth)                
            .attr('y2', settings.timeScaleHeight)
            .attr('class','axis');

    // today
    var x = coordinator.datePosition(coordinator.today());
    dom.today.append('line')
        .attr('id', 'today')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', dom.containerHeight);

    // graph background grid
    var grid = dom.graphics.container.append('g').attr('id','graph-bg-grid');
    grid.append('rect')
        .attr('x',0)            
        .attr('y',-settings.graphicsHeight)            
        .attr('height',settings.graphicsHeight)            
        .attr('width',x)
        .classed('grid-bg',true);

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

    q.exit().remove();
}

function drawQuotes(quotes) {
    drawQuote(quotes.oil, 'oil');
    drawQuote(quotes.dollar, 'dollar');
    drawQuote(quotes.euro, 'euro');


    // TEMPORARY! bobbies in the end of every graph
        var boobies = dom.graphics.container.append('g').attr('id','boobies');
        boobies.append('circle')
               .attr('cx',coordinator.datePosition(coordinator.today()))     
               .attr('cy',-settings.graphicsHeight+30)     
               .attr('r',4)
               .attr('style','fill:white;stroke:#7b6b8a;stroke-width:4');

        var boobies = dom.graphics.container.append('g').attr('id','boobies');
        boobies.append('circle')
               .attr('cx',coordinator.datePosition(coordinator.today()))     
               .attr('cy',-settings.graphicsHeight+50)     
               .attr('r',4)
               .attr('style','fill:white;stroke:#179ac5;stroke-width:4');

        var boobies = dom.graphics.container.append('g').attr('id','boobies');
        boobies.append('circle')
               .attr('cx',coordinator.datePosition(coordinator.today()))     
               .attr('cy',-settings.graphicsHeight+70)     
               .attr('r',4)
               .attr('style','fill:white;stroke:#7b37bd;stroke-width:4');
    // TEMPORARY! 
}

function drawNewOpenForecasts(lines, photos) {
    lines.append('line')
        .attr('x1', function(d) { return coordinator.datePosition(d.start.date) })
        .attr('y1', 0)
        .attr('x2', function(d) { return d.x; })
        .attr('y2', function(d) { return d.y; });

    var startRect = lines.append('rect')
        .classed('forecastStart', true)
        .attr('x', function(d) { return coordinator.datePosition(d.start.date) - 3; })
        .attr('y', -3)
        .attr('width', 6)
        .attr('height', 6);


    var photo = photos.append('g').classed('photo', true);
    photo.append('circle')
        .attr('cx', coordinator.datePosition(coordinator.today()))
        .attr('cy', function(d) { return d.y; })
        .attr('r', 10);

    startRect.on('mouseover', events.showOpenForecast);
    photo.on('mouseover', events.showOpenForecast);
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
        .attr('r', 10)
        .attr('cx', function(d) { return coordinator.datePosition(d.start.date); })
        .attr('cy', 0);

    var photoEnd = photos.append('g').classed('photo', true);
    photoEnd.append('circle')
        .attr('r', 10)
        .attr('cx', function(d) { return coordinator.datePosition(d.end.date); })
        .attr('cy', 0);

    photoStart.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    photoEnd.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    //photoStart.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
    //photoEnd.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
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
        .attr('r', 10)
        .attr('cx', function(d) { return coordinator.datePosition(d.start.date); })
        .attr('cy', 0);

    var photoEnd = photos.append('g').classed('photo', true);
    photoEnd.append('circle')
        .attr('r', 10)
        .attr('cx', todayPosition)
        .attr('cy', function(d, i) { return coordinator.forecastPosition(d.order); });

    photoStart.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    photoEnd.on('mouseover', function(d) { highlightForecast(d); showBubble(d); });
    //photoStart.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
    //photoEnd.on('mouseout', function(d) { hideHighlightedForecast(d); hideBubble(d); });
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
}

function highlightForecast(d) {
    hideHighlightedForecast();

    d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
        .classed('selected', true);
}

function hideHighlightedForecast(d) {
    d3.selectAll('.forecast')
        .classed('selected', false);
}

function showBubble(d) {
    dom.forecastStartBubble.container.datum(d);
    dom.forecastEndBubble.container.datum(d);
    updateBubble();

    dom.forecastStartBubble.getChild('date').text(function(d) { return d.start.date; });
    dom.forecastStartBubble.getChild('name').text(function(d) { return d.start.personId; });
    dom.forecastStartBubble.getChild('title').text(function(d) { return d.start.title; });
    dom.forecastStartBubble.getChild('city').text(function(d) { return d.start.cite; });
    dom.forecastStartBubble.getChild('link').text(function(d) {
        return '<a href="' + d.start.source.link + '">' + d.start.source.name + '</a>';
    });

    dom.forecastStartBubble.container.style('display', 'block');
    dom.forecastEndBubble.container.style('display', 'block');
}

function hideBubble() {
    dom.forecastStartBubble.container.style('display', 'none');
    dom.forecastEndBubble.container.style('display', 'none');
}

function updateBubble() {
    dom.forecastStartBubble.container.style('left', function(d) {
        return coordinator.datePosition(d.start.date) - coordinator.leftPosition() + 'px';
    });

    var datum = dom.forecastEndBubble.container.datum();
    if (datum.isCameTrue !== undefined) {
        dom.forecastEndBubble.container.style('left', function(d) {
            return coordinator.datePosition(d.end.date) - coordinator.leftPosition() + 'px';
        });
    }
    else {
        dom.forecastEndBubble.container.style('left', function(d) {
            return coordinator.datePosition(coordinator.today()) - coordinator.leftPosition() + 50 + 'px';
        });
    }
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
    drawBackground();
    events.setRedrawCallback(redraw, updateBubble);
    redraw();
}
