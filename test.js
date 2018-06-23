// var blockchain = require('./blockchain')

// console.log(blockchain.findPayouts(6, "Poland", 47439))
var execPhp = require('exec-php')

execPhp('oracle.php', function(error, php, outprint)
{
    php.oracle(2, function(err, result, output, printed)
    {
        if (typeof result === "undefined")
        {
            console.log("ues")
        }
    })
})