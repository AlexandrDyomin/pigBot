const calcBOLL = require('./calcBOLL.js');
const analizePrice = require('./analizePrice.js');
const { URL_CHART } = require('./urls.js');

async function getSummary(data, { symbol,  quoteVolume }) {
    let res = await data;
    if (!res.length || res.length < 23) return null;
    
    let beforePenultimateBOLL = calcBOLL(res.slice(0, -2));
    let penultimateBOLL = calcBOLL(res.slice(1, -1));
    let currentBOLL = calcBOLL(res.slice(2));

    let summary = analizePrice({ 
        beforePenultimatePrice: res.at(-3)[4],
        penultimatePrice: res.at(-2)[4],
        currentPrice: res.at(-1)[4],
        beforePenultimateBOLL, 
        penultimateBOLL, 
        currentBOLL
    });

    let result = { 
        ...summary, 
        symbol, 
        currentPrice: formatNumber(+res.at(-1)[4], { digits: 2, prefix: '₮' }), 
        quoteVolume: formatNumber(+quoteVolume / 1000000, { digits: 2, prefix: '$', postfix: ' млн' }),
        chart: `${URL_CHART}/${symbol.slice(0,-4)}_USDT?type=spot`,
        diviation: formatNumber(summary.diviation * 100, { digits: 2, postfix: '%' })
    };

    return result;

    function formatNumber(value, { digits, prefix = '', postfix=''}) {
        return `${prefix}${digits ? value.toFixed(digits) : value}${postfix}`;
    }
}

module.exports = getSummary;
