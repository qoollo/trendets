define(['libs/d3', 'dom', 'coordinator'], function(d3, dom, coordinator) {
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .on('zoom', onMove)
        .on('zoomend', onMoveStop);

    var redrawCallback = undefined;

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

    return {
        showForecast: function(d, i) {
            //updateBubble(d.x, d.y, d.start.date, d.start.personId, d.start.title, d.start.cite, d.start.source);
            d3.selectAll('.forecast')
                .classed('selected', false);
            d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
                .classed('selected', true);
        },
        setRedrawCallback: function(callback) {
            redrawCallback = callback;
        }
    }
});