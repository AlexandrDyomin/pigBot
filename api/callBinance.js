const getBarsInfo = require('./getBarsInfo.js');
const { URL_BARS_INFO, URL_MARKET_INFO } = require('./urls.js');
const getSummary = require('./getSummary.js');
const getInfoAboutCryptocurrencyPairs = require('./getInfoAboutCryptocurrencyPairs.js');


async function callBinance({
    url = URL_MARKET_INFO, 
    quotedCoin = 'USDT', 
    order = 'quoteVolume', 
    limit,
    interval
}) {
    let topPairsInfo = await getInfoAboutCryptocurrencyPairs({
        url: URL_MARKET_INFO, 
        quotedCoin: 'USDT', 
        order: 'quoteVolume', 
        limit
    });
    let store = [];

    for (let pair of topPairsInfo) {
        let barsInfo =  getBarsInfo({ 
            url: URL_BARS_INFO, 
            symbol: pair.symbol, 
            interval, 
            limit: 23 
        });

        store.push(getSummary(barsInfo, pair));
    }

    return (await Promise.all(store)).filter((item) => !!item);
}   

module.exports = callBinance;