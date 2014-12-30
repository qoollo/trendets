var d3 = require('./libs/d3');
var dom = require('./dom');
var coordinator = require('./coordinator');

var redrawCallback = undefined;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 1])
    .on('zoom', onMove)
    .on('zoomend', onMoveStop);

dom.background.call(zoom);

function onMove() {
    dom.everything.attr('transform', 'translate(' + d3.event.translate[0] + ',0)');
    coordinator.setTranslate(d3.event.translate[0]);
}

function onMoveStop() {
    if (redrawCallback !== undefined)
        redrawCallback();
}

function updateBubble(x, y, date, personId, title, cite, link) {
    dom.forecastBubble.container.style('display', 'block');
    dom.forecastBubble.container.style('left', x + 20 + 'px');

    dom.forecastBubble.date.text(date);
    dom.forecastBubble.name.text(personId);
    dom.forecastBubble.title.text(title);
    dom.forecastBubble.cite.text(cite);
    dom.forecastBubble.link.text('<a href="#">' + link.name + '</a>');
}

module.exports = {
    showForecast: function (d, i) {
        d3.selectAll('.forecast')
            .classed('selected', false);
        d3.selectAll('.forecast').filter(function (od) { return od.id == d.id })
            .classed('selected', true);
    },
    setRedrawCallback: function(redraw, bubble) {
        redrawCallback = redraw;
    }
}
