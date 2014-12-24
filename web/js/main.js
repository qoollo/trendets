requirejs.config({
    baseUrl: 'js/',
    urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
        'libs/d3': "libs/d3.min",
    }
});

require(['draw'], function (draw) {
    console.log('Yo!');
    draw();
});