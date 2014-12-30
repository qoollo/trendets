var d3 = require('./libs/d3');

var result = {
    container: d3.select('#svgContainer'),
    svg: d3.select('#svgContainer svg'),
    everything: d3.select('#everything'),
    background: d3.select('#background'),
    bgGrid: d3.select('#graphBgGrid'),
    graphics: {
        container: d3.select('#graphics'),
        lines: d3.select('#graphics #lines'),
        boobies: d3.select('#graphics #boobies'),
        rects: d3.select('#graphics #rects'),
    },
    timeScale: {
        container: d3.select('#timeScale'),
        background: d3.select('#backTimeScale'),
    },
    today: d3.select('#today'),
    forecasts: {
        container: d3.select('#forecasts'),
        lines: d3.select('#forecasts #lines'),
        photos: d3.select('#forecasts #photos'),
    },
    forecastHoverBubble: {
        container: d3.select('#forecastHoverBubble'),
        getChild: function(name) {
            return d3.select('#forecastHoverBubble').select('.' + name);
        }
    },
}

result.containerWidth = result.container.node().offsetWidth;
result.containerHeight = result.container.node().offsetHeight;

module.exports = result;
