var q = require('q');
var parse = require('xml-parser');
var request = require('request');
require('date-utils');


function QuotesRetriever() {

    this.getQuotes = function (fromDate, toDate) {
        var d = q.defer(),
            promises = [];

        if (fromDate === undefined)
            fromDate = fromDate.today();
        else
            fromDate.clearTime();

        if (toDate === undefined)
            promises.push(requestQuotes(fromDate));
        else {
            var cur = fromDate;
            toDate.clearTime();
            while (cur < toDate) {
                promises.push(requestQuotes(cur.clone()));
                cur.addDays(1);
            }
        }       

        q.all(promises).then(d.resolve, d.reject);

        return d.promise;
    };

    function requestQuotes(date) {
        var d = q.defer(),
            dateStr = date.toFormat('DD/MM/YYYY');
        request('http://www.cbr.ru/scripts/XML_daily_eng.asp?date_req=' + dateStr, function (error, response, body) {
            if (error) {
                console.error(error);
                d.reject(error);
            } else if (response.statusCode == 200) {
                var quotes = parseQuotes(body);
                quotes.date = date;
                d.resolve(quotes);
            }
        });
        return d.promise;
    }

    function parseQuotes(responseBody) {
        var responseJson = parse(responseBody),
            currencies = findNodesOfType(responseJson, 'Valute'),
            res = {
                usd: getCurrencyValue(currencies, 'USD'),
                eur: getCurrencyValue(currencies, 'EUR')
            };
        
        return res;
    }

    function findNodesOfType(parsedXml, type) {
        var res = [],
            cur = parsedXml.root ? parsedXml.root : parsedXml;
        
        if (cur.name == type)
            res.push(cur);

        for (var i = 0; cur.children && i < cur.children.length; i++) {
            var nodes = findNodesOfType(cur.children[i], type);
            for (var j = 0; j < nodes.length; j++) {
                res.push(nodes[j]);
            }
        }
        
        return res;
    }

    function getCurrencyValue(currencies, charCode) {
        var currency = findCurrency(currencies, charCode),
            value = Number(findNodesOfType(currency, 'Value')[0].content.replace(',', '.'));
        return value;
    }

    function findCurrency(currencies, charCode) {
        return currencies.filter(function (e) { return findNodesOfType(e, 'CharCode')[0].content == charCode })[0];
    }
}

module.exports = new QuotesRetriever();
