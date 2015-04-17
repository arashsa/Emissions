// transparently require() jsx from node
// this might not be needed anymore - don't think we transform anything on the server?
require('node-jsx').install({harmony: true});

var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var server = app.listen(port);
var socketIo = require('socket.io');
var io = socketIo.listen(server);
var bootstrapScript = require('./server-bootstrap');
var htmlCssDir;


console.log("Server listening on port " + port);

// enable gzip compression
var compression = require('compression')
app.use(compression());

if ('production' === process.env.NODE_ENV) {
    htmlCssDir = __dirname + '/dist';
} else {
    htmlCssDir = __dirname + '/build';
}
console.log('Serving html files from ', htmlCssDir);

// set up routing

app.use(express.static(htmlCssDir));
app.use(express.static(__dirname + '/assets'));

app.get('/environment', function (req, res) {
    res.json(process.env);
});

// every path that is not matched by the existing files will get the index file served
// at which point the client side routing takes over control
app.get('*', function (req, res) {
    res.set('Content-Type', 'text/html');
    res.sendFile(htmlCssDir + '/index.html');
});


// set up server api using Socket.IO
require('./server-api')(io);


// convenience stuff to run at startup when developing
// run startup events - just when developing
bootstrapScript.run();
