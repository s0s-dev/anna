const questions_file = require("./conf/questions.json")
const greeting_file = require("./conf/greeting.json")
const bot_secret = require("./lib/bot-secret")
const bot = require("./lib/bot")

const discord = require('discord.js')
const client = new discord.Client()
var anna = new bot()

process.on('uncaughtException', function(err) {
  anna.log(err)
  console.log(err)
})

var greeting = ""
var questionWords = []
var channel_log

client.on('ready', () => {
  anna.log("Connected as " + client.user.tag)

  anna.name("Anna")
  anna.default_reply("...")
  anna.keywords("")
  anna.rating("G")

  console.log(questions_file)

  // set discord client "now playing"
  var currentYear = new Date
  currentYear.getFullYear

  var nowPlayingText = "ABBA" 
  client.user.setActivity(nowPlayingText)

  greeting = greeting_file.greeting
  channel_log = loadChannelLog()
})

// React to Dagny (et al)
client.on('messageReactionAdd', (reaction, user) => {
    if (!(reaction.message.author.id == "581973598302896254")) {
        // Not Anna
        clearTimer(reaction.message.channel)
        console.log("channel log: ")
        if (channel_log) {
            // the user has been greeted
            
            var chanCnt = 0
            for (var i in channel_log) {
                chanCnt++
            }
            console.log(chanCnt)

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
                }
            } else {
            }
        } else {

        }
    } else {
        // it's you
    }
    if (user.id == "628367813345542154") {
        // dagny tagged it
    } else {
        // someone else tagged it
    }
    
})

// Reply to messages
var timers = []
//var global_timer 
var lastSpoke
client.on('message', (receivedMessage) => {
    var greeted = false
    var dontAtMe = false
    var chanCount = 0
    
    //loadChannelLog(receivedMessage.channel)

    clearTimer(receivedMessage.channel)
    console.log(receivedMessage.content)

    lastSpoke = receivedMessage.author

    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) { return } 

    // bot was @ tagged
    if (receivedMessage.content.startsWith("<@!581973598302896254>")) {
        dontAtMe = true

        // strip out all references to @anna
        var msg = receivedMessage.content.replace(/<@![0-9]*> /g,"").replace("<@!581973598302896254> ","")
        var msg_lc = anna.stripPunctuation(msg.toLowerCase())
        if (msg_lc.startsWith("anna")) { msg_lc = msg_lc.replace("anna ","") }

        console.log("Don't @ me")

        // allow interruption 
        if ((msg_lc == "stop") || (msg_lc == "pause")) {
            clearTimer(receivedMessage.channel)
            console.log("Paused by " + receivedMessage.author.username)
            //annalib.pause(receivedMessage.channel.name)
            //clearTimeout(timer)
        }

        // resume
        if ((msg_lc == "resume") || (msg_lc == "continue")) {
            console.log("Resumed by " + receivedMessage.author.username)
            //annalib.resume(chan)
            //askQuestion(receivedMessage.channel,"How are you?")

            //chanCount++
        }

        // start 
        if (msg_lc == "start") { 
            console.log("START command issued by " + receivedMessage.author.username)
            // askQuestion(receivedMessage.channel, greeting)
            var tmp = greeting_file.greeting

            askQuestion(receivedMessage.channel,tmp)
            greeted = true
        }

    } else {
        // ask a question
        console.log(channel_log)

        console.log("next question:")
        var q = getNextQuestion(receivedMessage.channel)
        
        console.log(q)
        if (q) {
            askQuestion(receivedMessage.channel,"#" + q.id + ": " + q.question)
        }
    }

    loadChannelLog()
})

function resetTimer(channel) {
    clearTimer(channel)
    setTimer(channel,variableReward())
}

function clearTimer(channel) {
    console.log("Clearing the timer for " + channel.id)
    for (var i in timers) {
        var tmpTimer = timers[i]
        if (tmpTimer.channel == channel.id) {
            clearTimeout(tmpTimer.timer)

            // remove it from the array
            timers.splice(i,1)
        }
    }
}

function setTimer(channel,question = "") {
    var timer = {}
    var tmpTimer = setTimeout(function() { 
      //if (!(annalib.isPaused())) {

        if (question != "") { 
            // only save a log of it if the question is actually sent
            var log = {}
            log.channel = channel.id
            log.question = question
            log.date = Date.now()

            anna.insertDataMongo(log,"anna","channels")
            channel.send(question) // shhh
        }
    //}
    },variableReward(question))
    timer.timer = tmpTimer
    timer.channel = channel.id
    timers.push(timer)

    return timer
}


function askQuestion(channel, question = "How are you?") {
    loadChannelLog(channel)

    console.log("Asking " + question + " in " + channel.name)
    var timer = setTimer(channel, question)

    //console.log(channel_log)
}


function variableReward(question = "") {
    var retval = Math.floor(Math.random() * Math.floor(5000)) 
    retval += (question.length * 100) // add .25s per character

    return retval
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
