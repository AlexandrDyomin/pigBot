const fs = require('fs');
let { pathToContacts } = require('./variables');
let contacts = JSON.parse(fs.readFileSync(pathToContacts));
let intervals = new Map;

module.exports = { contacts, intervals };