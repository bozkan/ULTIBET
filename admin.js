var broadcast = require('./broadcast.js')
var config = require('./config.js')
var bitcoin = require('bitcoinjs-lib');
var bitcoinMessage = require('bitcoinjs-message');
var CoinKey = require('coinkey');

var mempoolFile = config.mempoolFile

var oraclePrivateKey = "643746514138627453444f617977645832735a63443077734b335a7668575669"

module.exports = {
    createCoinbase: function(address, amount)
    {
        broadcast.transaction("coinbase", "", [], [address], [amount], [], "", 0, [], Date.now(), mempoolFile)
    },

    oracleSign: function(message)
    {
        var privateKey = oraclePrivateKey
        var key = new CoinKey(new Buffer(privateKey, "hex"));
        key.compressed = false;

        var keyPair = bitcoin.ECPair.fromWIF(key.privateWif);
        var privateKey = keyPair.d.toBuffer(32);

        var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
        return signature.toString('base64');
    }
}

// private key of oracle for signing
exports.oraclePrivateKey = oraclePrivateKey