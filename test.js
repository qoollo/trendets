var TrendetsDb = require('./server/db');

new TrendetsDb()
	.connect()
	.then(function (db) {
		return db.People.all();
	})
	.then(function (people) {
		for (var i = people.length - 1; i >= 0; i--) {
			console.log(people[i])
		};
	})