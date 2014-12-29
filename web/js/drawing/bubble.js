var dom = require('./../dom');
var d3 = require('./../libs/d3');
var dataProvider = require('./../dataprovider');

var format = d3.time.format("%d.%m.%Y");

function showBubble(d) {
    dom.forecastHoverBubble.container.datum(d);

    dom.forecastHoverBubble.getChild('.date').text(function(d) { return format(d.start.date); });
    dom.forecastHoverBubble.getChild('.name').text(function(d) {
        return dataProvider.getPersonById(d.start.personId).shortName;
    });
    dom.forecastHoverBubble.getChild('.shortCite').text(function(d) { return d.start.shortCite; });

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

function showDetails(d) {
    dom.forecastDetails.container.datum(d);

    dom.forecastDetails.getChild('.start .date').text(function(d) { return format(d.start.date); });
    dom.forecastDetails.getChild('.start .name').text(function(d) {
        return dataProvider.getPersonById(d.start.personId).shortName;
    });
    dom.forecastDetails.getChild('.start .title').text(function(d) { return d.start.title; });
    dom.forecastDetails.getChild('.start .cite').text(function(d) { return d.start.cite; });
    dom.forecastDetails.getChild('.start .link')
        .attr('href', function(d) { return d.start.source.link; })
        .text(function(d) { return d.start.source.name; });

    if (d.isCameTrue !== undefined) {
        dom.forecastDetails.getChild('.result .date').text(function(d) { return format(d.end.date); });
        dom.forecastDetails.getChild('.result .name').text(function(d) {
            return dataProvider.getPersonById(d.end.personId).shortName;
        });
        dom.forecastDetails.getChild('.result .title').text(function(d) { return d.end.title; });
        dom.forecastDetails.getChild('.result .cite').text(function(d) { return d.end.cite; });
        dom.forecastDetails.getChild('.result .link')
            .attr('href', function(d) { return d.end.source.link; })
            .text(function(d) { return d.end.source.name; });

        dom.forecastDetails.getChild('.result').style('display', 'block');
    }
    else
        dom.forecastDetails.getChild('.result').style('display', 'none');

    dom.forecastDetails.container.classed('shown', true);
}

function hideDetails() {
    dom.forecastDetails.container.classed('shown', false);
}

module.exports = {
    showBubble: showBubble,
    hideBubble: hideBubble,
    moveBubble: moveBubble,
    showDetails: showDetails,
    hideDetails: hideDetails, 
}