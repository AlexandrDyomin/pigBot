const fs = require('fs');
let { pathToContacts } = require('./variables');
let contacts = JSON.parse(fs.readFileSync(pathToContacts), (key, value) => {
    if (key == 'lastMsgTime') return new Date(value);
    return value;
});
let intervals = new Map;

module.exports = { contacts, intervals };