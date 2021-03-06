var dev = process.env.DEV || false

const questions_file = require("./conf/questions.json")

const anna_functions = require("./lib/functions")
const timer_functions = require("./lib/timer")
const bot_secret = require("./lib/bot-secret")
const bot = require("./lib/bot")

const discord = require('discord.js')
const client = new discord.Client()

var anna = new bot()
var bot_id = "581973598302896254"
var greeter_id = "606685267675578369"

// set questions channel
var questions_channel = "643197969365204994"
if (dev) { 
  questions_channel = "635737039517777931"
}

var tmp_token
if (bot_secret) {
  tmp_token = bot_secret.bot_secret_token
}
var discord_token = process.env.BOT_SECRET || tmp_token

var anna_start = []

process.on('uncaughtException', function(err) {
  anna.log(err)
  console.log(err)
})

client.on('ready', () => {

  anna.log("Connected as " + client.user.tag)
  anna.name("Anna")

  var nowPlayingText = "20 Questions" 
  client.user.setActivity(nowPlayingText)
})

// reactions
client.on('messageReactionAdd', (reaction, user) => {
  var icon = reaction.emoji.name

  // not annabot
  if (reaction.message.author.id != bot_id) {
    // the user (or someone) has a question
    if (icon === "❔") {
      // send the question to the #questions channel
      if (reaction.message.author.bot) {
        // only send questions from end users, 
        // not people on the discord server

        var qMsg = reaction.message.content
        console.log(qMsg)
        qChannel.send('"' + qMsg + '" in <#' + reaction.message.channel.id + '>')      }
    }
  }

  // emojis trigger next question
  if (anna_functions.isNextEmoji(icon)) {    
    reaction.message.channel.fetchMessages({ limit: 20 })
    .then(function(messages) {
      var q = anna_functions.getQuestion(reaction.message.channel, messages)
    
      if (q) {        
        var ans = {}
        ans.channel = reaction.message.channel.name
        ans.channel_id = reaction.message.channel.id
        ans.question_id = q.id
        ans.question = q.lastQuestion
        ans.question_score = q.lastQuestionScore
        ans.answer = reaction.message.content
        ans.record_date = Date.now()
        ans.question_date = q.lastQuestionDate
        ans.answer_date = reaction.message.createdTimestamp
        ans.delta = Math.abs(ans.answer_date - ans.question_date)

        if (ans.delta) {
          // only save if there is a score
          anna.insertDataMongo(ans,"anna","answers")
        }

        console.log("Asking: " + q.question)
        timer_functions.setTimer(reaction.message.channel,q.question)  
        
        // add to started channel if not there (because it's obviously started)
        if (!(isStarted(reaction.message.channel.id))) {
          annaStart(reaction.message.channel.id)
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
      // Give up by reacting last message after 30 seconds
      receivedMessage.channel.fetchMessages({ limit: 1 })
      .then(messages => giveUp(messages))
      .catch(console.error)
    },15000)
  
    console.log(receivedMessage.content)
    receivedMessage.channel.fetchMessages({ limit: 20 })
    .then(messages => function(messages) {      
      var q = getQuestion(receivedMessage.channel, messages)
      var msg = receivedMessage.content
    })

    var tmpMsg = receivedMessage.content
    var atMe = false 
    if (tmpMsg.indexOf("<@!" + bot_id + ">") != -1) {
      console.log("Don't @ me")
      atMe = true
    }
    tmpMsg = tmpMsg.replace("<@!" + bot_id + "> ","").toLowerCase()
    tmpMsg = anna.stripPunctuation(tmpMsg)

    if (atMe) {
      if (tmpMsg.startsWith("start")) {
        console.log("Starting question flow")
        var intro = questions_file[0]
        timer_functions.setTimer(receivedMessage.channel, intro.question)
  
        annaStart(receivedMessage.channel.id)
      }
  
      if ((tmpMsg == ("stop")) || (tmpMsg.startsWith("pause"))) {
        console.log("Stopping question flow")
        annaStop(receivedMessage.channel.id)
      }
  
      if ((tmpMsg.startsWith("resume")) || (tmpMsg.startsWith("continue"))) {
        console.log("Resume question flow")
        annaStart(receivedMessage.channel.id)
      }
  
      if (receivedMessage.content.startsWith("next")) {
        var q = anna_functions.getQuestion(receivedMessage.channel, messages)
        if (q) {
          timer_functions.setTimer(receivedMessage.channel, q.question)
        }
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
        var regex2 = /\d+$/g // ends with number

        var chan = msg.channel.name

        // allows channels to be named with -[name] 
        /// like we have been doing on discord 
        var aChan = chan.split("-")
        if (aChan[0]) { chan = aChan[0] }

        // only post in numbered channels
        if ((chan.match(regex)) || (chan.match(regex2))) {
          console.log("Tagging with emoji: ✔️")
          msg.react("✔️")
        } else {
          var numChan = aChan.length
          var tmpChan = aChan[numChan -1]
          if ((tmpChan.match(regex)) || (tmpChan.match(regex2))) {
            console.log("Tagging with emoji: ✔️")
            msg.react("✔️")
          }
        }
      }
    }
  }
  clearTimeout(msgTimer)
}

function annaStart(channel_id) {
  anna_start.push(channel_id)
}

function annaStop(channel_id) {
  for (var i in anna_start) {
    if (channel_id == anna_start[i]) {
      anna_start.splice(i, 1)
    }
  }
}

client.login(discord_token)
