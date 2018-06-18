// retrieve private key

var helpers = require('./functions.js')
var config = require('./config.js')

var bitcoin = require('bitcoinjs-lib')
var bitcoinMessage = require('bitcoinjs-message')
var CoinKey = require('coinkey')

module.exports = {

sign: function (publicKey, privateKey, amount)
{
    var privateKey = privateKey
    var publicKey = publicKey
    var key = new CoinKey(new Buffer(privateKey, 'hex'))
    key.compressed = false
    
    var keyPair = bitcoin.ECPair.fromWIF(key.privateWif)
    var privateKey = keyPair.d.toBuffer(32)
    
    var signature = bitcoinMessage.sign(JSON.stringify(amount), privateKey, keyPair.compressed).toString('base64')
    
    return signature
}

}
