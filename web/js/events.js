define(['libs/d3', 'dom'], function(d3, dom) {
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
        showOpenForecast: function(d, i) {
            updateBubble(d.x, d.y, d.start.date, d.start.personId, d.start.title, d.start.cite, d.start.source);
            d3.selectAll('.forecast')
                .classed('selected', false);
            d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
                .classed('selected', true);
        },
        showClosedForecast: function(d, i) {
            updateBubble(d.x, d.y, d.start.date, d.start.personId, d.start.title, d.start.cite, d.start.source);
            d3.selectAll('.forecast')
                .classed('selected', false);
            d3.selectAll('.forecast').filter(function(od) { return od.id == d.id })
                .classed('selected', true);
        },
    }
});