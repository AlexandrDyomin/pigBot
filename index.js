require('./pigBot.js');
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