const greeting_file = require("./conf/greeting.json")
const questions_file = require("./conf/questions.json")

const timer_functions = require("./lib/timer")
const bot_secret = require("./lib/bot-secret")
const bot = require("./lib/bot")

var anna = new bot()
var bot_id = "581973598302896254"

const discord = require('discord.js')
const client = new discord.Client()

process.on('uncaughtException', function(err) {
  anna.log(err)
  console.log(err)
})

var greeting
var channel_log

client.on('ready', () => {
  anna.log("Connected as " + client.user.tag)

  anna.name("Anna")
  anna.default_reply("...")

  console.log(questions_file)

  //var nowPlayingText = "ABBA" 
  //client.user.setActivity(nowPlayingText)

  channel_log = loadChannelLog()
})

// React to Dagny (et al)
client.on('messageReactionAdd', (reaction, user) => {
  //console.log(getLastMessaage(reaction.message.channel))

  if (!(reaction.message.author.id == bot_id)) {
      // Not Anna
      console.log("channel log: ")
      if (channel_log) {
          // the user has been greeted
          
          var chanCnt = 0
          for (var i in channel_log) {
              i++
              chanCnt = i
            }
          console.log(chanCnt)

          var emoji = reaction.emoji
          if (emoji.name == "👍") {

            console.log("Find question by name: ")
            console.log(reaction.message.channel.lastMessage.content)
            var mid = reaction.message.channel.lastMessage.id
            var cid = reaction.message.channel
            
            //console.log(reaction.message.channel.messages({"before": mid, "limit": 1}))
            //console.log(findQuestionByName(reaction.message.channel.messages({"before": mid, "limit": 1})))
          }

          // greeting question
          if (chanCnt == 0) {
              var emoji = reaction.emoji
              console.log(emoji.name)
              if (emoji.name == "👍") {
                  // user has approved the question flow
                  var q = questions_file[0]

                  // ask the first question
                  askQuestion(reaction.message.channel, "#" + q.id + ": " + q.question)
              }
              if (emoji.name == "👎") {
                  // this should come from somewhere that's not here
                  reaction.message.channel.send("Ok just let us know when you're ready.")
                  // timer_functions.clearTimer(reaction.message.channel) // pause for questions
                  chanCnt--
              }
          } else {
            if (reaction.emoji.name == "❔") {
              timer_functions.clearTimer(reaction.message.channel) // pause for questions
            }
          }
      } else {

      }
  } else {
      // it's you
      loadChannelLog()

  }
  if (user.id == "628367813345542154") {
      // dagny tagged it


  } else {
      // someone else tagged it
  }
})

// Reply to messages
var lastSpoke
client.on('message', (receivedMessage) => {
    var greeted = false
    var dontAtMe = false
    var chanCount = 0

    var q = getNextQuestion(receivedMessage.channel)

    //loadChannelLog(receivedMessage.channel)

    timer_functions.clearTimer(receivedMessage.channel)
    console.log(receivedMessage.content)

    lastSpoke = receivedMessage.author

    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) { return } 

    // bot was @ tagged
    if (receivedMessage.content.startsWith("<@!" + bot_id + ">")) {
        dontAtMe = true

        // strip out all references to @anna
        var msg = receivedMessage.content.replace(/<@![0-9]*> /g,"").replace(("<@!" + bot_id + "> "),"")
        var msg_lc = anna.stripPunctuation(msg.toLowerCase())
        if (msg_lc.startsWith("anna")) { msg_lc = msg_lc.replace("anna ","") }

        console.log("Don't @ me")

        // allow interruption 
        if ((msg_lc == "stop") || (msg_lc == "pause")) {
            console.log("Paused by " + receivedMessage.author.username)
            timer_functions.clearTimer(receivedMessage.channel)
        }

        // resume
        if ((msg_lc == "start") || (msg_lc == "resume") || (msg_lc == "continue")) {
            console.log("Resumed by " + receivedMessage.author.username)
            if (q) {
              askQuestion(receivedMessage.channel,q.question)              
            }
        }

        // start 
        if (msg_lc == "start") { 
            console.log("START command issued by " + receivedMessage.author.username)
            var tmp = greeting_file.greeting

            askQuestion(receivedMessage.channel,tmp)
            greeted = true
        }

    } else {
        // ask a question
        console.log(channel_log)

        console.log("next question:")        
        console.log(q)
        if (q) {
          //"#" + q.id + ": " + 
          askQuestion(receivedMessage.channel,q.question)
        }
    }

    loadChannelLog()
})

function getLastMessage(channel) {
  if (channel) {
    channel.fetchMessages({ limit: 1 }).then(messages => {
      let lastMessage = messages.first();
    
      if (lastMessage.author.bot) {
        // The author of the last message was a bot
        var q = findQuestionByName(lastMessage.content)
        console.log("Finding question by name:")
        console.log(q)

        return q
      }
    })
    .catch(console.error)
  }
}

function findQuestionByName(question) {
  console.log("Matching: ")
  console.log(question)
  for (var i in questions_file) {
    var q = questions_file[i]
    
    if (q.question == question) {
      console.log("ID Matches: " + i) 
      return q
    }
  }
}

function askQuestion(channel, question = "How are you?") {
    loadChannelLog(channel)

    console.log("Asking " + question + " in " + channel.name)
    var timer = timer_functions.setTimer(channel, question)

    //console.log(channel_log)
}

function getNextQuestion(channel) {
    if (channel_log) {
        var chanCnt = 0
        for (var i in channel_log) {
            chanCnt++
        }
        console.log(chanCnt)

        // next question
        if (chanCnt > 0) {
            var tmpQuestion = questions_file[chanCnt]
            console.log(tmpQuestion)
        }

        return tmpQuestion
    }
}

function loadChannelLog(channel) {
	var query = {}
	if (channel) {
		query.channel = channel.id
	}

    var formatting = { date:1,user:1,text:1, _id:0}
    formatting = {}

	var initializePromise = anna.getDataMongo("anna","channels",query,formatting)
    initializePromise.then(function(result) {
        channel_log = result
        //console.log("Loaded channel log")
        //console.log(channel_log)
        //parseDictionary(dict)

        return result
        resolve(result)
    }, function(err) {
        console.log(err);
    })
}

  
client.login(bot_secret.bot_secret_token)
