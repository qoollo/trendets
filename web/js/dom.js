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
        dottedLines: d3.select('#graphics #dotted_lines'),
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
        getChild: function(selector) {
            return d3.select('#forecastHoverBubble').select(selector);
        }
    },
    forecastDetails: {
        container: d3.select('#forecastDetails'),
        getChild: function(selector) {
            return d3.select('#forecastDetails').select(selector);
        },
        hideButton: d3.select('#forecastDetails #hideDetails'),
    },
}

result.containerWidth = result.container.node().offsetWidth;
result.containerHeight = result.container.node().offsetHeight;

module.exports = result;
