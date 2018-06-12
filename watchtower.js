var io = require('socket.io-client');
var fs = require('fs')
var config = require('./config.js')
const relayServer = config.relayServer
var socket = io.connect(relayServer, {reconnect: true});
var validate = require('./validate.js')
var mempool = require('./mempool.js')
var blockchain = require('./blockchain.js')
var config = require('./config.js')

const blockchainFile = config.blockchainFile
const remoteBlockchainFile = config.remoteBlockchainFile
const mempoolFile = config.mempoolFile
const difficulty = config.difficulty
const updateInterval = config.updateInterval

socket.on('receive_blockchain', function (blockchain) 
{
    fs.writeFileSync(remoteBlockchainFile, blockchain)
    var validateChain = validate.chain(blockchainFile, remoteBlockchainFile)
    // log result of validation
    console.log(validateChain.message)
    // if validation was successful -> make remote chain local
    // also removes local mempool transactions that have been already mined
    if (validateChain.res)
        // write transaction to local blockchain
    	fs.writeFileSync(blockchainFile, blockchain)
})

socket.on('receive_transaction', function (transaction) 
{
	var validateTransaction = validate.transaction(JSON.parse(transaction), blockchainFile, true, true)
	// log the result of validation
	console.log(validateTransaction.message)
	if (validateTransaction.res)
		// write transaction to local mempool
		mempool.writeTransaction(transaction)
})

// when someone is asking for the hash of local blockchain state
socket.on('send_hash', function (id) 
{
    var chainHash = blockchain.getHash()
    socket.emit('emit_hash', id, chainHash)
    console.log("Emitted chain hash (OK).")
})

// when someone is asking for local blockchain state
socket.on('send_chain', function (id) 
{
    var chain = fs.readFileSync(blockchainFile).toString()
    socket.emit('emit_chain_from_node', chain, id)
    console.log("Emitted chain (OK).")
})