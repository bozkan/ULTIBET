// import modules

var fs = require('fs');

// import functions

var helpers = require('./functions.js');

// import classes

var classes = require('./classes.js');
var config = require('./config.js')
var Block = classes.Block;
var Blockchain = classes.Blockchain;
var LoadBlock = classes.LoadBlock;
var LoadBlockchain = classes.LoadBlockchain;
var User = classes.User;

// define blockchain difficulty
const difficulty = config.difficulty
const interval = config.updateInterval
const blockchainFile = config.blockchainFile
const credentialsFile = config.credentialsFile

var timestamp = Date.now()

/*
    START CREATING NEW BLOCKCHAIN
*/

// retrieve miner credentials

let fetchCredentials = helpers.getCredentials(credentialsFile);

// create new blockchain, including genesis block

console.log("Mining genesis block...")

var newChain = new LoadBlockchain(
        difficulty, 
        interval, 
        timestamp, 
        fetchCredentials.publicKey, 
        "HBrLDbPBl+3QVwzgDfLhUllvbIRjmeoXfkgUfxDSDT2Gfgh/SBpZU2azA8/nlUgkSfiJRysNlPd77HlSHUH7V+A=", 
        "0618c48771b01f9818356d6e3dc96b8d9e2b7e37cb078f5120d10567d6dccf8c542b09f1f0cf59fe08252f86aaa056f2a064096cc37bef2e27ee5d90d45b9c0d", 
        19970318
      )

// export blockchain into file

helpers.exportBlockchain(blockchainFile, newChain);