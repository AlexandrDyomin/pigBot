const getBarsInfo = require('./getBarsInfo.js');
const { URL_BARS_INFO } = require('./urls.js');
const getSummary = require('./getSummary.js');

async function callBinance({
    pairs,
    limit,
    interval
}) {
    try {
        let store = [];
        for (let pair of pairs) {
            let barsInfo =  getBarsInfo({ 
                url: URL_BARS_INFO, 
                symbol: (typeof pair) === 'string' ? pair : pair.symbol, 
                interval, 
                limit
            });

            store.push(getSummary(barsInfo, pair));
        } 
        
        return (await Promise.allSettled(store)).reduce((acc, item) => {
            item.value && acc.successful.push(item.value);
            item.reason && acc.unsuccessful.push(item.reason.message.match(/\w+$/)[0]);
            return acc;
        }, { 
            successful: [], 
            unsuccessful: [] 
        });
    } catch(error) {
        throw error;
    }
}   

module.exports = callBinance;