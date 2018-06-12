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

// check if user already registered

if (fs.existsSync(credentialsFile)) 
{
    console.log("You have already registered. Check credentials.txt for info.")
    process.exit(1)
}

// prompt for username

prompt.start()

var schema = {
    properties: {
      name: {
      	description: 'Pick a username',
        pattern: /^[a-zA-Z\-]+$/,
        message: 'Name must be only letters or dashes',
       	required: true
      }
    }
  }

prompt.get(schema, 
	function (err, result) 
	{
    	// generate user

    	let user = new User(result.name)
    	let credentials = helpers.credentials(user)

    	// save credentials

    	helpers.saveUser(credentialsFile, credentials)

    	// print credentials

    	console.log("Your public address: "+user.publicKey)
    	console.log("Your private key (SECRET): "+user.privateKey)
	}
)