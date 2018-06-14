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

var mempoolFile = config.mempoolFile

var matchid = 51652 // change this to be dynamic

// retrieve all new events

execPhp('oracle.php', function(error, php, outprint)
{
    php.oracle(matchid, function(err, result, output, printed)
    {
        result = JSON.parse(result)
        result.reverse()

        for (var i = 0, n = result.length; i < n; i++)
        {
            // only do events
            if (result[i].category != "event")
                continue

            // check if there are any escrows that should be paid out
            var payouts = blockchain.findPayouts(result[i].eventid, result[i].team)

            // send payouts to mempool
            if (payouts != 0)
            {
                var timestamp = Date.now()
                broadcast.transaction("transfer", payouts.event, payouts.from, payouts.to, payouts.amount, [], payouts.server, [], timestamp, mempoolFile)
            }
        }
    })
})