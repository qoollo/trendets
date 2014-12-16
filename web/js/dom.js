define(['libs/d3'], function(d3) {
    return {
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
});