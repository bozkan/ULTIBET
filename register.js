// import modules

// import functions

// import classes

var classes = require('./classes.js')
var User = classes.User

module.exports = {

	register: function(username)
	{

		// generate user

		let user = new User(username)

		// save credentials

		// helpers.saveUser(credentialsFile, credentials)

		// print credentials

		console.log("Your public address: "+user.publicKey)
		console.log("Your private key (SECRET): "+user.privateKey)

		return [user.publicKey, user.privateKey]

	}
}