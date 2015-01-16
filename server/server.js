var express = require('express'),
    bodyParser = require('body-parser'),
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    })
    .post(function (req, res) {
        new TrendetsDb().connect()
            .then(function (db) {
                return db.CitationSources.create(req.body);
            })
            .then(responseJson(res), responseError(res));
    });
router.route('/citation-sources/:id')
    .put(function (req, res) {
        new TrendetsDb().connect()
            .then(function (db) {
                return db.CitationSources.get(req.params.id);
            })
            .then(function (item) {
                console.log('Found CitationSource with id =', item.id, '. Saving changes...', item);
                item.save(req.body, function (err) {
                    if (err)
                        responseError(res)(err);
                    else
                        responseJson(res)(item);
                });
            })
            .catch(responseError(res))
    })
    .delete(function (req, res) {
        new TrendetsDb().connect()
            .then(function (db) {
                return db.CitationSources.get(req.params.id)
            })
            .then(function (item) {
                return item.remove(function (err) {
                    if (err)
                        responseError(res)(err);
                    else
                        responseJson(res)(item);
                })
            })
            .catch(responseError(res));
    });
function responseJson(resp) {
    return function (result) {
        resp.json(result);
    }
}
function responseError(resp) {
    return function (err) {
        if (err && ('' + err).indexOf('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') !== -1)
            err = 'Cannot delete entry because it is referenced by other entries.';
        resp.status(500).json({ error: 'Serverside error: ' + err });
    }
}
app.use('/api', router);

/************************************************************************/

app.listen(settings.port);

console.log('Express server running.');
