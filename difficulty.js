var fs = require('fs');
var config = require('./config.js')

const difficultyHistoryFile = config.difficultyHistoryFile

module.exports = {
	check: function (timestamp, hash)
	{
		// iterate through each stamp in history, seeing where this timestamp fits
		var history = JSON.parse(fs.readFileSync(difficultyHistoryFile))

		// check if timestamp matches something
		for (var i = 0, n = history.length; i < n; i++)
		{
			if (history[i].startTime < timestamp && history[i].endTime > timestamp)
				return hash.substring(0, history[i].difficulty) === Array(history[i].difficulty + 1).join("0")
		}

		// check if timestamp is in last slot
		for (var i = 0, n = history.length; i < n; i++)
		{
			if (history[i].startTime * history[i].endTime < 0)
				return hash.substring(0, history[i].difficulty) === Array(history[i].difficulty + 1).join("0")
		}

		return false // timestamp cannot be found in intervals
	},

	// returns the difficulty for a specific timestamp or 0 if timestamp invalid

	retrieve: function (timestamp, hash)
	{
		// iterate through each stamp in history, seeing where this timestamp fits
		var history = JSON.parse(fs.readFileSync(difficultyHistoryFile))

		// check if timestamp matches something
		for (var i = 0, n = history.length; i < n; i++)
		{
			if (history[i].startTime < timestamp && history[i].endTime > timestamp)
			{
				if (hash.substring(0, history[i].difficulty) === Array(history[i].difficulty + 1).join("0"))
					return history[i].difficulty
			}
		}

		// check if timestamp is in last slot
		for (var i = 0, n = history.length; i < n; i++)
		{
			if (history[i].startTime * history[i].endTime < 0)
				if (hash.substring(0, history[i].difficulty) === Array(history[i].difficulty + 1).join("0"))
					return history[i].difficulty
		}

		return 0 // timestamp cannot be found in intervals
	}
}