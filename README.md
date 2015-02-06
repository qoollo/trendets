trendets
========

## Environment

You need node.js installed. You can find it [here](http://nodejs.org/) or [here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
After installing node you will need to install gulp:
```sh
$ npm install --global gulp
```
Every time you checkout source code you may need to run
```sh
$ npm install
```

## Development

Run the following command in repository root folder:
```sh
$ gulp develop
```


## Release

Run the following command in repository root folder:
```sh
$ gulp release
```
After that you can take ./dist folder. It contains everything you need for deployment.


## Admin UI

Just run following command in repository root folder:
```sh
$ node .
```
Server will start. Now you can navigate to http://localhost:3001/admin

Also you can use
```sh
$ gulp develop
```
This task also starts server and opens admin page in your browser.


## Database

### Migrations

**Add Migration**

Migrations are sql-based. To add to migration run the following command
```sh
$ gulp add-migration --name MIGRATION_NAME
```
New migration will be generated. Migration consists of 3 files: up (sql), down (sql) and runner (js).
Having 'add-migration' task executed you will see generated files paths in terminal. Write migration
sql to up file and that's it.


**Update Database**

Update database to the latest version by executing 
```sh
$ gulp update-database
```
This task is executed during 'data' task therefore database you don't need to do it unless you want to debug 
migration I guess.
