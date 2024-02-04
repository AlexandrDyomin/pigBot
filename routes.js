const pug = require('pug');
const { readFileSync } = require('fs');
const calcBOLL = require('./api/calcBOLL.js');
const getBarsInfo = require('./api/getBarsInfo.js');
const analizePrice = require('./api/analizePrice.js');
const { URL_MARKET_INFO, URL_BARS_INFO, URL_CHART } = require('./api/urls.js');
const getInfoAboutCryptocurrencyPairs = require('./api/getInfoAboutCryptocurrencyPairs.js');

let routes = {
    '/': sendIndexPage,
    '/style.css': (req, res) => sendResource(res, { 
        source: './style.css', 
        contentType: 'text/css'
    }),
    '/handleIntervalChange.js': (req, res) => sendResource(res, { 
        source: './handleIntervalChange.js', 
        contentType: 'application/javascript'
    }),
    default: postPage404
};

async function sendIndexPage(req, res) {
    try {
        let topPairsInfo = await getInfoAboutCryptocurrencyPairs({
            url: URL_MARKET_INFO, 
            quotedCoin: 'USDT', 
            order: 'quoteVolume', 
            limit: 100
        });
        
        let url = new URL(`${req.headers.host}${req.url}`);
        let interval = url.searchParams.get('interval') || '1d' ;
        let validIntervals = ['1d', '1w', '1M'];
        if (!validIntervals.includes(interval)) {
            throw Error('Указан недопустимый интервал. Укажите любой из следующих интервалов: 1d, 1w, 1M');
        }
        let data = start(topPairsInfo, interval);
        let info = await Promise.all(await data);
        info = info.filter((item) => !!item);
        
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(pug.renderFile('./index.pug', { info, interval, cache: true }));

        async function start(pairsInfo, interval) {
            let store = [];

            for (let pair of pairsInfo) {
                let barsInfo =  getBarsInfo({ 
                    url: URL_BARS_INFO, 
                    symbol: pair.symbol, 
                    interval, 
                    limit: 23 
                });

                store.push(processKlinesData(barsInfo, pair));
            }

            return store;
            
            async function processKlinesData(data, { symbol,  quoteVolume }) {
                let res = await data;
                if (res.length < 23) return null;
                
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
                    currentPrice: formatNumber(+res.at(-1)[4], { digits: 2, prefix: '$' }), 
                    quoteVolume: formatNumber(+quoteVolume / 1000000, { digits: 2, prefix: '$', postfix: ' млн' }),
                    chart: `${URL_CHART}/${symbol.slice(0,-4)}_USDT?type=spot`,
                    diviation: formatNumber(summary.diviation * 100, { digits: 2, postfix: '%' })
                };
                
                return result;
            }

            function formatNumber(value, { digits, prefix = '', postfix=''}) {
                return `${prefix}${digits ? value.toFixed(digits) : value}${postfix}`;
            }
        }      
    } catch (err) {
        handleError(res, err);
    }
}

function postPage404(req, res) {
    res.writeHead(404);
    res.end('Page not found');
}

function sendResource(res, { source, contentType, cacheControl = 'public, max-age=31536000'}) {
    try {
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': cacheControl});
        res.end(readFileSync(source));
    } catch(err) {
        handleError(res, err);
    }
}

function handleError(res, err, codeResponse = 500, headers = { 'Content-Type': 'text/html; charset=utf-8' }) {
    console.log(err);
    res.writeHead(codeResponse, headers);
    res.end(err.message);
}

module.exports = routes;
