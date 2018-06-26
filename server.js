var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var broadcast = require('./broadcast.js')
var register = require('./register.js')
var sign = require('./sign.js')
var oracle = require('./oracle.js')
var config = require('./config.js')

var balances = []

function getMatches(dict)
{
	var flags = []
	var output = []

	for (var key in dict) 
	{
		if (typeof flags[dict[key]] !== "undefined")
			continue
		flags[dict[key]] = true
		if (dict[key].length != 0)
			output.push(dict[key])
	}

	return output
}

/* 
This runs the oracle
Results are broadcasted to blockchain
Run it every x seconds
Run it for each server
Include player balances
-->Move this into the sockets<--
*/

setInterval(function(){

		var matches = getMatches(serverToGame)
		console.log(matches)

		// !for each of this matches, run oracle -> only one per game
		// send servers and balances
		// send out new balances after
		matches.forEach(function(match){
			oracle.oracle(match, addressToUsername)
		})
}, 20000)

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

var servers = []
var serverToGame = {}
var addressToUsername = {}
var usernameToAddress = {}
var usernameToPrivate = {}
var bets = []
var serverToPlayers = {}
var usernameToBalance = {}
var serverToCoinbase = {}
var playerToServer = {}
var users = []
var gameToCommentary = {}
var serverToEvents = {} // dictionary -> array -> dictionary

setInterval(function(){

	for (var key in serverToEvents)
	{
		for (var i = 0, n = serverToEvents[key].length; i < n; i++)
		{
			try {
			if (serverToEvents[key][i].timeRemaining == 0)
			{
				// if countdown is up, delete the event
				for (var j = 0, k = bets.length; j < k; j++)
				{
					if (bets[j].eventid == serverToEvents[key][i].eventid && bets[j].server == key)
					{
						console.log("KEY "+key)
						io.sockets.to(key).emit('delete pending bet timer', serverToEvents[key][i].eventid, bets[j].username, bets[j].amount)
						usernameToBalance[bets[j].username] = parseFloat(usernameToBalance[bets[j].username]) + parseFloat(bets[j].amount)
						bets.splice(j, 1)
					}
				}
				serverToEvents[key].splice(i, 1)
				console.log(serverToEvents)
			}
			else
			{
				io.sockets.to(key).emit('tick', serverToEvents[key][i].eventid, serverToEvents[key][i].timeRemaining)
				serverToEvents[key][i].timeRemaining -= 1
			}
			} catch (err) { console.log("ERR: "+ err)}
		}
	}

}, 1000)

app.get("/", function(req, res){
	console.log(servers)
	res.render(__dirname + '/server/masterserver.html', { servers: servers })
})

app.get("/play", function(req, res) {
	res.render(__dirname + '/server/play.html', { server: req.query.server, matchid: serverToGame[req.query.server], commentary: gameToCommentary[serverToGame[req.query.server]], players: serverToPlayers[req.query.server], coinbase: serverToCoinbase[req.query.server], balances: JSON.stringify(usernameToBalance) })
})

