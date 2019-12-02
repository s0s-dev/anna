// bot.js
var bot = function () {}

// When it says secret, it really kind of means secret...
// so let's put it right at the top of this file here
const bot_secret = require('./bot-secret')

var tmp_url 
if (bot_secret) {
  tmp_url = bot_secret.mongo_url
}
var mongo_url = process.env.MONGO_URL || tmp_url

var bot_name
var bot_greeting
var bot_rating
var bot_reply
var bot_keywords
var bot_odds
var bot_channel
var bot_platform

const MongoClient = require('mongodb').MongoClient

const fs = require('fs')
const request = require('request')

const { createLogger, format, transports } = require('winston')
const env = process.env.NODE_ENV || 'development'

require('winston-daily-rotate-file')

const conf_dir = "conf" // log directory
const log_dir = "logs" // log directory
const log_file = "bot" // log file name

// Create the log & conf directories if it does not exist
if (!fs.existsSync(log_dir)) { fs.mkdirSync(log_dir) }
if (!fs.existsSync(conf_dir)) { fs.mkdirSync(conf_dir) }

// const filename = path.join(log_dir, 'emuji.log')
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${log_dir}/${log_file}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD'
})

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    dailyRotateFileTransport
    //new transports.File({ filename })
  ]
})

bot.prototype.name = function(name) {
  bot.bot_name = name
  logger.info("@" + bot.bot_name + ": Hello, my name is " + bot.bot_name)
}

bot.prototype.keywords = function(input) {
  bot.keywords = input.toLowerCase()
  logger.info("@" + bot.bot_name + ": Keywords changed to " + bot.keywords)
}

bot.prototype.default_reply = function(reply) {
  bot.bot_reply = reply
  logger.info("@" + bot.bot_name + ": Default reply changed to " + bot.bot_reply)
}

bot.prototype.odds = function(percent) {
  bot.bot_odds = percent
  logger.info("@" + bot.bot_name + ": Odds set to " + bot.bot_odds * 100 + "%")
}

bot.prototype.channel = function(channel) {
	if (channel) {
		bot.bot_channel = channel
		logger.info("@" + bot.bot_name + ": Bot channel set to #" + channel.name)
	} else {
		logger.info("@" + bot.bot_name + ": 404 channel not found")
	}
}

bot.prototype.say = function(input, channel = bot_channel) {

	// default input, if empty
	if (input) {
		msg = input
	} else {
		msg = bot.bot_reply
	}

	if (channel) {
		console.log("channel id: " + channel.id)
		channel.send(msg)
		logger.info("@" + bot.bot_name + ": <" + channel.id + ":" +channel.name + "> " + msg)
	} else {
		console.log("Error: Channel not specified")
		console.log(channel)
	}
}

bot.prototype.rating = function(rating) {
  bot.bot_rating = rating
  logger.info("@" + bot.bot_name + ": Rating changed to " + bot.bot_rating)
}

bot.prototype.log = function(msg) {
  logger.info("@" + bot.bot_name + ": " + msg)
}

bot.prototype.getDataMongo = function(database, collection, options = {}, formatting = {}) {
	// Return new promise
	return new Promise(function(resolve, reject) {
		// Do async job
		MongoClient.connect(mongo_url, function(err, db) {

			var dbo = db.db(database)
			var coll = dbo.collection(collection)

			coll.find(options,formatting).toArray(function(err, result) {
				if (err) {
					throw err
				} else {
					resolve(result)
					db.close()
				}
			})
		})
	})
}

bot.prototype.insertDataMongo = function(json, database, collection) {

	// Return new promise
	return new Promise(function(resolve, reject) {
		// Do async job
		MongoClient.connect(mongo_url, function(err, db) {

			var dbo = db.db(database)
			var coll = dbo.collection(collection)

			coll.insertOne(json, function(err,result) {
				if (err) {
					throw err
				} else {
					resolve(result)

					console.log("Saved: ")
					console.log(json)
					db.close()
				}

				return
			})
		})
	})
}

bot.prototype.stripPunctuation = function(text) {
  var tmp = text.replace(/[>.,\/#<@!$%\^&\*;:{}=\-_`~()]/g,"")
  //tmp = tmp.replace(/\s{2,}/g," ")
  return tmp
}

module.exports = bot
