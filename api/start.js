const getBarsInfo = require('./getBarsInfo.js');
const { URL_BARS_INFO } = require('./urls.js');
const getSummary = require('./getSummary.js');

function start(pairsInfo, interval) {
    let store = [];

    for (let pair of pairsInfo) {
        let barsInfo =  getBarsInfo({ 
            url: URL_BARS_INFO, 
            symbol: pair.symbol, 
            interval, 
            limit: 23 
        });

        store.push(getSummary(barsInfo, pair));
    }

    return store;
}   

module.exports = start;