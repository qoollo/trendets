define(['libs/d3', 'dom'], function(d3, dom) {
    return {
        showOpenForecast: function(d, i) {
            dom.forecastBubble.container.style('display', 'block');
            dom.forecastBubble.date.text(d.startDate);
            dom.forecastBubble.name.text(d.personId);
            dom.forecastBubble.title.text(d.title);
            dom.forecastBubble.cite.text(d.cite);
            dom.forecastBubble.link.text('<a href="#">' + d.source.name + '</a>');
        }
}
});