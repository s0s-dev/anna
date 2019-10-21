const questions = require("./conf/questions.json")
const bot_secret = require("./lib/bot-secret")
const bot = require("./lib/bot")
const bot_functions = require("./lib/bot-functions")

const fs = require('fs')

const discord = require('discord.js')
const client = new discord.Client()
var anna = new bot()
var annalib = new bot_functions()

process.on('uncaughtException', function(err) {
  anna.log(err)
  console.log(err)
})

var greeting = ""
var questionWords = []
client.on('ready', () => {
  anna.log("Connected as " + client.user.tag)

  anna.name("Anna")
  anna.default_reply("...")
  anna.keywords("")
  anna.rating("G")

  console.log(questions)

  // set discord client "now playing"
  var currentYear = new Date
  currentYear.getFullYear

  var nowPlayingText = "ABBA" 
  client.user.setActivity(nowPlayingText)

  // load greeting from file
  fs.readFile('conf/greeting.txt', 'utf8', function(err, data) {
    if (err) throw err
    greeting = data
  })
})

// Reply to messages
client.on('message', (receivedMessage) => {
  var replyRequired = false
  var greeted = false
  var chan = receivedMessage.channel.name
  var chanCount = 0 // number of times a channel has been logged

  var msg = receivedMessage.content.replace(/<@![0-9]*> /g,"")
  var msg_lc = msg.toLowerCase()

  console.log(msg_lc)

  // Prevent bot from responding to its own messages
  if (receivedMessage.author == client.user) { return } // catch and release

  // allow interruption 
  if ((msg_lc == "stop") || (msg_lc == "pause")) {
    console.log("Paused")
    annalib.pause(receivedMessage.channel.name)
  }

  // resume
  if ((msg_lc == "start") || (msg_lc == "resume") || (msg_lc == "continue")) {
    console.log("Resumed")
    annalib.resume(chan)
  }

  // only send greeting message once
  // note this needs to move to the database asap
  var channelsGreeted = fs.readFileSync("conf/channels.txt").toString().split("\n")
  for (i in channelsGreeted) {
    if (receivedMessage.channel.name == channelsGreeted[i]) {
      chanCount++
      greeted = true
    }
  }

  anna.log(receivedMessage.channel + msg)

  var botUser = client.user.toString()
  botUser = anna.stripPunctuation(botUser)

  console.log("message: " + receivedMessage.content)
  console.log("botUser: " + botUser)

  if (!(annalib.isPaused(chan))) {
    // Check if the bot's user was tagged in the message
    // and make sure that the channel has not already been greeted
    if (receivedMessage.content.includes(botUser) && (!(greeted))) {
      // Send greeting message
      receivedMessage.channel.send(greeting)
      // save channel 
      annalib.logChan(chan)
    } else {
      if (greeted) {
        // begin the question flow
        var questionNum = chanCount - 1 // less greeting
        var questionJSON = questions[questionNum]
        if (questionJSON) {
          var question = questionJSON.question
          // keep asking until we run out of questions
          console.log("Question #" + chanCount + ": " + question)

          var variableReward = Math.floor(Math.random() * Math.floor(5000)) 
          variableReward += (question.length * 250) // add .25s per character
          console.log(variableReward)
          setTimeout(function() { 
            receivedMessage.channel.send(question)
          },variableReward)

          // note this should be a fucntion
          annalib.logChan(chan)
        } else {
          annalib.pause(receivedMessage.channel.name)
        }
      }
    }
  }
})


client.login(bot_secret.bot_secret_token)
