/*
	- Client for p2p network
	- Usage: node p2p my.domain:port peer1.domain:port peer2.domain:port peer3.domain:port
*/

var topology = require('fully-connected-topology')
var jsonStream = require('duplex-json-stream')
var streamSet = require('stream-set')

var me = process.argv[2]
var peers = process.argv.slice(3)

var swarm = topology(me, peers)
var streams = streamSet()

swarm.on('connection', function(socket, peerId) {
	console.log('[connection] New connected from ' + peerId)
	streams.add(jsonStream(socket))

	// handles messages - example
	socket.on('data', function (data) {
		console.log(peerId)
		console.log(data.username + "> " + data.message)
	})

})

// sends messages from cmd - example
process.stdin.on('data', function(data) {
	streams.forEach(function(peer) {
		peer.write({username: me, message: data.toString().trim()})
	})
})