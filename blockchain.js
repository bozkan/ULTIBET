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
const timeDifference = config.timeDifference

var alreadyEscrow = []

function removeEscrow (server, event)
{
    return function (element)
    {
        return !(element.server == server && element.event == event)
    }
}

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

  getCoinbase: function(player, server)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "coinbase" && block.payload.server == server && block.payload.to.indexOf(player) != -1)
				return block.payload.amount[block.payload.to.indexOf(player)] // return coinbase amount
		}
		return 0 // if nothing was found
  },

  getWins: function(player, server)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		var winAmount = 0

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "transfer" && block.payload.server == server && block.payload.to.indexOf(player) != -1)
			{
				for (var j = 0, k = block.payload.to.length; j < k; j++)
				{
					if (block.payload.to[j] == player)
						winAmount += block.payload.amount[j]
				}
			}
		}

		return winAmount // return winning amounts
  },

  getLosses: function(player, server)
  {
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		var lossAmount = 0

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			if (block.payload.type == "escrow" && block.payload.server == server && block.payload.from.indexOf(player) != -1)
			{
				for (var j = 0, k = block.payload.from.length; j < k; j++)
				{
					if (block.payload.from[j] == player)
						lossAmount += block.payload.amount[j]
				}
			}
		}

		return lossAmount // return loss amounts
  },

  trackEvent: function(eventid, server)
  {
		// if an escrow for this event exists
		// whose bets haven't been transferred yet for the same event
		// return true because there already exists an escrow
		// else, this is a new escrow, and return false

		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain

		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]
			var escrows = 0

			if (block.payload.type == "escrow" && block.payload.event == eventid && block.payload.server == server)
			{
				escrows += 1
			}

			if (block.payload.type == "transfer" && block.payload.event == eventid && block.payload.server == server)
			{
				escrows -= 1
			}
		}

		if (escrows > 0)
			return true
		else
			return false
  },

  findPayouts: function (eventid, team, matchid)
  {
		// iterate through blocks
		// save escrows, including wagers, players, server, and amounts
		// look for transfers
		// remove escrows that have been transferred
		// calculate amounts that should be paid and to whom
		// return transactions to be pushed

		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain
		var escrows = []
		
		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]

			// push escrow
			if (block.payload.type == "escrow" && block.payload.event == eventid && block.payload.match == matchid)
			{
				// only push if escrow for this event and server doesn't yet exist
				if (alreadyEscrow.indexOf(block.hash) == -1)
				{
					escrows.push(
						{
							"players": block.payload.from, 
							"wagers": block.payload.wagers, 
							"amounts": block.payload.amount, 
							"server": block.payload.server,
							"event": block.payload.event
						}
					)
					alreadyEscrow.push(block.hash)
				}
			}

			// pop escrow based on server and event
			if (block.payload.type == "transfer" && block.payload.event == eventid && block.payload.match == matchid)
				escrows = escrows.filter(removeEscrow(block.payload.server, block.payload.event))

		}

		// if there are no escrows for this event, return
		if (escrows.length < 1)
			return []

		// find winners and generate transactions
		// escrows now holds all the relevant escrows to this event
		for (var i = 0, n = escrows.length; i < n; i++)
		{
			var payouts = {"from": [], "to": [], "amount": [], "event": eventid, "server": escrows[i].server, "match": matchid}
			var losers = []
			var winners = []
			
			for (var j = 0, k = escrows[i].players.length; j < k; j++)
			{
				// if player won, transfer escrow to him
				if (escrows[i].wagers[j] == team)
				{
					payouts.from.push(escrows[i].players[j])
					payouts.to.push(escrows[i].players[j])
					payouts.amount.push(escrows[i].amounts[j])
					winners.push(escrows[i].players[j])
				}
				// if player lost, transfer (his escrow)/winners to each winner
				else
				{	
					losers.push({"player": escrows[i].players[j], "amount": escrows[i].amounts[j]})
				}
			}

			// iterate through losers, adding payouts to winners
			for (var j = 0, k = losers.length; j < k; j++)
			{
				for (var z = 0, y = winners.length; z < y; z++)
				{
					payouts.from.push(losers[j].player)
					payouts.to.push(winners[z])
					payouts.amount.push((losers[j].amount / winners.length))
				}
			}
		}

		return payouts
  },

  timeDiff: function(server, event, currentTime)
  {
		// find the block where the escrow took place
		var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain
		var timestamp = 0
		
		for (var i = 0, n = chain.length; i < n; i++)
		{
			var block = chain[i]

			if (block.payload.type == "escrow" && block.payload.server == server && block.payload.event == event)
				timestamp = block.timestamp
		}

		if (timestamp == 0)
			return false // couldn't find escrow: big problem

		if ((curretTime - timestamp) > timeDifference)
			return true // more than 2 mins passed
		else
			return false // less than 2 mins passed
  },

  findCoinbase: function (server, players)
  {
	var chain = JSON.parse(fs.readFileSync(blockchainFile).toString()).chain
	for (var i = 0, n = chain.length; i < n; i++)
	{
		block = chain[i]
		if (block.payload.type == "coinbase" && block.payload.server == server)
		{
			for (var j = 0, k = players.length; j < k; j++)
			{
				if (block.payload.to.indexOf(players[j]) != -1)
					return true // if a coinbase for this player on this server already exists
			}
		}
	}
	return false // if there is not yet a coinbase
  }

}