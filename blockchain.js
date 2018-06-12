// import functions

var helpers = require('./functions.js');
var colors = require('colors/safe')
var fs = require('fs');

// load classes

var classes = require('./classes.js');
var Block = classes.Block;
var LoadBlock = classes.LoadBlock;
var LoadBlockchain = classes.LoadBlockchain;
var config = require('./config.js')

const blockchainFile = config.blockchainFile

module.exports = {

  // updates local state of blockchain

  read: function (blockchainFile, difficulty, interval, verbose) {

  	if (verbose)
			console.log("Loading blockchain...")

		var blockchain = fs.readFileSync(blockchainFile).toString()

		contents = JSON.parse(blockchain)

		// load blockchain from text file including the genesis block

		var newChain = new LoadBlockchain(
        difficulty, 
        interval, 
        contents.chain[0].timestamp, 
        contents.chain[0].issuer, 
        contents.chain[0].signature, 
        contents.chain[0].hash, 
        contents.chain[0].nonce
      )

		// load all already-mined blocks from text file into blockchain

		var l = contents.chain.length;

		for (var i = 1; i < l; i++) 
		{
		    newChain.oldBlock(new LoadBlock(contents.chain[i].height, contents.chain[i].timestamp, contents.chain[i].payload, contents.chain[i].issuer, contents.chain[i].signature, contents.chain[i].hash, contents.chain[i].nonce, contents.chain[i].previousHash));
		    if (verbose)	
		    	console.log("Loading block " + i + "...")
		}

		if (verbose)
			console.log(colors.green("Successfully loaded " + (l) + " blocks"))

		return newChain

  },

  // iterates through the blocks in two chains and returns any blocks that are missing in first chain
  // returns an array

  blocksDiff: function (localChain, remoteChain)
  {
  		var chain = remoteChain.chain
  		var localChainLength = localChain.chain.length
  		var newBlocks = []
  		for (var i = 1, n = chain.length; i < n; i++)
        {
        	// check all the way to the end of local chain
        	if (localChainLength > i)
        	{
	        	// check if this hash is at the same index in local chain
	        	if (chain[i].hash == localChain.chain[i].hash)
	        		continue
	        	else 
	        		newBlocks.push(chain[i])
        	}
        	else
        	{
        		newBlocks.push(chain[i])
        	}
        }
        return newBlocks
  },

  getHash: function ()
  {
      return helpers.generateHash(fs.readFileSync(blockchainFile).toString())
  },

  getCoinbase: function(player)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "coinbase" && block.payload.to.indexOf(player) != -1)
				return block.payload.amount[block.payload.to.indexOf(player)] // return coinbase amount
		}
		return 0 // if nothing was found
  },

  getWins: function(player)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		var winAmount = 0

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "transfer" && block.payload.to.indexOf(player) != -1)
				winAmount += block.payload.amount[block.payload.to.indexOf(player)] // return coinbase amount
		}

		return winAmount // return winning amounts
  },

  getLosses: function(player)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		var lossAmount = 0

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "transfer" && block.payload.from.indexOf(player) != -1)
				lossAmount += block.payload.amount[block.payload.from.indexOf(player)] // return coinbase amount
		}

		return lossAmount // return loss amounts
  }

}