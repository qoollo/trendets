var dom = require('./../dom');
var d3 = require('./../libs/d3');
var dataProvider = require('./../dataprovider');

function showBubble(d) {
    var format = d3.time.format("%d.%m.%Y");
    dom.forecastHoverBubble.container.datum(d);

    dom.forecastHoverBubble.getChild('date').text(function(d) { return format(d.start.date); });
    dom.forecastHoverBubble.getChild('name').text(function(d) {
        return dataProvider.getPersonById(d.start.personId).shortName;
    });
    dom.forecastHoverBubble.getChild('shortCite').text(function(d) { return d.start.shortCite; });

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

module.exports = {
    showBubble: showBubble,
    hideBubble: hideBubble,
    moveBubble: moveBubble,    
}