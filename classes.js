// import functions

var helpers = require('./functions.js')
var difficultyCheck = require('./difficulty.js')

// import modules

var bitcoin = require('bitcoinjs-lib');
var bitcoinMessage = require('bitcoinjs-message');
var CoinKey = require('coinkey');
var colors = require('colors/safe')

/*
    BLOCK CLASS
    Usage: To mine a new block
*/

class Block 
{

    constructor(height, timestamp, payload, issuer, privateKey, previousHash = "") 
    {
        this.height = height;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.payload = payload;
        this.signature = this.signBlock(privateKey);
        this.issuer = issuer;
        this.nonce = Math.floor(Math.random() * 1000000);
        this.hash = this.calculateHash();
    }

    // calculate hash of block

    calculateHash() 
    {
        return helpers.generateHash(this.height + this.previousHash + this.timestamp + JSON.stringify(this.payload) + this.nonce + this.issuer);
    }

    // encrypt block with miner's private key

    signBlock(privateKey)
    {

        var key = new CoinKey(new Buffer(privateKey, "hex"));
        key.compressed = false;

        var keyPair = bitcoin.ECPair.fromWIF(key.privateWif);
        var privateKey = keyPair.d.toBuffer(32);

        var signature = bitcoinMessage.sign(JSON.stringify(this.payload), privateKey, keyPair.compressed);
        return signature.toString('base64');
    }

    // mine block -- difficulty determined by blockchain

    mineBlock(difficulty, interval) 
    {

        var intervalCounter = 0
        var condition = true

        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) 
        {
            this.nonce++;
            this.hash = this.calculateHash();

            intervalCounter++

            if (intervalCounter > interval)
            {
                condition = false
                break
            }
        }

        if (condition)
        {
            console.log(colors.green("BLOCK #" +this.height+ " MINED: " + this.hash));
            return true
        }
        else
        {
            console.log(colors.yellow("Updating state..."))
            return false
        }
    }
}

/*
    USER CLASS
    Usage: Generate keypair for new user
*/

class User
{
    constructor(name, privateKey = "", publicKey = "")
    {
        this.name = name;
        this.privateKey = privateKey.length == 0 ? helpers.makePrivateKey() : privateKey;
        this.publicKey = publicKey.length == 0 ? helpers.generateAddress(this.privateKey) : publicKey;
    }
}

/*
    TRANSACTION CLASS
    Usage: Holds a transaction
    Types: coinbase, escrow, transfer, chainHash
*/

class Transaction
{
    constructor(type, from, to, amount, chainHash, timestamp)
    {
        this.type = type
        this.from = from
        this.to = to
        this.amount = amount
        this.chainHash = chainHash
        this.timestamp = timestamp
    }
}

/*
    LOADBLOCK CLASS
    Usage: Load an already mined block
*/

class LoadBlock
{
    constructor(height, timestamp, payload, issuer, signature, hash, nonce, previousHash = "") 
    {
        this.height = height;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.payload = payload;
        this.signature = signature;
        this.issuer = issuer;
        this.nonce = nonce;
        this.hash = hash;
    }

    // calculates hash

    calculateHash() {
        return helpers.generateHash(this.height + this.previousHash + this.timestamp + JSON.stringify(this.payload) + this.nonce + this.issuer);
    }

}

/*
    LOADBLOCKCHAIN CLASS
    Usage: Load an already created blockchain including loading the genesis block. 
    See helpers for a function that loads the rest of the blocks
*/

class LoadBlockchain
{
    constructor(difficulty, interval, timestamp, issuer, signature, hash, nonce) 
    {
        this.chain = [this.loadGenesisBlock(timestamp, issuer, signature, hash, nonce)];
        this.difficulty = difficulty; // mining difficulty is determined here for the new blockchain
        this.interval = interval; // how often to update mempool
    }

    // loads the genesis block

    loadGenesisBlock(timestamp, issuer, signature, hash, nonce) 
    {
        return new LoadBlock(1, timestamp, "Genesis Block", issuer, signature, hash, nonce);
    }

    getLatestBlock() 
    {
        return this.chain[this.chain.length - 1];
    }

    // loads an already mined block onto the blockchain

    oldBlock(newBlock) 
    {
        //newBlock.previousHash = this.getLatestBlock().hash;
        this.chain.push(newBlock);
    }

    // mines a new block onto the blockchain

    addBlock(newBlock) 
    {
        newBlock.previousHash = this.getLatestBlock().hash;
        this.chain.push(newBlock);
        return newBlock.mineBlock(this.difficulty, this.interval)
    }

    // continues mining latest block onto the blockchain

    continueMining()
    {
        return this.getLatestBlock().mineBlock(this.difficulty, this.interval)
    }

    // calculates the amount of (proof of) work that has gone into mining this chain
    // total work is measured by the total nonce value

    calculateWork()
    {
        var totalWork = 0
        for (var i = 1, n = this.chain.length; i < n; i++)
        {
            totalWork += difficultyCheck.retrieve(this.chain[i].timestamp, this.chain[i].hash)
        }
        return totalWork
    }

    // checks if chain is valid

    validateChain() 
    {
        for (var i = 1, n = this.chain.length; i < n; i++)
        {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // check if block hasn't been tampered with

            if (currentBlock.hash !== currentBlock.calculateHash()) 
            {
                return {"res": false, "message": "Block #" + (i+1) + " hash invalid."}
            }

            // check if block order hasn't been tampered with

            if (currentBlock.previousHash !== previousBlock.hash) 
            {
                return {"res": false, "message": "Block #" + (i+1) + " order incorrect."}
            }

            // check if payload was approved (via signature) by miner who mined the block

            if (!helpers.verifySignature(
                    JSON.stringify(currentBlock.payload), 
                    currentBlock.issuer,
                    currentBlock.signature
                ))
            {
                return {"res": false, "message": "Block #" + (i+1) + " signature invalid."}
            }

        }

        return {"res": true, "message": "Success."}
    }
}

// export classes

exports.Block = Block;
exports.LoadBlock = LoadBlock;
exports.LoadBlockchain = LoadBlockchain;
exports.User = User;
exports.Transaction = Transaction;