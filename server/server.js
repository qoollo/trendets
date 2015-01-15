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
        var db = new TrendetsDb();
        db.connect()
            .then(function () {
                console.log('Request body: ', req.body);
                if (req.body.id) {
                    console.log('Updating CitationSource...');
                    return db.CitationSources.get(req.body.id)
                                             .then(function (item) {
                                                 console.log('Found CitationSource with id =', item.id, '. Saving changes...', item);
                                                 item.save(req.body, function (err) {
                                                     if (err)
                                                         throw err;
                                                         //responseError(res)(err);
                                                     else
                                                         return item;
                                                         //responseJson(res)(item);
                                                 });
                                             });
                } else {
                    console.log('Inserting CitationSource...');
                    return db.CitationSources.create(req.body);
                }
            }, responseError(res))
            .then(responseJson(res), responseError(res));
    });
function responseJson(resp) {
    return function (result) {
        resp.json(result);
    }
}
function responseError(resp) {
    return function (err) {
        resp.status(500).json({ error: 'Serverside error: ' + err });
    }
}
app.use('/api', router);

/************************************************************************/

app.listen(settings.port);

console.log('Express server running.');
