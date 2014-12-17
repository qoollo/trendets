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
    }

    result.containerWidth = result.container.node().offsetWidth;
    result.containerHeight = result.container.node().offsetHeight;

    return result;
});