const questions_file = require("./conf/questions.json")

const anna_functions = require("./lib/functions")
const timer_functions = require("./lib/timer")
const bot_secret = require("./lib/bot-secret")
const bot = require("./lib/bot")

var anna = new bot()
var bot_id = "581973598302896254"
var greeter_id = "606685267675578369"

var questions_channel = "635737039517777931"

const discord = require('discord.js')
const client = new discord.Client()

var anna_start = []

process.on('uncaughtException', function(err) {
  anna.log(err)
  console.log(err)
})

client.on('ready', () => {

  anna.log("Connected as " + client.user.tag)
  anna.name("Anna")

  var nowPlayingText = "Anna 3" 
  client.user.setActivity(nowPlayingText)

})

// reactions
client.on('messageReactionAdd', (reaction, user) => {
  var icon = reaction.emoji.name
  console.log(icon)

  // not annabot
  if (reaction.message.author.id != bot_id) {
    // the user (or someone) has a question
    if (icon === "❔") {
      // send the question to the #questions cahnnel
      qChannel = client.channels.get(questions_channel)

      var qMsg = reaction.message.content
      console.log(qMsg)
      qChannel.send('"' + qMsg + '" in <#' + reaction.message.channel.id + '>')
    }
  }

  // emojis trigger next question
  if (anna_functions.isNextEmoji(icon)) {
    console.log("NEXT!")
    
    reaction.message.channel.fetchMessages({ limit: 10 })
    .then(function(messages) {
      console.log("Get next question")
      var q = anna_functions.getQuestion(reaction.message.channel, messages)
    
      if (q) {
        console.log(q.question)
        timer_functions.setTimer(reaction.message.channel,q.question)  
        
        // add to started channel if not there (because it's obviously started)
        if (!(isStarted(reaction.message.channel.id))) {
          anna_start.push(reaction.message.channel.id)
        }
      }
    })
  }
})

var msgTimer 
client.on('message', (receivedMessage) => {
  // do not reply to yourself
  if (receivedMessage.author == client.user) { 
    return 
  } else {

    msgTimer = setTimeout(function() {
      // get last message and tag it with next
      console.log("MOVING ON!")
  
      // Give up by reacting last message after 30 seconds
      receivedMessage.channel.fetchMessages({ limit: 1 })
      .then(messages => giveUp(messages))
      .catch(console.error)
    },15000)
  
    console.log(receivedMessage.content)
    receivedMessage.channel.fetchMessages({ limit: 10 })
    .then(messages => function(messages) {

      console.log("Get next question")
      
      var msg = receivedMessage.content
      console.log(msg)
    })

    var tmpMsg = receivedMessage.content
    tmpMsg = tmpMsg.replace("<@!" + bot_id + "> ","")
    tmpMsg = anna.stripPunctuation(tmpMsg)

    if (tmpMsg.startsWith("start")) {
      var intro = questions_file[0]
      timer_functions.setTimer(receivedMessage.channel, intro.question)

      anna_start.push(receivedMessage.channel.id)
    }

    if (receivedMessage.content.startsWith("!next")) {
      var q = anna_functions.getQuestion(receivedMessage.channel, messages)
      if (q) {
        timer_functions.setTimer(receivedMessage.channel, q.question)
      }
    }
    
  } 
})

function isStarted(channel_id) {
  var retval = false
  for (var i in anna_start) {
    if (channel_id == anna_start[i]) {
      retval = true
    }
  }
  return retval
}
function giveUp(messages) {
  var msg = messages.last()

  // has not been reacted to
  if (msg.reactions.size == 0) {
    // is in anna_started array
    if (isStarted(msg.channel.id)) {
      // not greeter and not anna
      if ((msg.author.id != greeter_id) && (msg.author.id != bot_id)) {  
        var regex = /^[0-9]+$/g
        var chan = msg.channel.name
          // only post in numbered channels
          if (chan.match(regex)) {
          msg.react("✔️") 
        }
      }
    }
  }

  clearTimeout(msgTimer)
}

client.login(bot_secret.bot_secret_token)