io.on('connection', function (socket) {

	console.log('New connection.');

	// when receiving an updated blockchain, emit it to all nodes
	socket.on('emit_blockchain', function (blockchain) {
		// emit to all nodes
		io.sockets.emit('receive_blockchain', blockchain[0])
		console.log("Emitting new state of blockchain...")
	});

	// when receiving a new transaction to be added to mempools, emit it to all nodes
	socket.on('emit_transaction', function (transaction) {
		// emit to all nodes
		io.sockets.emit('receive_transaction', transaction[0])
		console.log("Emitting new transaction...")
	});

	// when receiving an ask
	socket.on('ask', function () {
		// emit to all nodes
		io.sockets.emit('send_hash', socket.id)
		console.log("Asking for hashes...")
	});

	// when receiving hashes -> emit them to the asking client
	socket.on('emit_hash', function (id, hash) {
		socket.to(id).emit('receive_hash', hash, socket.id);
		console.log("Sending hash...")
		console.log(hash)
	});

	// when asking specific node for chain
	socket.on('ask_node', function (id) {
		socket.to(id).emit('send_chain', socket.id)
		console.log("Asking specific node for chain...")
	});

	// when sending chain from specific node
	socket.on('emit_chain_from_node', function (chain, id) {
		socket.to(id).emit('receive_chain_from_node', chain)
		console.log("Sending specific chain to node...")
	});

	/* Begin handling UI events */

	socket.on('create game', function (servername, gameid, coinbase) {
		servers.push(servername)
		serverToGame[servername] = gameid
		serverToPlayers[servername] = []
		serverToCoinbase[servername] = coinbase
		gameToCommentary[gameid] ? 1 : gameToCommentary[gameid] = []
	})

	socket.on('ask login', function (username) {
		if (users.indexOf(username) != -1)
			io.sockets.to(socket.id).emit('error message', 'This username is already being used. Please choose another one.')
		else
			io.sockets.to(socket.id).emit('login approved')
	})

	socket.on('place pending bet', function (eventid, wager, username, server, matchid, amount, already) {
		// broadcast that the bet is pending
		if (already === false)
		{
			io.sockets.to(server).emit('receive pending bet', eventid, amount, username)
			serverToEvents[server] ? 1 : serverToEvents[server] = []
			serverToEvents[server].push({"eventid": eventid, "timeRemaining": 30 })
		}
		// update balances
		usernameToBalance[username] -= amount
		var balances = []
		for (var i = 0, n = serverToPlayers[server].length; i < n; i++)
		{
			balances.push({"player": serverToPlayers[server][i], "amount": usernameToBalance[serverToPlayers[server][i]]})
		}
		io.sockets.to(server).emit('receive balances', usernameToBalance[username], username)
		// sign the bet
		var signature = sign.sign(usernameToAddress[username], usernameToPrivate[username], amount)
		bets.push(
			{ "eventid": eventid, "amount": amount, "wager": wager, "username": username, "server": server, "matchid": matchid, "signature": signature }
		)
		// check if bet is complete
		var betCount = 0
		for (var i = 0, n = bets.length; i < n; i++)
		{
			if (bets[i].server == server && bets[i].matchid == matchid && bets[i].eventid == eventid && bets[i].amount == amount)
				betCount++
		}
		// everyone has placed a bet -> broadcast the bet
		if (betCount == serverToPlayers[server].length) 
		{
			io.sockets.to(server).emit('delete pending bet', eventid)
			io.sockets.to(server).emit('receive active bet', eventid, amount)
			// delete event from countdown
			for (var i = 0, n = serverToEvents[server].length; i < n; i++) 
			{
				if (serverToEvents[server][i].eventid == eventid)
				{
					serverToEvents[server].splice(i, 1)
					break
				}
			}
			var from = []
			var amount = []
			var wagers = []
			var signatures = []
			var timestamp = Date.now()

			for (var i = 0, n = bets.length; i < n; i++)
			{
				if (bets[i].server == server && bets[i].matchid == matchid && bets[i].eventid == eventid)
				{
					from.push(usernameToAddress[bets[i].username])
					amount.push(parseInt(bets[i].amount))
					wagers.push(bets[i].wager)
					signatures.push(bets[i].signature)
				}
			}
			broadcast.transaction("escrow", eventid, from, [], amount, wagers, server, matchid, signatures, timestamp, config.mempoolFile)
			// remove bets that have been broadcasted
			bets = bets.filter(function(bet){ return !(bet.server == server && bet.matchid == matchid && bet.eventid == eventid) })	
		}
	})

	socket.on('user register', function (username) {
		// register user with new public key (address)
		if (usernameToAddress[username])
			io.sockets.to(socket.id).emit('error message', 'This username is already taken. Please choose another username.')
		else
		{
			var address = register.register(username)
			addressToUsername[address[0]] = username
			usernameToAddress[username] = address[0]
			usernameToPrivate[username] = address[1]
		}
	})

	socket.on('login user', function (username, server) {
		// add unique player to server
		serverToPlayers[server] ? serverToPlayers[server].indexOf(username) == -1 ? serverToPlayers[server].push(username) : 1 : serverToPlayers[server] = [username]
		socket.join(server)
		playerToServer[username] = server
		users.push(username)
		usernameToBalance[username] = serverToCoinbase[server]
		if (usernameToAddress[username])
		{
			io.sockets.to(socket.id).emit('receive address', usernameToAddress[username])
			io.sockets.to(server).emit('receive login user', username)
		}
		else
		{
			io.sockets.to(socket.id).emit('error message', 'This user does not exist.', 'login')
		}
	})

	socket.on('transfer balances', function (balances) {
		for (var i = 0, n = balances.length; i < n; i++)
		{
			usernameToBalance[balances[i].player] += balances[i].amount
			io.sockets.to(playerToServer[balances[i].player]).emit('receive balances', usernameToBalance[balances[i].player], balances[i].player)
		}
		console.log(balances)
	})

	socket.on('send timer', function (minute, score, home, away, matchid, homeflag, awayflag) {
		for (var key in serverToGame)
		{
			if (serverToGame[key] == matchid)
				io.sockets.to(key).emit('receive timer', minute, score, home, away, homeflag, awayflag)
		}
	})

	socket.on('send live commentary', function (minute, eventid, team, matchid) {
		for (var key in serverToGame)
		{
			if (serverToGame[key] == matchid)
				io.sockets.to(key).emit('receive live commentary', minute, eventid, team)
		}
		gameToCommentary[matchid].push(minute+"!:!"+eventid+"!:!"+team)
	})

	socket.on('do delete active bet', function (server, eventid) {
		io.sockets.to(server).emit('delete active bet', eventid)
	})

	socket.on('new chat', function (username, server, message) {
		io.sockets.to(server).emit('receive new chat', username, message)
	})

	socket.on('get player counts', function () {
		io.sockets.to(socket.id).emit('receive player counts', serverToPlayers)
	})

});

var server = http.listen(1338, function () {
  console.log('listening on *:1338');
});
