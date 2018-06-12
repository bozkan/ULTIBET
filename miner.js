// import modules

var fs = require('fs');
var colors = require('colors/safe')

// import functions

var helpers = require('./functions.js');
var mempool = require('./mempool.js');
var blockchain = require('./blockchain.js');
var broadcast = require('./broadcast.js')
var config = require('./config.js')

// import classes

var classes = require('./classes.js');
var Block = classes.Block;
var LoadBlock = classes.LoadBlock;
var LoadBlockchain = classes.LoadBlockchain;
var User = classes.User;

// define variables

const difficulty = config.difficulty
const blockchainFile = config.blockchainFile
const mempoolFile = config.mempoolFile
const credentialsFile = config.credentialsFile
const updateInterval = config.updateInterval // how often to update mempool (lower number = more often therefore lower chance of orphaned chain, but longer time to mine)
var nonce = 0 // stores nonce in case mining continues after mempool refresh
var emptyMempoolSwitch = false // only alert client if mempool is empty once
var blockFound = true // triggers the mining of a new block

// triggered every time you mine a block

function blockMined(chain, transactionIndex)
{
	// add block to blockchain
	helpers.exportBlockchain(blockchainFile, chain);
	// broadcast blockchain
	broadcast.blockchain(blockchainFile)
	// broadcast new transaction -> remove this in production
	broadcast.transaction(
		"coinbase", 
		["vojta", "tom", "john"], 
		["gines", "jinny", "lotus"], 
		[100, 2000, 300, 123234], 
		"", 
		13453453049,
		mempoolFile
	)
	// remove just-mined transaction from my mempool
	mempool.remove(transactionIndex)
	// start mining new block
	blockFound = true
}

// triggered every updateInterval hashes

function blockNotMined(transaction)
{
	// check if local chain state has been updated
	var newchain = blockchain.read(blockchainFile, difficulty, updateInterval, false)
	if (newchain.calculateWork() != chain.calculateWork())
	{
		chain = newchain
		blockHeight = chain.chain.length + 1 // include genesis block
		blockFound = true
		console.log(colors.blue("Blockchain updated."))
	}
	else
		// check if transaction is still in mempool; if it isn't, start mining new block
		blockFound = mempool.exists(transaction) ? false : true
}

// retrieve miner credentials

let fetchCredentials = helpers.getCredentials(credentialsFile);
let credentials = new User(fetchCredentials.username, fetchCredentials.privateKey, fetchCredentials.publicKey);

// load blockchain from local state
 
var chain = blockchain.read(blockchainFile, difficulty, updateInterval, true)
var blockHeight = chain.chain.length + 1 // include genesis block

// begin mining

while (true)
{

	// check if a block was just mined
	if (blockFound)
	{
		// retrieve mempool
		var mempoolData = mempool.read(mempoolFile)

		// quit if mempool is empty
		if (!mempoolData)
		{
			if (!emptyMempoolSwitch)
			{
				console.log(colors.blue("Mempool is empty. Waiting..."))
				emptyMempoolSwitch = true
			}
			continue
		}

		// mempool isn't empty
		emptyMempoolSwitch = false

		// pick a random transaction from mempool
		var randomTransaction = mempool.random(mempoolData)
		var transaction = randomTransaction[0]
		var transactionIndex = randomTransaction[1]

		// store timestamp
		var timestamp = Date.now()

		console.log("Mining new block...")

		var blockStruct = new Block(
			blockHeight, 
			timestamp,
			transaction, 
			credentials.publicKey, 
			credentials.privateKey 
		)

		// start mining new block

		if (chain.addBlock(blockStruct))
			// block was mined
			blockMined(chain, transactionIndex)

		else
			// block wasn't mined
			blockNotMined(transaction)

		// increase block height
		blockHeight++

	}
	else
	{
		// continue mining previous block

		if (chain.continueMining())
			// block was mined
			blockMined(chain, transactionIndex)
		else
			// block wasn't mined
			blockNotMined(transaction)
	}
}