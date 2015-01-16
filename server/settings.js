var path = require('path');

module.exports = {
    path: path.normalize(path.join(__dirname, '..')),
    port: process.env.NODE_PORT || 3001
}