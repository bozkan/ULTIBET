// var blockchain = require('./blockchain')

// console.log(blockchain.findPayouts(6, "Poland", 47439))

var array = {"x": "z", "y": "z"}

var flags = []
var output = []

for (var key in array) 
{
    if (typeof flags[array[key]] !== "undefined")
        continue
    flags[array[key]] = true
    output.push(array[key])
}

console.log(output)