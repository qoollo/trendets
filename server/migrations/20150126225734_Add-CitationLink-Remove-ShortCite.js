var Q = require('q');
var fs = require('fs');
var path = require('path');

function runSqlFile(driver, fileName) {
    var d = Q.defer(),
        filePath = path.join(__dirname, fileName);
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
        if (err) {
            d.reject();
            return console.log(err);
        }
        
        driver.runAll(data).then(function () {
            d.resolve(data);
        }, d.reject);
    });
    return d.promise;
}

exports.up = function (driver) {
	return runSqlFile(driver, '20150126225734_Add-CitationLink-Remove-ShortCite-up.sql');
};

exports.down = function (db, callback) {
	return runSqlFile(driver, '20150126225734_Add-CitationLink-Remove-ShortCite-down.sql');
};