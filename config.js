const blockchainFile = "blockchain.txt" // local blockchain file
const mempoolFile = "mempool.txt" // local mempool file
const difficultyHistoryFile = "difficultyHist.json" // local difficulty history file
const SHA512 = require('js-sha512'); // hash algorithm
const credentialsFile = "credentials.txt" // local credentials file
const difficulty = 4; // blockchain difficulty
const updateInterval = 10000 // how often to update mempool (lower number = more often therefore lower chance of orphaned chain, but longer time to mine)
const remoteBlockchainFile = "remoteBlockchain.txt" // local file of remote (incoming) blockchain
const relayServer = 'http://vojtadrmota.com:1338' // location of relay server
const blockchainServer = "http://bitpeers.vojtadrmota.com:80/blockchain.php" // blockchain relay
const transactionServer = "http://bitpeers.vojtadrmota.com:80/transaction.php" // transaction relay
const maxAmount = 1000 // maximum amount of money players can start with
const timeDifference = 120000 // amount of time that needs to pass between escrow and transfer in ms.
const nonce = 19970318 // constant nonce that needs to exist in all blocks
const oraclePublicKey = "1Hr3FvfAyEVBcRtrW9cfhCJbFqWG7nRGUq" // the public key of the oracle
const postgresConnection = "postgres://localhost:5432/ultibet"


// export

exports.blockchainFile = blockchainFile
exports.mempoolFile = mempoolFile
exports.difficultyHistoryFile = difficultyHistoryFile
exports.SHA512 = SHA512
exports.credentialsFile = credentialsFile
exports.difficulty = difficulty
exports.updateInterval = updateInterval
exports.remoteBlockchainFile = remoteBlockchainFile
exports.relayServer = relayServer
exports.blockchainServer = blockchainServer
exports.transactionServer = transactionServer
exports.maxAmount = maxAmount
exports.timeDifference = timeDifference
exports.nonce = nonce
exports.oraclePublicKey = oraclePublicKey
exports.postgresConnection = postgresConnection