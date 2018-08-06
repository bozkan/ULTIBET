var broadcast = require('./broadcast.js')
var config = require('./config.js')
var bitcoin = require('bitcoinjs-lib');
var bitcoinMessage = require('bitcoinjs-message');
var CoinKey = require('coinkey');
var crypto = require('crypto')
var algorithm = 'aes-256-ctr'
var request = require('sync-request')
const pg = require('pg')
var io = require('socket.io-client')
var socket = io.connect("http://localhost:1338", {reconnect: true});
    
// db params
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/betcafe'
var client = new pg.Client(connectionString)
client.connect()

var mempoolFile = config.mempoolFile

var oraclePrivateKey = "643746514138627453444f617977645832735a63443077734b335a7668575669" // this is done to check signature by the oracle

module.exports = {
    createCoinbase: function(address, amount)
    {
        broadcast.transaction("coinbase", "", [], [address], [amount], [], "", 0, [], Date.now(), mempoolFile)
        socket.emit('new coinbase', address, amount)
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
    },

    encrypt: function(text, password) {
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted
    },

    decrypt: function(text, password){
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec
    },

    findEtherCoinbase: function() {
        console.log("Searching for ether coinbase...")
        var q = client.query("SELECT * FROM payment_forms WHERE finished = 0")

        q.on('end', function(res) {
            console.log("UNFINISHED PAYOUTS")
            console.log(res.rows)
            res.rows.forEach(function (r) {
                var from_address = r["address"]
                var from_username = r["username"]
                var from_eth_address = r["ethereum_address"]

                var _data = JSON.parse(request('GET', 'http://api.etherscan.io/api?module=account&action=txlist&address=0x46c27e9073d3aea1e68303b0e6c3ee79b4ccf515&startblock=0&endblock=99999999&sort=asc&apikey=WVAI641RZ98VBVZNCG2E3DFYXHDI1MJGTX').getBody().toString()).result
                var alreadyCredited = []
        
                var query = client.query("SELECT * FROM ether_coinbases")
                
                query.on('end', function(res) {
                    res.rows.forEach(function(row) {
                        alreadyCredited.push(row["hash"])
                    })
        
                    _data.forEach(function(transaction) {
                        if (transaction.from == from_eth_address && transaction.to == "0x46c27e9073d3aea1e68303b0e6c3ee79b4ccf515" && transaction.isError == 0 && transaction.confirmations > 12)
                        {
                            // check if this transaction has already been credited
                            if (alreadyCredited.indexOf(transaction.hash) != -1)
                                return
                            
                            // if it has not yet been creditted
            
                            // find USD value from Bitstamp
                            var ethusd = parseFloat(JSON.parse(request('GET', 'https://www.bitstamp.net/api/v2/ticker/ethusd/').getBody().toString()).last)
                            var usdvalue = parseFloat((transaction.value / 10**18) * ethusd).toFixed(2)
            
                            console.log("Paid "+from_username+" $"+usdvalue)
                            
                            // credit it
                            client.query("INSERT INTO ether_coinbases (username, address, blockheight, timestamp, hash, blockhash, date, amount, usdvalue) \
                            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                            [from_username, from_eth_address, transaction.blockNumber, transaction.timeStamp, transaction.hash, transaction.blockHash,
                            parseInt(Date.now()), transaction.value, usdvalue])
                            
                            // create coinbase transaction
                            module.exports.createCoinbase(from_address, usdvalue)

                            client.query("UPDATE payment_forms SET finished = 1 WHERE id = $1", [r["id"]])
                        }
                    })
                })
            })
        })
    }
}

// private key of oracle for signing
exports.oraclePrivateKey = oraclePrivateKey