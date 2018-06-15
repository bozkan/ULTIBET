// // retrieve private key

// var helpers = require('./functions.js')
// var config = require('./config.js')

// var bitcoin = require('bitcoinjs-lib')
// var bitcoinMessage = require('bitcoinjs-message')
// var CoinKey = require('coinkey')

// var credentialsFile = config.credentialsFile

// var retrieveCredentials = helpers.getCredentials(credentialsFile)
// var privateKey = retrieveCredentials.privateKey
// var publicKey = retrieveCredentials.publicKey
// var key = new CoinKey(new Buffer(privateKey, 'hex'))
// key.compressed = false

// var keyPair = bitcoin.ECPair.fromWIF(key.privateWif)
// var privateKey = keyPair.d.toBuffer(32)

// var signature = bitcoinMessage.sign("100", privateKey, keyPair.compressed).toString('base64')

// console.log(signature)
