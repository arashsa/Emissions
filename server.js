// transparently require() jsx from node
// we don't _need_ it, but as it enables us to continue write ES6 code in our modules,
// I am keeping it :)
require('node-jsx').install({harmony: true});

var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var server = app.listen(port);
var socketIo = require('socket.io');
var io = socketIo.listen(server);
var htmlCssDir;
console.log("Server listening on port " + port);

if ('production' === process.env.NODE_ENV) {
    console.log('Running a production build');
    htmlCssDir = __dirname + '/dist';
} else {
    console.log('Running a development build');
    htmlCssDir = __dirname + '/build';
}
console.log('Serving html files from ', htmlCssDir);

// enable gzip compression
app.use(require('compression')());

// set up routing
app.use(express.static(htmlCssDir));
app.use(express.static(__dirname + '/assets'));

// enable us to check the environment by going to /environment
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
require('./server/server-api')(io);
