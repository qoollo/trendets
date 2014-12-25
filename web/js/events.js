define(['libs/d3', 'dom', 'coordinator'], function(d3, dom, coordinator) {
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 1])
        .on('zoom', onMove)
        .on('zoomend', onMoveStop);

    var redrawCallback = undefined,
        updateBubble = undefined;

    dom.background.call(zoom);

    function onMove() {
        dom.everything.attr('transform', 'translate(' + d3.event.translate[0] + ',0)');
        coordinator.setTranslate(d3.event.translate[0]);
        if (updateBubble !== undefined)
            updateBubble();
    }

    function onMoveStop() {
        if (redrawCallback !== undefined)
            redrawCallback();
    }

    return {
        setRedrawCallback: function(redraw, bubble) {
            redrawCallback = redraw;
            updateBubble = bubble;
        }
    }
});