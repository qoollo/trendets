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
                    .attr('y2', 0)
                    .attr('class','divider');
            dom.timeScale.container.append('line')
                    .attr('x1', 0)
                    .attr('y1', settings.timeScaleHeight)
                    .attr('x2', dom.containerWidth)                
                    .attr('y2', settings.timeScaleHeight)
                    .attr('class','axis');

            // today
            var x = coordinator.datePosition(coordinator.today());
            dom.today.append('line')
                .attr('id', 'today')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', dom.containerHeight);

            // graph background grid
            var grid = dom.graphics.container.append('g').attr('id','graph-bg-grid');
            grid.append('rect')
                .attr('x',0)            
                .attr('y',-settings.graphicsHeight)            
                .attr('height',settings.graphicsHeight)            
                .attr('width',x)
                .classed('grid-bg',true);

            // today footprint
            var footprintWidth = 300;
            dom.today.append('rect')
                     .classed('today-footprint',true)
                     .attr('x',x-footprintWidth)
                     .attr('y',0)
                     .attr('width',footprintWidth)
                     .attr('height',settings.graphicsHeight-1);

            // quotes
            dom.graphics.container.attr('transform', 'translate(0,' + settings.graphicsHeight + ')');

            // forecasts
            dom.forecasts.container.attr('transform', 'translate(0,' + (settings.graphicsHeight + settings.timeScaleHeight) + ')');
        }

        function drawBackground() {
            dom.background.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', dom.containerWidth)
                .attr('height', dom.containerHeight);
        }

        function drawTimeScale(start, stop) {
            var days = [];
            var d = new Date(start.getTime());
            while (d <= stop) {
                days.push(d);
                d = new Date(d.getTime());
                d.setDate(d.getDate() + 1);
            }

            var days = dom.timeScale.container.selectAll('.day')
                    .data(days, function(d) { return d; });

            var elements = days.enter().append('g').classed('day', true);
            
            elements.append('text')
                    .attr('x', coordinator.datePosition)
                    .attr('y', settings.timeScaleHeight - 15)
                    .text(function(d) { return d.getDate(); });

            elements.append('line')
                    .attr("x1",coordinator.datePosition)
                    .attr("y1",1)
                    .attr("x2",coordinator.datePosition)
                    .attr("y2",5)
                    .classed('ruler-marks',true);

            elements.append('line')
                    .attr("x1",coordinator.datePosition)
                    .attr("y1",18)
                    .attr("x2",coordinator.datePosition)
                    .attr("y2",settings.timeScaleHeight-1)
                    .classed('ruler-marks',true);

            days.exit().remove();
        }

        function drawQuote(data, type) {
            var q = dom.graphics.container.selectAll('.' + type)
                    .data(data.slice(1), function(d) { return type + d.day; });
                
            q.enter().append('line')
                .classed(type, true)
                .attr('x1', function(d) { return coordinator.datePosition(d.day); })
                .attr('y1', function(d) { return coordinator.quotePosition(d.value, type); })
                .attr('x2', function(d, i) { return coordinator.datePosition(data[i].day); })
                .attr('y2', function(d, i) { return coordinator.quotePosition(data[i].value, type); });

            q.exit().remove();
        }

        function drawQuotes(quotes) {
            drawQuote(quotes.oil, 'oil');
            drawQuote(quotes.dollar, 'dollar');
            drawQuote(quotes.euro, 'euro');


            // TEMPORARY! bobbies in the end of every graph
                var boobies = dom.graphics.container.append('g').attr('id','boobies');
                boobies.append('circle')
                       .attr('cx',coordinator.datePosition(coordinator.today()))     
                       .attr('cy',-settings.graphicsHeight+30)     
                       .attr('r',4)
                       .attr('style','fill:white;stroke:#7b6b8a;stroke-width:4');

                var boobies = dom.graphics.container.append('g').attr('id','boobies');
                boobies.append('circle')
                       .attr('cx',coordinator.datePosition(coordinator.today()))     
                       .attr('cy',-settings.graphicsHeight+50)     
                       .attr('r',4)
                       .attr('style','fill:white;stroke:#179ac5;stroke-width:4');

                var boobies = dom.graphics.container.append('g').attr('id','boobies');
                boobies.append('circle')
                       .attr('cx',coordinator.datePosition(coordinator.today()))     
                       .attr('cy',-settings.graphicsHeight+70)     
                       .attr('r',4)
                       .attr('style','fill:white;stroke:#7b37bd;stroke-width:4');
            // TEMPORARY! 
        }

        function drawNewOpenForecasts(lines, photos) {
            lines.append('line')
                .attr('x1', function(d) { return coordinator.datePosition(d.start.date) })
                .attr('y1', 0)
                .attr('x2', function(d) { return d.x; })
                .attr('y2', function(d) { return d.y; });

            var startRect = lines.append('rect')
                .classed('forecastStart', true)
                .attr('x', function(d) { return coordinator.datePosition(d.start.date) - 6; })
                .attr('y', - 6)
                .attr('width', 9)
                .attr('height', 9);


            var photo = photos.append('g').classed('photo', true);
            photo.append('circle')
                .attr('cx', coordinator.datePosition(coordinator.today()))
                .attr('cy', function(d,i) { return 20 + 30 * i; })
                .attr('r', 10);

            startRect.on('mouseover', events.showOpenForecast);
            photo.on('mouseover', events.showOpenForecast);
        }

        function drawNewClosedForecasts(lines, photos) {
            lines.append('path')
                .attr('d', function(d) {
                    var startX = coordinator.datePosition(d.start.date),
                        stopX = coordinator.datePosition(d.end.date);
                    return 'M' + startX + ',0 L' + d.x + ',' + d.y + ' L' + stopX + ',0';
                });

            var startRect = lines.append('rect')
                .classed('forecastStart', true)
                .attr('x', function(d) { return coordinator.datePosition(d.start.date) - 6; })
                .attr('y', -6)
                .attr('width', 9)
                .attr('height', 9);

            var stopRect = lines.append('rect')
                .classed('forecastStop', true)
                .attr('x', function(d) { return coordinator.datePosition(d.end.date) - 6; })
                .attr('y', -6)
                .attr('width', 9)
                .attr('height', 9);

            var photo = photos.append('g').classed('photo', true);
            photo.append('circle')
                .attr('r', 10)
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });

            photo.on('mouseover', events.showClosedForecast);
            startRect.on('mouseover', events.showClosedForecast);
            stopRect.on('mouseover', events.showClosedForecast);
        }

        function drawOpenForecast(forecasts) {
            var todayX = coordinator.datePosition(coordinator.today());

            for (var i = 0; i < forecasts.length; i++) {
                forecasts[i].x = todayX;
                forecasts[i].y = 20 + 30 * i;
            }

            var lines = dom.forecasts.lines.selectAll('.openForecast')
                    .data(forecasts, function(d) { return d.id; });
            var newLines = lines.enter().append('g')
                    .classed('openForecast forecast', true);
            lines.exit().remove();

            var photos = dom.forecasts.photos.selectAll('.openForecast')
                    .data(forecasts, function(d) { return d.id; });
            var newPhotos = photos.enter().append('g')
                    .classed('openForecast forecast', true);
            photos.exit().remove();

            drawNewOpenForecasts(newLines, newPhotos);
        }

        function drawClosedForecast(forecasts) {
            for (var i = 0; i < forecasts.length; i++) {
                var f = forecasts[i];
                f.x = (coordinator.datePosition(f.start.date) + coordinator.datePosition(f.end.date)) / 2;
                f.y = 30 + 0.2  *(coordinator.datePosition(f.end.date) - coordinator.datePosition(f.start.date));
                f.fixed = false;
            }
            var force = d3.layout.force()
                .nodes(forecasts)
                .gravity(0)
                .charge(-10)
                .chargeDistance(30)
                .friction(0.9);

            /*force.start();
            var k = 0;
            while ((force.alpha() > 1e-2) && (k < 150)) {
                force.tick(),
                k = k + 1;
            }*/


            var lines = dom.forecasts.lines.selectAll('.closedForecast')
                    .data(forecasts, function(d) { return d.id; });
            var newLines = lines.enter().append('g')
                    .classed('closedForecast forecast', true);
            lines.exit().remove();

            var photos = dom.forecasts.photos.selectAll('.closedForecast')
                    .data(forecasts, function(d) { return d.id; });
            var newPhotos = photos.enter().append('g')
                    .classed('closedForecast forecast', true);
            photos.exit().remove();

            drawNewClosedForecasts(newLines, newPhotos);
        }

        function redraw() {
            var stop = coordinator.stopDate(),
                start = coordinator.startDate(),
                loadingStartDate = coordinator.loadingStartDate(),
                loadingStopDate = coordinator.loadingStopDate();

            drawTimeScale(start, stop);
            drawQuotes(dataProvider.loadQuotes(loadingStartDate, loadingStopDate));
            drawOpenForecast(dataProvider.loadOpenForecast(start, loadingStopDate), coordinator.today());
            drawClosedForecast(dataProvider.loadClosedForecast(start, loadingStopDate));
        }

        return function() {
            coordinator.setTranslate(0);
            drawLayout();
            drawBackground();
            events.setRedrawCallback(redraw);
            redraw();
        }
    }
)