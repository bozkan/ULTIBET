var bitcoin = require('bitcoinjs-lib')
var bitcoinMessage = require('bitcoinjs-message')
var CoinKey = require('coinkey')
var imageHash = require('hasha')
var colors = require('colors/safe')

var blockchain = require('./blockchain.js')
var helpers = require('./functions.js')
var mempool = require('./mempool.js')
var difficultyCheck = require('./difficulty.js')
var config = require('./config.js')
var broadcast = require('./broadcast.js')

const blockchainFile = config.blockchainFile
const remoteBlockchainFile = config.remoteBlockchainFile
const difficultyHistoryFile = config.difficultyHistoryFile
const updateInterval = config.updateInterval 
const difficulty = config.difficulty
const maxAmount = config.maxAmount

module.exports = {

	/*
		Validating a transaction
		- blockchainFile parameter specifies a blockchain state against which transaction should be verified
	*/

	transaction: function (transaction, blockchainFile, mempoolEntry, verbose)
	{
		// check that transaction has all components
		// this has to be done because transactions aren't hashed until they are mined
		var transactionStructureCheck = mempool.transactionStructure(transaction)
		if (!transactionStructureCheck.res)
			return { "res": false, "message": "Transaction structure invalid. " + transactionStructureCheck.message }

		// validation for coinbase transactions
		if (transaction.type == "coinbase")
		{
			// check if amount for each player is less than max
			for (var i = 0, n = transaction.amount.length; i < n; i++)
			{
				if (transaction.amount[i] > maxAmount)
					return { "res": false, "message": "Error: Players have been given more money than MAX." } 
			}
			 
		}

		// validation for transfer transactions
		if (transaction.type == "transfer")
		{
			// check if input and output amounts are the same
			if ((transaction.from.length + transaction.to.length) != (transaction.amount.length + transaction.to.length))
			return { "res": false, "message": "Error: Transaction contains unequal amount of inputs and outputs." } 
		}

		// validation for transfer transactions
		if (transaction.type == "escrow")
		{
			// check if player has enough money to transfer
			for (var i = 0, n = transaction.from.length; i < n; i++)
			{
				var playerAmount = 0
				// start with coinbase transaction
				playerAmount = blockchain.getCoinbase(transaction.from[i])
				// add every time the player wins (he is in the 'to' field)
				playerAmount += blockchain.getWins(transaction.from[i])
				// subtract every time the player loses (he is in the 'from' field)
				playerAmount -= blockchain.getLosses(transaction.from[i])

				if (transaction.amount[i] > playerAmount)
					return { "res": false, "message": "Error: Player #"+(i+1)+" is trying to escrow more money than he has." }
			}
		}

		return { "res": true, "message": "Success." }
	},

	/*
		 Validating a block
	*/

	block: function (block, localChain)
	{

		// check if signature of block's signature is valid
		if (!helpers.verifySignature(
		        JSON.stringify(block.payload), 
		        block.issuer,
		        block.signature
	    	))
	    {
	        return {"res": false, "message": "Block signature invalid."}
	    }

		// check if payload in block is valid
		var payloadCheck = module.exports.transaction(block.payload, remoteBlockchainFile, false, false)
		if (!payloadCheck.res)
			return {"res": false, "message": "Block payload invalid. " + payloadCheck.message}

		// check that miner didn't mine his/her own block
		// disable this during debugging
		if (block.issuer == block.payload.from)
			return {"res": false, "message": "Block miner mined own reward."}

		// ensure that timestamp wasn't tampered with
		if (!helpers.timestampCheck(block.timestamp, localChain))
			return {"res": false, "message": "Block timestamp invalid. Possibly, local chain is outdated: download new state."}

		// ensure that block difficulty is appropriate
		if (!difficultyCheck.check(block.timestamp, block.hash))
			return {"res": false, "message": "Block difficulty invalid."}

		return {"res": true, "message": "Block signature invalid."} // block is valid


	},

	/*
		 Validating a blockchain
		 - blockchainFile parameter is the local blockchain state
		 - remoteBlockchainFile parameter is the remote blockchain state (incoming)
		 ** To update local blockchain state (if remote blockchain is valid), run blockchain.update
	*/

	chain: function (blockchainFile, remoteBlockchainFile)
	{

		// read local chain
		var localChain = blockchain.read(blockchainFile, difficulty, updateInterval, false)
		// read remote chain, if structure is invalid -> return false
		try {
			var remoteChain = blockchain.read(remoteBlockchainFile, difficulty, updateInterval, false) }
		catch (err) {
			return {"res": false, "message": "Remote chain completely invalid."} }

		// check if local blockchain state is valid
		var localValidation = localChain.validateChain()
		if (!localValidation.res)
			return {"res": false, "message": colors.red("LOCAL BLOCKCHAIN INVALID! ") + "Error: " + localValidation.message }

		// check if received blockchain state is valid
		var remoteValidation = remoteChain.validateChain()
		if (!remoteValidation.res)
			return {"res": false, "message": colors.red("REMOTE BLOCKCHAIN INVALID! ") + "Error: " + remoteValidation.message } 

		// find which chain has more work i.e. is more true
		var workDiff = remoteChain.calculateWork() - localChain.calculateWork()
		if (workDiff < 1)
			return {"res": false, "message": colors.yellow("Remote chain doesn't have more work. Nothing to validate.") } // remote chain doesn't have more work

		// find which blocks local state is missing -> these need to be validated
		var newBlocks = blockchain.blocksDiff(localChain, remoteChain)
		var newBlocksValid = true // assume blocks are valid until proven otherwise

		console.log(colors.yellow("Validating " + newBlocks.length + " new blocks..."))

		// iterate through the new blocks -> check if each is valid
		for (var i = 0, n = newBlocks.length; i < n; i++)
		{ 
			var verifyBlock = module.exports.block(newBlocks[i], localChain)
			if (!verifyBlock.res)
			{
				console.log(colors.red("INVALID BLOCK FOUND! ") + "Remote block #" + (i+1) + " Error: " + verifyBlock.message)
				newBlocksValid = false
			}
			else
			{
				console.log(colors.green("Remote block #" + (i+1) + " validated."))
			}
		}
		if (!newBlocksValid)
			return {"res": false, "message": "Remote chain contains invalid blocks."}

		// if all blocks are valid -> remove their origins from local mempool
		for (var i = 0, n = newBlocks.length; i < n; i++)
		{ 
			mempool.removeBlock(newBlocks[i].payload.origin)
		}

		return {"res": true, "message": "Success."} // if the blockchain is fully valid
	}

}

// Examples:
// * validating two chains
// console.log(chain("blockchain.txt", "remoteBlockchain.txt").message)
// * validating a transaction
// console.log(transaction({"type":"coinbase","from":"17xY4nkJxkiXvNa3a21mkpNfFo5jMEzm1P","to":"","stamp":1,"signature":"HNhl3HHj7tXTYhqQjITFfJDnycMkmCbnPfYAIVZGdkvjOyYdDbSgNQrUgKJVZGYRdj5sDEEmVrSebwvwIHSRCZk=","origin":"000065b3b2dadcd5e2e2bb4ca84b8d1a99f23723ddb74c3807cf2c171b824bbf7615171740ada1ad32a40e5dac9d054b4bff49e88294a7c01e474b92e00a5c11","timestamp":1527760288138}, "remoteBlockchain.txt", true, true).message)

// if remote blockchain has more work, is valid, and all its blocks are valid -> adopt it locally
