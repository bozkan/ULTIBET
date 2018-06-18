// import modules

var fs = require('fs')
var prompt = require('prompt')
var config = require('./config.js')

// import functions

var helpers = require('./functions.js')

// import classes

var classes = require('./classes.js')
var User = classes.User

// define credentials file

const credentialsFile = config.credentialsFile

module.exports = {

	register: function(username)
	{

		// generate user

		let user = new User(username)
		let credentials = helpers.credentials(user)

		// save credentials

		// helpers.saveUser(credentialsFile, credentials)

		// print credentials

		console.log("Your public address: "+user.publicKey)
		console.log("Your private key (SECRET): "+user.privateKey)

		return [user.publicKey, user.privateKey]

	}
}