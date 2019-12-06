var dev = process.env.DEV || false

const mailer = require('nodemailer')
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

var tmp_token
if (bot_secret) {
  tmp_token = bot_secret.bot_secret_token
}
var discord_token = process.env.BOT_SECRET || tmp_token

client.on('ready', () => {

  anna.log("Connected as " + client.user.tag)
  anna.name("Anna")

  var nowPlayingText = "20 Questions" 
  client.user.setActivity(nowPlayingText)

  loadChannel("652301628577284126","19198273185")
})

var transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: bot_secret.email_address,
    pass: bot_secret.email_password
  }
})


function loadChannel(channel_id = "", channel_name="") {
  var query = { }
	if (channel_id) { query.channel_id = channel_id }
  if (channel_name) { query.channel = channel_name }

  console.log(query)

  var formatting = { date:1,user:1,text:1, _id:0}
  formatting = {}

	var initializePromise = anna.getDataMongo("discord","messages",query,formatting)
  initializePromise.then(function(result) {
      res = result
      console.log("Executed query")
      parseAnna(res)

      return result
      resolve(result)
  }, function(err) {
      console.log(err);
  })
}

function parseAnna(result) {
  var regex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

  var firstMsg, lastMsg,email
  var firstMsgFound = false
  for (var i in result) {
    var tmp = result[i]

    email = tmp.message.match(regex)
    if (email) {
      email = email[0]
      console.log(email)
    }

    if (!(firstMsgFound)) {
      var name = tmp.author
      if (name) {
        name = name.toLowerCase()
        if (name.startsWith("anna")) {
          firstMsg = i
          firstMsgFound = true
        }
      }
    }

    if (name.startsWith("anna")) {
      lastMsg = i
    }

    lastMsg++
  }

  if (firstMsg) {
    //console.log(result)
    console.log(firstMsg)
    console.log(lastMsg)

    var final = []
    
    for (var i = firstMsg; i < lastMsg; i++) {
      var tmp = result[i]

      if (tmp.author.toLowerCase().startsWith("anna")) {
        // console.log(tmp.author) 
        tmp.message = "> " + tmp.message
      }

      final.push(tmp.message)
    }
  } else {
    console.log("No messages from Anna found")
  }

  if (final) {
    var txt = ""
    for (var i = 0; i < final.length; i++) {
      txt += final[i] + "\n"
    }

    var mailOptions = {
      from: 'adunderwood@gmail.com',
      to: email,
      subject: 'Info provided to $O$',
      text: txt
    }

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    })

    console.log(final)
  }
}

client.login(discord_token)