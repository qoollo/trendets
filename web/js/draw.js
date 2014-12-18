define(['libs/d3', 'dom', 'settings', 'dataprovider', 'coordinator', 'events'],
    function(d3, dom, settings, dataProvider, coordinator, events) {
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

            // forecasts
            dom.forecasts.attr('transform', 'translate(0,' + (settings.graphicsHeight + settings.timeScaleHeight) + ')');
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

        function drawToday(today) {
            var x = coordinator.datePosition(today);
            dom.today.append('line')
                .attr('id', 'today')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', dom.containerHeight);
        }

        function drawOpenForecast(forecasts, today) {
            var of = dom.forecasts.selectAll('.openForecast')
                    .data(forecasts)
                .enter().append('g')
                    .classed('openForecast', true);
            
            var todayX = coordinator.datePosition(today);

            of.append('line')
                .attr('x1', function(d) { return coordinator.datePosition(d.startDate) })
                .attr('y1', 0)
                .attr('x2', todayX)
                .attr('y2', function(d,i) { return 20 + 30 * i; });

            var photo = of.append('g').classed('photo', true);
            photo.append('circle')
                .attr('cx', todayX)
                .attr('cy', function(d,i) { return 20 + 30 * i; })
                .attr('r', 10);

            photo.on('mouseover', events.showOpenForecast);
        }

        function drawClosedForecast(forecasts) {
            var cf = dom.forecasts.selectAll('.closedForecast')
                    .data(forecasts)
                .enter().append('g')
                    .classed('closedForecast', true);

            cf.append('path')
                .attr('d', function(d,i) {
                    var startX = coordinator.datePosition(d.start.date),
                        stopX = coordinator.datePosition(d.end.date);
                    return 'M' + startX + ',0 L' + (startX + stopX) / 2 + ',100 L' + stopX + ',0';
                });
        }

        return function() {
            var stop = coordinator.stopDate(),
                start = coordinator.startDate();

            drawLayout()
            drawTimeScale(start, coordinator.endTimelineDate());
            drawToday(coordinator.stopDate());
            drawQuotes(dataProvider.loadQuotes(start, stop));
            drawOpenForecast(dataProvider.loadOpenForecast(start, stop), stop);
            drawClosedForecast(dataProvider.loadClosedForecast(start, stop));
        }
    }
)