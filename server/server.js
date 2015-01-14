var express = require('express'),
    settings = require('./settings'),
    path = require('path'),
    TrendetsDb = require('./db');

console.log('Starting Express server...');

var app = express(),
    router = express.Router();

app.get(/^\/admin/, function (res, res) {
    res.sendFile(path.join(settings.path, '/web/admin/html/admin.html'));
});
app.use(express.static(path.join(settings.path, '/web/admin')));


/************************************************************************/
/*                              REST API                                */
/************************************************************************/
router.get('/', function (req, res) {
    res.json({ message: 'Welcome to Qoollo Trendets API' });
});
router.use(function (req, res, next) {
    console.log('// [' + req.method + '] ' + req.originalUrl);
    next();
});
router.route('/citation-sources')
    .get(function (req, res) {
        var db = new TrendetsDb();
        db.connect()
            .then(function () {
                return db.CitationSources.all()
            }, responseError(res))
            .then(responseJson(res), responseError(res));
    });
function responseJson(resp) {
    return function (result) {
        resp.json(result);
    }
}
function responseError(resp) {
    return function () {
        resp.status(500).json({ error: 'Serverside error' });
    }
}
app.use('/api', router);

/************************************************************************/

app.listen(settings.port);

console.log('Express server running.');
