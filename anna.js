const bot_secret = require('./lib/bot-secret')
var bot = require('./lib/bot');

const fs = require('fs')

const discord = require('discord.js')
const client = new discord.Client()

// puased channels (probably shouldn't be an array)
var paused_channels = ["0"]

var anna = new bot()

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
    paused_channels.push(receivedMessage.channel.name)
  }

  // resume
  if ((msg_lc == "start") || (msg_lc == "resume") || (msg_lc == "continue")) {
    console.log("Resumed")
    resume(chan)
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
  botUser = stripPunctuation(botUser)

  console.log("message: " + receivedMessage.content)
  console.log("botUser: " + botUser)

  if (!(isPaused(chan))) {
    // Check if the bot's user was tagged in the message
    // and make sure that the channel has not already been greeted
    if (receivedMessage.content.includes(botUser) && (!(greeted))) {
      // Send greeting message
      receivedMessage.channel.send(greeting)
      // save channel 
      logChan(chan)
    } else {
      if (greeted) {
        // begin the question flow
        receivedMessage.channel.send(chanCount)

        // note this should be a fucntion
        logChan(chan)
      }
    }
  }
})

function resume(chan) {
  if (paused_channels) {
    for (var i = 0; i < paused_channels.length; i++) {
      console.log(paused_channels[i])
      if (chan == paused_channels[i]) {
        paused_channels.splice(i,1)
      }
    }
  console.log(paused_channels)
  }
}

function logChan(chan) {
  fs.appendFile("./conf/channels.txt", chan + "\n", (err) => {
    if (err) throw err;
    console.log("Channel saved");
  })
}

function isPaused(chan) {
  var retVal = false
  for (var i in paused_channels) {
    if (paused_channels[i] == chan) {
      retVal = true
    }
  }
  return retVal
}

function stripPunctuation(text) {
    var tmp = text.replace(/[>.,\/#<@!$%\^&\*;:{}=\-_`~()]/g,"")
    //tmp = tmp.replace(/\s{2,}/g," ")
    return tmp
}

client.login(bot_secret.bot_secret_token)
