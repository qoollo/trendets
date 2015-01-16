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
app.use(bodyParser({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

router.get('/', function (req, res) {
    res.json({ message: 'Welcome to Qoollo Trendets API' });
});
router.use(function (req, res, next) {
    console.log('// [' + req.method + '] ' + req.originalUrl);
    next();
});

addRestResource('Forecasts');
addRestResource({ resource: 'citation-sources', model: 'CitationSources' });
addRestResource('People');
addRestResource('Quotes');

//  Adds REST resouce for db model with GET, POST, UPDATE, DELETE handlers
function addRestResource(name) {

    var settings = {
        resource: name,
        model: name
    };
    if (typeof name === 'object') 
        settings = name; 

    router.route('/' + settings.resource)
        .get(function (req, res) {
            new TrendetsDb().connect()
                .then(function (db) {
                    return db[settings.model].all()
                })
                .then(responseJson(res), responseError(res));
        })
        .post(function (req, res) {
            new TrendetsDb().connect()
                .then(function (db) {
                    return db[settings.model].create(req.body);
                })
                .then(responseJson(res), responseError(res));
        });
    router.route('/' + settings.resource + '/:id')
        .put(function (req, res) {
            new TrendetsDb().connect()
                .then(function (db) {
                    return db[settings.model].get(req.params.id);
                })
                .then(function (item) {
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
                    return db[settings.model].get(req.params.id)
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
}
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
