var merge = require('merge');

function MigrationHistory(driver, config) {
    
    config = merge(this.defaults, config);
    
    var self = this;
    
    this.getHistory = getHistory;
    this.addToHistory = addToHistory;
    this.removeFromHistory = removeFromHistory;
        
    function getHistory() {
        return ensureHistoryTable().then(function () {
            return driver.all('SELECT id, name, script FROM ' + config.historyTable + ' ORDER BY id');
        });
    }
    
    function addToHistory(row) {
        return ensureHistoryTable().then(function () {
            return driver.run('INSERT INTO ' + config.historyTable + ' (name, script) VALUES (?, ?)', row.name, row.script);
        });
    }
    
    function removeFromHistory(row) {
        return ensureHistoryTable().then(function () {
            return driver.run('DELETE FROM ' + config.historyTable + ' WHERE id = ?', row.id);
        });
    }
    
    function ensureHistoryTable() {
        return historyTableExists().then(function (exists) { return exists ? true : createHistoryTable() });
    }
    
    function createHistoryTable() {
        return driver.createTable(config.historyTable, {
            id: driver.intColumn({ pk: true }),
            name: driver.textColumn({ notNull: true }),
            script: driver.textColumn({ notNull: true })
        });
    }

    function historyTableExists() {
        return driver.tableExists(config.historyTable);
    }
}
MigrationHistory.prototype.defaults = {
    historyTable: '_MigrationHistory'
};

module.exports = MigrationHistory;