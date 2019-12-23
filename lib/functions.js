const questions_file = require("../conf/questions.json")

var aQuestions = []
module.exports = {
  isNextEmoji: function(emoji) {
    var retval = false
    var nextEmojis = ["☑️","☑","✅","✔️","✔️","🗸","✔️","👍","👍🏻","👍🏼","👍🏽","👍🏾","👍🏿","👎","👎🏻","👎🏼","👎🏽","👎🏾","👎🏿",]
    
    for (var i in nextEmojis) {
      if (emoji == nextEmojis[i]) {
        retval = true
      }
    }
    return retval
  },
  getQuestion: function(channel, messages) {
    var numQ = 0
    var q 
    
    // push questions to global array
    for (var i in questions_file) {
      aQuestions.push(questions_file[i])
      numQ++
    }

    // get last n messages and find the most recent question
    if (messages) {
      var q = this.getLastQuestion(messages)
      var lastQ = q
      var nextQ = this.getNextQuestion(q)
      var qDetails = this.getQuestionDetails(q)

      if (nextQ) {
        //console.log("Next question should be: " + nextQ)
        if (q != nextQ) {
          q = nextQ
          q.lastQuestion = lastQ.content 
          q.lastQuestionDate = lastQ.createdTimestamp
          q.lastQuestionScore = qDetails.score
        } 
      } 
    }

    if (q) { return q }
  },
  getNextQuestion(q) {
    var qCnt = 0
    var qNext
    for (var i in questions_file) {
      var qf = questions_file[i]
      if (q == qf.question) {
        qNext = qCnt + 1
      }
      qCnt++
    }

    if (qNext) {
      var retQ = questions_file[qNext]
      if (retQ) { 
        return retQ 
      }
    }
  },
  getQuestionDetails(q) {
    // return details about a question based on its title
    var qCnt = 0
    for (var i in questions_file) {
      var qf = questions_file[i]
      if (q == qf.question) {
        qCnt = i
      }
    }
    if (qCnt) {
      var retQ = questions_file[qCnt]
      if (retQ) { 
        return retQ 
      }
    }
  },
  getLastQuestion(messages) {
    // go through last few messages and find the most recent question
    var annaQ = []
    var aMsg = messages.array()
    for (var i in aMsg) {
      var tmpMsg = aMsg[i]
      var tmpAuthor = tmpMsg.author.id

      if (tmpAuthor == "581973598302896254") {
        // anna asked a question
        annaQ.push(tmpMsg)
      }
    }

    if (annaQ) {
      if (annaQ[0]) {
        // return the first question in the array
        return annaQ[0]
      }
    }
  }
}