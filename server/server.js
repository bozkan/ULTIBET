var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var servers = []

app.get("/", function(req, res){
	res.sendFile(__dirname + '/masterserver.html')
})

app.get("/create", function(req, res){
	res.sendFile(__dirname + '/create.html')
})

app.get("/play", function(req, res){
	res.sendFile(__dirname + '/create.html')
})

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

	// when receiving an ask
	socket.on('ask', function () {
		// emit to all nodes
		io.sockets.emit('send_hash', socket.id)
		console.log("Asking for hashes...")
	});

	// when receiving hashes -> emit them to the asking client
	socket.on('emit_hash', function (id, hash) {
		socket.to(id).emit('receive_hash', hash, socket.id);
		console.log("Sending hash...")
		console.log(hash)
	});

	// when asking specific node for chain
	socket.on('ask_node', function (id) {
		socket.to(id).emit('send_chain', socket.id)
		console.log("Asking specific node for chain...")
	});

	// when sending chain from specific node
	socket.on('emit_chain_from_node', function (chain, id) {
		socket.to(id).emit('receive_chain_from_node', chain)
		console.log("Sending specific chain to node...")
	});



});

var server = http.listen(1338, function () {
  console.log('listening on *:1338');
});
