// import { calcBOLL } from "./calcBOLL.js";
// import { getBarsInfo } from "./getBarsInfo.js";
// import { analizePrice } from "./analizePrice.js";
// import { URL_MARKET_INFO, URL_BARS_INFO, URL_CHART } from "./urls.js";
// import { getInfoAboutCryptocurrencyPairs } from "./getInfoAboutCryptocurrencyPairs.js";

// let topPairsInfo = await getInfoAboutCryptocurrencyPairs({
//     url: URL_MARKET_INFO, 
//     quotedCoin: 'USDT', 
//     order: 'quoteVolume', 
//     limit: 100
// });

// let intervalsList = document.querySelector('.intervals');
// intervalsList.addEventListener('change', handleIntervalChange);
// let table = document.querySelector('#boll').querySelector('tbody');

// let stores = {
//     '1d': [],
//     '1w': []
// }

// start({
//     pairsInfo: topPairsInfo,
//     interval: intervalsList.value,
//     table: table,
//     store: stores[intervalsList.value]
// });

// let sortButtons = document.querySelectorAll('.sortButton');
// sortButtons.forEach((btn) => btn.addEventListener('pointerdown', changeSortOrder));

// function handleIntervalChange(e) {
//     let value = e.currentTarget.value;

//     if (!stores[value].length) {
//         table.replaceChildren();
//         start({
//             pairsInfo: topPairsInfo,
//             interval: value,
//             table: table,
//             store: stores[value]
//         });
//         return;
//     };
    
//     let fragment = new DocumentFragment;
//     let tmplRow = document.querySelector('#row');
//     let store = stores[value];

//     for (let i = 0; i < store.length; i++) {
//         fragment.append(createRow(store[i], tmplRow.content.cloneNode(true)));
//     }

//     table.replaceChildren(fragment);
// }


// function start({ pairsInfo, interval, table, store, msgsCodes = [1,2,3] }) {
//     let tmplRow = document.querySelector('#row');

//     for (let pair of pairsInfo) {
//         let barsInfo =  getBarsInfo({ 
//             url: URL_BARS_INFO, 
//             symbol: pair.symbol, 
//             interval, 
//             limit: 23 
//         });
//         barsInfo.
//         then((data)=>processKlinesData(data, pair)).
//         then((res) => {
//                 res && msgsCodes.includes(res.messageCode) && table.append(
//                     createRow(res, tmplRow.content.cloneNode(true))
//                     );
//                     return res;
//                 }).
//                 then((res) => {
//                     res && msgsCodes.includes(res.messageCode) && store.push(res)
//                 });
//     }
// }

// function processKlinesData(data, { symbol,  quoteVolume }) {
//     if (data.length < 23) return null;
    
//     let beforePenultimateBOLL = calcBOLL(data.slice(0, -2));
//     let penultimateBOLL = calcBOLL(data.slice(1, -1));
//     let currentBOLL = calcBOLL(data.slice(2));

//     let summary = analizePrice({ 
//         beforePenultimatePrice: data.at(-3)[4],
//         penultimatePrice: data.at(-2)[4],
//         currentPrice: data.at(-1)[4],
//         beforePenultimateBOLL, 
//         penultimateBOLL, 
//         currentBOLL
//     });

//     let result = { 
//         ...summary, 
//         symbol, 
//         currentPrice: formatNumber(+data.at(-1)[4], { digits: 2, prefix: '$' }), 
//         quoteVolume: formatNumber(+quoteVolume / 1000000, { digits: 2, prefix: '$', postfix: ' млн' }),
//         chart: `${URL_CHART}/${symbol.slice(0,-4)}_USDT?type=spot`,
//         diviation: formatNumber(summary.diviation * 100, { digits: 2, postfix: '%' })
//     };
    
//     return result;
// }

// function createRow(data, rowTempl) {
//     [...rowTempl.firstElementChild.children].forEach((td) => {
//         if (td.dataset.colName === 'symbol') {
//             td.children[0].textContent = data[td.dataset.colName];
//             td.children[0].href = data.chart;
//             return;
//         }
//         td.textContent = data[td.dataset.colName];
//     });

//     data.messageCode === 1 && (rowTempl.firstElementChild.className = 'buy');
//     data.messageCode === 2 && (rowTempl.firstElementChild.className = 'sell');
//     parseFloat(data.diviation) < 0 ? 
//         (rowTempl.firstElementChild.lastElementChild.className = 'fall') : 
//         (rowTempl.firstElementChild.lastElementChild.className = 'rise');
//     return rowTempl;
// }

// function formatNumber(value, { digits, prefix = '', postfix=''}) {
//     return `${prefix}${digits ? value.toFixed(digits) : value}${postfix}`;
// }

// function changeSortOrder(e) {
//     let orderDesc = (a, b) => b[order] - a[order];
//     let orderAsc = (a, b) => a[order] - b[order];
//     let orderFunctions = {
//         asc: orderAsc,
//         desc: orderDesc
//     };

//     let value = e.currentTarget.value;
//     let store = stores[value];
//     store.sort()
    
//     let fragment = new DocumentFragment;
//     let tmplRow = document.querySelector('#row');

//     for (let i = 0; i < store.length; i++) {
//         fragment.append(createRow(store[i], tmplRow.content.cloneNode(true)));
//     }

//     table.replaceChildren(fragment);
// }


// ////////////////////////////////////////////////////////////
const http = require('http');
let routes = require('./routes.js');
const HOST = process.env.HOST
const PORT = process.env.PORT;

const server = http.createServer();
server.on('request', handleRequest);
server.listen(PORT, HOST, handleConnection);

async function handleRequest(req, res) {  
    res.setHeader('Access-Control-Allow-Origin', `http://${HOST}:${PORT}`);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    let url = new URL(`${req.headers.host}${req.url}`);
    let pathname = url.pathname.match(/\/.*/)[0];
    routes[pathname] ? routes[pathname](req, res) : routes.default(req, res);
}

function handleConnection() {
    console.log(`Server is running on http://${HOST}:${PORT}`);
}

// ////////////////////////////////////////////////




// require('./pigBot.js');