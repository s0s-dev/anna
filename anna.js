const bot_secret = require('./lib/bot-secret')
var bot = require('./lib/bot');

const fs = require('fs')

const discord = require('discord.js')
const client = new discord.Client()

// channels (probably shouldn't be hardcoded)
// maybe create a clever algorithm that searches for a channel named emu
var banned_channels = [
  "551534978417295410", // bot-design
]

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

  // Prevent bot from responding to its own messages
  if (receivedMessage.author == client.user) { return } // catch and release

  // only send greeting message once
  // note this needs to move to the database asap
  var channelsGreeted = fs.readFileSync("conf/channels.txt").toString().split("\n")
  for (i in channelsGreeted) {
    if (receivedMessage.channel.name == channelsGreeted[i]) {
      greeted = true
    }
  }

  var msg = receivedMessage.content
  var msg_lc = msg.toLowerCase()
  anna.log(receivedMessage.channel + msg)

  var botUser = client.user.toString()
  botUser = stripPunctuation(botUser)

  console.log("message: " + receivedMessage.content)
  console.log("botUser: " + botUser)

  // Check if the bot's user was tagged in the message
  // and make sure that the channel has not already been greeted
  if (receivedMessage.content.includes(botUser) && !(greeted)) {
    // Send acknowledgement message
    //receivedMessage.channel.send("Message received from " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    receivedMessage.channel.send(greeting)

    fs.appendFile("./conf/channels.txt", chan + "\n", (err) => {
      if (err) throw err;
      console.log("Channel saved");
    })
  }
})

function stripPunctuation(text) {
    var tmp = text.replace(/[>.,\/#<@!$%\^&\*;:{}=\-_`~()]/g,"")
    //tmp = tmp.replace(/\s{2,}/g," ")
    return tmp
}

client.login(bot_secret.bot_secret_token)
