var io = require('socket.io-client');
var fs = require('fs')
var config = require('./config.js')
var colors = require('colors/safe')
const relayServer = config.relayServer
var socket = io.connect(relayServer, {reconnect: true});
var helpers = require('./functions.js')

const blockchainFile = config.blockchainFile
const mempoolFile = config.mempoolFile

console.log(colors.blue("Requesting chains from active nodes..."))

var chainHashes = []

socket.emit('ask')

socket.on('receive_hash', function (hash, from) 
{
    chainHashes.push({ "from": from, "hash": hash })
})

const wait = 5000 // wait 5 seconds for responses

setTimeout(function()
{

	// ask all nodes for a hash of their blockchain, if none answer -> say that and wait

	if (chainHashes.length < 1)
	{
		console.log(colors.red("No chains received. Try again later."))
		process.exit(1)
	}

	// compute the mode of the hashes
	console.log(colors.blue("Computing mode chain..."))
	var mode = helpers.mode(chainHashes)

	// request the blockchain from a node that has the mode hash

	console.log(colors.blue("Requesting chain..."))
	socket.emit('ask_node', mode.from)

	socket.on('receive_chain_from_node', function (chain) 
	{
	    // store it in local blockchain file
		helpers.exportBlockchain(blockchainFile, JSON.parse(chain.replace(/\\/g, '').replace('[""', '[').replace('""]', ']').replace('"{', '{').replace('}"', '}')));

		// flush local mempool file
		fs.writeFileSync(mempoolFile, "")

		console.log(colors.green("Successfully downloaded blockchain state."))
		process.exit(0)
	})

}, wait) // wait 5 seconds

