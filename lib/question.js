const discord = require('discord.js')
const timer_lib = require("timer")

module.exports = {
  findQuestionByName: function(question) {
    console.log("Matching: ")
    console.log(question)
    for (var i in questions_file) {
      var q = questions_file[i]
      
      if (q.question == question) {
        console.log("ID Matches: " + i) 
        return q
      }
    }
  },
  askQuestion: function(channel, question = "How are you?") {
    loadChannelLog(channel)

    console.log("Asking " + question + " in " + channel.name)
    var timer = timer_lib.setTimer(channel, question)

    //console.log(channel_log)
  },
  getNextQuestion: function(channel) {
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
  },
  loadChannelLog: function(channel) {
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
}

  