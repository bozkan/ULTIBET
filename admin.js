var broadcast = require('./broadcast.js')
var config = require('./config.js')

var mempoolFile = config.mempoolFile

module.exports = {
    createCoinbase: function(address, amount)
    {
        broadcast.transaction("coinbase", "", [], [address], [amount], [], "", 0, [], Date.now(), mempoolFile)
    }
}