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

// log errors
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
  var silent = false;

  // Prevent bot from responding to its own messages
  if (receivedMessage.author == client.user) { return } // catch and release

  var msg = receivedMessage.content
  var msg_lc = msg.toLowerCase()
  anna.log(receivedMessage.channel + msg)

  var botUser = client.user.toString()
  botUser = stripPunctuation(botUser)

  console.log("message: " + receivedMessage.content)
  console.log("botUser: " + botUser)

  // Check if the bot's user was tagged in the message
  if (receivedMessage.content.includes(botUser)) {
    // Send acknowledgement message
    //receivedMessage.channel.send("Message received from " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    receivedMessage.channel.send(greeting)
  }
})

function stripPunctuation(text) {
    var tmp = text.replace(/[>.,\/#<@!$%\^&\*;:{}=\-_`~()]/g,"")
    //tmp = tmp.replace(/\s{2,}/g," ")
    return tmp
}

client.login(bot_secret.bot_secret_token)
