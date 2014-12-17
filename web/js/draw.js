define(['libs/d3', 'dom', 'settings', 'dataprovider', 'coordinator'],
    function(d3, dom, settings, dataProvider, coordinator) {
        function drawLayout() {
            // timescale
            dom.timeScale.container
                .attr('transform', 'translate(0,' + settings.graphicsHeight + ')');
                
            dom.timeScale.container.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', dom.containerWidth)                
                    .attr('y2', 0);
            dom.timeScale.container.append('line')
                    .attr('x1', 0)
                    .attr('y1', settings.timeScaleHeight)
                    .attr('x2', dom.containerWidth)                
                    .attr('y2', settings.timeScaleHeight);

            // quotes
            dom.graphics.container.attr('transform', 'translate(0,' + settings.graphicsHeight + ')');
        }


        function drawTimeScale(start, stop) {
            var days = [];
            var d = new Date(start.getTime());
            while (d <= stop) {
                days.push(d);
                d = new Date(d.getTime());
                d.setDate(d.getDate() + 1);
            }

            dom.timeScale.container.selectAll('.day')
                    .data(days)
                .enter().append('text')
                    .classed('day', true)
                    .attr('x', coordinator.datePosition)
                    .attr('y', settings.timeScaleHeight / 2)
                    .text(function(d) { return d.getDate(); });
        }

        function drawQuote(data, type) {
            dom.graphics.container.selectAll('.' + type)
                    .data(data)
                .enter().append('line')
                    .classed(type, true)
                    .attr('x1', function(d) { return coordinator.datePosition(d.day); })
                    .attr('y1', function(d) { return coordinator.quotePosition(d.value, type); })
                    .attr('x2', function(d, i) { return coordinator.datePosition((i > 0 ? data[i-1] : d).day); })
                    .attr('y2', function(d, i) { return coordinator.quotePosition((i > 0 ? data[i-1] : d).value, type); })
        }

        function drawQuotes(quotes) {
            drawQuote(quotes.oil, 'oil');
            drawQuote(quotes.dollar, 'dollar');
            drawQuote(quotes.euro, 'euro');
        }

        return function() {
            var stop = coordinator.stopDate(),
                start = coordinator.startDate();

            drawLayout()
            drawTimeScale(start, stop);
            drawQuotes(dataProvider.loadQuotes(start, stop));
        }
    }
)