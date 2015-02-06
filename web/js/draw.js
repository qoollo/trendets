var d3 = require('./libs/d3');
var dom = require('./dom');
var settings = require('./settings');
var dataProvider = require('./dataprovider');
var coordinator = require('./coordinator');
var events = require('./events');

var drawing = {
    forecast: require('./drawing/forecast'),
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
    this.parentNode.appendChild(this);
    });
};

function drawLayout() {
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
    /*var footprintWidth = 300;
    dom.today.append('rect')
             .classed('today-footprint',true)
             .attr('x',x-footprintWidth)
             .attr('y',0)
             .attr('width',footprintWidth)
             .attr('height',settings.graphicsHeight-1);*/

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

function drawQuoteLinesForDays(lines, boobies, type, data) {
    lines.append('line')
        .classed(type, true)
        .attr('x1', 0)
        .attr('y1', function(d) { return coordinator.quotePosition(d[type], type); })
        .attr('x2', -settings.dayWidth - 0)
        .attr('y2', function(d, i) { return coordinator.quotePosition(data[i][type], type); });

    boobies.append('circle')
           .attr('cx', 0)     
           .attr('cy', function(d) { return coordinator.quotePosition(d[type], type); })     
           .attr('r', function(d) { return d.day.getDMY() == coordinator.today().getDMY() ? 4 : 2; })
           .classed(type + "-boobie boobie", true);

    boobies.append('circle')
           .attr('cx', 0)     
           .attr('cy', function(d) { return coordinator.quotePosition(d[type], type); })     
           .attr('r', function(d) { return d.day.getDMY() == coordinator.today().getDMY() ? 0 : 10; })
           .classed(type + "-boobie boobie-big", true);

    boobies.append('circle')
           .attr('cx', 0)     
           .attr('cy', function(d) { return coordinator.quotePosition(d[type], type); })     
           .attr('r', function(d) { return d.day.getDMY() == coordinator.today().getDMY() ? 0 : 10; })
           .classed(type + "-boobie boobie-big", true);

    boobies.append('text')
           .attr('x', 12)     
           .attr('y', function(d) { return coordinator.quotePosition(d[type], type) + 4; })
           .text(function(d) {
                if (d.day.getDMY() == coordinator.today().getDMY()) {
                    return d[type].formatQuote(type) + " за " + getRusQuote(type);  
                } else {
                    return d[type].formatQuote(type);
                }
            })   
           .classed(type + "-boobie quote-text", true);
}

function getRusQuote(type){
    switch (type) {
        case "oil":
            return "нефть марки Brent"
            break
        case "dollar":
            return "доллар"
            break
        case "euro":
            return "евро"
            break
    }
}

Number.prototype.formatQuote = function(curType) {
    return this.toFixed(2).toString() + curSign(curType);
    function curSign(sign) {
        return sign == "oil" ? " $" : " ₽"
    } 
}

function drawDottedLinesForDays(lines, data) {
    lines.append('line')
        .attr('x1',0)
        .attr('y1',-settings.graphicsHeight)
        .attr('x2',0) 
        .attr('y2',0)
        .attr('class','dotted');
}

function showDayQuotes(d) {
    d3.selectAll('.quoteDay').filter(function(od) { return od.day == d.day; })
        .classed('hovered', true);
}

function hideDayQuotes(d) {
    d3.selectAll('.quoteDay').filter(function(od) { return od.day == d.day; })
        .classed('hovered', false);
}

function addNewQuoteDays(list) {
    return list.enter().append('g')
        .classed('quoteDay', true)
        .classed('today', function(d) { return d.day.getDMY() == coordinator.today().getDMY(); })
        .attr('transform', function(d) { return 'translate(' + coordinator.datePosition(d.day) + ',0)'; });
}

Date.prototype.getDMY = function() {
    return this.getDate() + "/" + this.getMonth() + "/" + this.getFullYear();
}

function drawQuoteLines(data) {
    var lines = dom.graphics.lines.selectAll('.quoteDay')
            .data(data.slice(1), function(d) { return d.day; });
    var boobies = dom.graphics.boobies.selectAll('.quoteDay')
            .data(data, function(d) { return d.day; });
    var rects = dom.graphics.rects.selectAll('.quoteDay')
            .data(data, function(d) { return d.day; });
    var dottedLines = dom.graphics.dottedLines.selectAll('.quoteDay')
            .data(data, function(d) { return d.day; });
        
    var newLines = addNewQuoteDays(lines);
    var newDottedLines = addNewQuoteDays(dottedLines);
    var newBoobies = addNewQuoteDays(boobies);
    var newRects = addNewQuoteDays(rects);

    drawQuoteLinesForDays(newLines, newBoobies, 'oil', data);
    drawQuoteLinesForDays(newLines, newBoobies, 'dollar', data);
    drawQuoteLinesForDays(newLines, newBoobies, 'euro', data);
    
    drawDottedLinesForDays(newDottedLines, data);

    newRects.append('rect')
        .classed('hoverRect', true)
        .attr('x', -settings.dayWidth / 2)
        .attr('y', -settings.graphicsHeight)
        .attr('width', settings.dayWidth)
        .attr('height', settings.graphicsHeight)
        .on('mouseover', showDayQuotes)
        .on('mouseout', hideDayQuotes);

    lines.exit().remove();
    boobies.exit().remove();
    rects.exit().remove();
    dottedLines.exit().remove();
}

function drawQuotes(quotes) {
    drawQuoteLines(quotes);
}

function redraw() {
    var loadingStartDate = coordinator.loadingStartDate(),
        loadingStopDate = coordinator.loadingStopDate();

    drawTimeScale(loadingStartDate, coordinator.loadingStopDate(true));
    drawQuotes(dataProvider.loadQuotes(loadingStartDate, loadingStopDate));
    var forecasts = dataProvider.loadForecast(loadingStartDate, loadingStopDate);
    drawing.forecast.drawForecast(forecasts);
}

module.exports = function() {
    coordinator.setTranslate(0);
    drawLayout();
    drawBackground();
    events.setRedrawCallback(redraw);
    redraw();
}
