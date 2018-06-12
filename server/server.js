var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function (socket){

	console.log('New connection.');

	// when receiving an updated blockchain, emit it to all nodes
	socket.on('emit_blockchain', function (blockchain) {
		// emit to all nodes
		io.sockets.emit('receive_blockchain', blockchain[0])
		console.log("Emitting new state of blockchain...")
	});

	// when receiving a new transaction to be added to mempools, emit it to all nodes
	socket.on('emit_transaction', function (transaction) {
		// emit to all nodes
		io.sockets.emit('receive_transaction', transaction[0])
		console.log("Emitting new transaction...")
	});

});

http.listen(1338, function () {
  console.log('listening on *:1338');
});
