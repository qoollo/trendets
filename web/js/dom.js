define(['libs/d3'], function(d3) {
    var result = {
        container: d3.select('#svgContainer'),
        svg: d3.select('#svgContainer svg'),
        everything: d3.select('#everything'),
        background: d3.select('#background'),
        graphics: {
            container: d3.select('#graphics'),
        },
        timeScale: {
            container: d3.select('#timeScale'),
        },
        today: d3.select('#today'),
        forecasts: d3.select('#forecasts'),
        forecastBubble: {
            container: d3.select('#forecastBubble'),
            date: d3.select('#forecastBubble #date'),
            name: d3.select('#forecastBubble #name'),
            title: d3.select('#forecastBubble #title'),
            cite: d3.select('#forecastBubble #cite'),
            link: d3.select('#forecastBubble #link'),
        }
    }

    result.containerWidth = result.container.node().offsetWidth;
    result.containerHeight = result.container.node().offsetHeight;

    return result;
});