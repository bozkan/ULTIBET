var io = require('socket.io-client');
var config = require('../config.js')
const relayServer = config.relayServer
var socket = io.connect(relayServer, {reconnect: true});
var app = require('express')();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/masterserver.html');
})

// when someone is asking for local blockchain state
socket.on('send_chain', function (id) 
{
    var chain = fs.readFileSync(blockchainFile).toString()
    socket.emit('emit_chain_from_node', chain, id)
    console.log("Emitted chain (OK).")
})

socket.on('test', function(test))
{
    console.log()
}

var server = app.listen(8081, function () {
    console.log("Listening on port 8081...")
 })