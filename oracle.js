/*
This is the oracle.
Pass in a matchid and it will:
1) find any new occurrences in that match
2) see if anyone has won a bet
3) generate transfers
4) broadcast them to the mempool
*/

var execPhp = require('exec-php')
var blockchain = require('./blockchain.js')
var broadcast = require('./broadcast.js')
var config = require('./config.js')
var io = require('socket.io-client')
var config = require('./config.js')
var socket = io.connect("http://localhost:1338", {reconnect: true});
var helpers = require('./functions.js')

var mempoolFile = config.mempoolFile

// var matchid = 47439 // change this to be dynamic
// var balances = [{"player": "vojta", "address": "12dCXcFDCiCeLH3EQSq8w4BLPeyJxVCkHR", "balance": 90},{"player": "honza", "address": "1P8yf689wtY8EyVQ9HEEN6Eyn79AidYR5G", "balance": 90}]

module.exports = {

    oracle: function(matchid, addressToUsername)
    {
        var balances = []
        matchid = parseInt(matchid)
        console.log("Oracle working...")
        // retrieve all new events
        execPhp('oracle.php', function(error, php, outprint)
        {
            php.oracle(matchid, function(err, result, output, printed)
            {
                if (typeof result === "undefined")
                {
                    return 1
                }
                result = JSON.parse(result)
                result.reverse()
                console.log(result)

                for (var i = 0, n = result.length; i < n; i++)
                {
                    if (result[i].category == "timer")
                    {
                        socket.emit('send timer', result[i].matchminute, result[i].score, result[i].home, result[i].away, result[i].matchid, helpers.findFlag(result[i].home), helpers.findFlag(result[i].away))
                    }

                    // only do events
                    if (result[i].category != "event")
                        continue
                    
                    // emit event to live commentary
                    socket.emit('send live commentary', result[i].time, result[i].eventid, result[i].team, result[i].matchid)

                    // broadcast event to mempool
                    broadcast.transaction("oracle", result[i].eventid, [], [], [result[i].time], [result[i].team], "", result[i].matchid, [], Date.now(), mempoolFile)

                    // check if there are any escrows that should be paid out
                    var payouts = blockchain.findPayouts(result[i].eventid, result[i].team, result[i].matchid)

                    // send payouts to mempool
                    if (payouts.length != 0)
                    {
                        // remove active bets
                        socket.emit('do delete active bet', payouts.server, payouts.event)

                        // broadcast transaction to blockchain
                        var timestamp = Date.now()
                        broadcast.transaction("transfer", payouts.event, payouts.from, payouts.to, payouts.amount, [], payouts.server, payouts.match, [], timestamp, mempoolFile)

                        // update player balances
                        for (var j = 0, k = payouts.to.length; j < k; j++)
                        {
                            // get payouts to and amount
                            var user = addressToUsername[payouts.to[j]]
                            var amount = payouts.amount[j]
                            // add to user balances
                            balances.push({"player": user, "amount": amount})
                        }
                    }
                }
                socket.emit('transfer balances', balances)
                socket.emit('lookup payout history')
            })

        })
    }
}