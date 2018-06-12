var request = require('sync-request')
var fs = require('fs')

// import classes

var classes = require('./classes.js')
var Transaction = classes.Transaction;
var config = require('./config.js')

const mempoolFile = config.mempoolFile
const blockchainServer = config.blockchainServer
const transactionServer = config.transactionServer

module.exports = {

	// broadcasts the blockchain to the relay server

	blockchain: function(blockchainFile)
	{
		/*var blockchain = fs.readFileSync(blockchainFile).toString()
		blockchain = blockchain.replace(/\+/g, "%2B"); 
		var res = request('POST', blockchainServer, {
			headers: {       
    			'content-type': 'application/x-www-form-urlencoded'
  			},
			body: "blockchain="+encodeURIComponent(blockchain)
		})*/
		console.log("Broadcasting blockchain...")
	},

	// broadcasts the transaction to the relay server

	transaction: function(type, from, to, amount, chainHash, timestamp, mempoolFile)
	{
		// right now this broadcasts to local mempool, but it should broadcast to actual mempool in the future
		var transaction = new Transaction(type, from, to, amount, chainHash, timestamp)
		var current = fs.readFileSync(mempoolFile)
		if (current != "")
		{
			current = JSON.parse(current)
			current.push(transaction)
		}
		else
		{
			current = [JSON.stringify(transaction)]
		}
		fs.writeFileSync(mempoolFile, JSON.stringify(current))
		/*signature = signature.replace(/\+/g, "%2B")
		origin = origin.replace(/\+/g, "%2B")
		var transaction = JSON.stringify(new Transaction(type, from, to, amount, chainHash, timestamp))
		var res = request('POST', transactionServer, {
			headers: {       
    			'content-type': 'application/x-www-form-urlencoded'
  			},
			body: "transaction="+encodeURIComponent(transaction)
		})*/
		console.log("Broadcasting transaction...")
	}
}