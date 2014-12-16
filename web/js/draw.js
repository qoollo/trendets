define(['libs/d3', 'dom', 'settings'], function(d3, dom, settings) {
    var today = new Date();

    var width = dom.container.node().offsetWidth,
        height = dom.container.node().offsetHeight;

    function dateDiff(d1, d2) {
        return (d1 - d2) / 24 / 3600000 * settings.dayWidth;
    }

    function drawTimeScale() {
        dom.timeScale.container
            .attr('transform', 'translate(0,' + settings.graphicsHeight + ')');
            
        dom.timeScale.container.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', width)                
                .attr('y2', 0);
        dom.timeScale.container.append('line')
                .attr('x1', 0)
                .attr('y1', settings.timeScaleHeight)
                .attr('x2', width)                
                .attr('y2', settings.timeScaleHeight);

        var days = [];
        for (var i = 0; i < 30; i++) {
            var d = new Date(today.getTime());
            d.setDate(d.getDate() - i);
            days.push(d);
        }

        dom.timeScale.container.selectAll('.day')
                .data(days)
            .enter().append('text')
                .classed('day', true)
                .attr('x', function(d) {
                    return width - settings.futureMargin + dateDiff(d, today);
                })
                .attr('y', settings.timeScaleHeight / 2)
                .text(function(d) { return d.getDate(); });
    }

    function drawQuote(data, type) {
        dom.graphics.container.selectAll('.' + type)
                .data(data)
            .enter().append('line')
                .classed(type, true)
                .attr('x1', function(d, i) {
                    return width - settings.futureMargin + dateDiff(d.day, today);
                })
                .attr('y1', function(d, i) { return -d.value; })
                .attr('x2', function(d, i) {
                    var prev = i > 0 ? data[i - 1] : d;
                    return width - settings.futureMargin + dateDiff(prev.day, today);
                })
                .attr('y2', function(d, i) { return i > 0 ? -data[i - 1].value : -d.value; })
    }

    function drawQuotes() {
        dom.graphics.container.attr('transform', 'translate(0,' + settings.graphicsHeight + ')');

        /*d3.json('../data/quotes/oil.json', function(error, data) {
            if (error)
                return console.warn(error);
            else
                drawOil(data);
        })*/
        var oil = [],
            dollar = [],
            euro = [];
        for (var i = 0; i < 30; i++) {
            var d = new Date(today.getTime());
            d.setDate(d.getDate() - i);
            oil.push({
                day: d,
                value: Math.random() * 70,
            })
            dollar.push({
                day: d,
                value: Math.random() * 70,
            })
            euro.push({
                day: d,
                value: Math.random() * 70,
            })
        }
        drawQuote(oil, 'oil');
        drawQuote(dollar, 'dollar');
        drawQuote(euro, 'euro');
    }

    return function() {
        drawTimeScale();
        drawQuotes();
    }
})