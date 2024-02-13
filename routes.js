const pug = require('pug');
const { readFileSync } = require('fs');
const callBinance = require('./api/callBinance.js');
const { URL_MARKET_INFO } = require('./api/urls.js');

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
    '/handleSortChange.js': (req, res) => sendResource(res, { 
        source: './handleSortChange.js', 
        contentType: 'application/javascript'
    }),
    default: postPage404
};

async function sendIndexPage(req, res) {
    try {
        let url = new URL(`${req.headers.host}${req.url}`);
        let interval = url.searchParams.get('interval') || '1d' ;
        let validIntervals = ['1h', '1d', '1w', '1M'];

        if (!validIntervals.includes(interval)) {
            throw Error('Указан недопустимый интервал. Укажите любой из следующих интервалов: 1d, 1w, 1M');
        }

        let info = await callBinance({
            limit: 100,
            interval
        });
        
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(pug.renderFile('./index.pug', { info: info.successful, interval, cache: true }));
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
