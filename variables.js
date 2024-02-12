var pathToContacts = './subscribers.json';
var regExpKeyI = /-i\s(1[h, d, w, M])/;
var regExpKeyP = /-p\s(\d+[s, m, h, d])/;
var regExpKeyL = /-l\s(\d+)/;
var regExpKeyF = /-f\s(\d(,\s*\d)*)/;
let regExpIds = /(\d+(,\s*\d+)*)/

module.exports = { pathToContacts, regExpKeyI, regExpKeyP, regExpKeyL, regExpKeyF, regExpIds };