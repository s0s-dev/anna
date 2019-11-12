var timers = []

module.exports = {
	resetTimer: function(channel) {
    clearTimer(channel)
    setTimer(channel,variableReward())
  },
  clearTimer: function(channel) {
    console.log("Clearing the timer for " + channel.id)
    for (var i in timers) {
      var tmpTimer = timers[i]
      if (tmpTimer.channel == channel.id) {
        clearTimeout(tmpTimer.timer)

        // remove it from the array
        timers.splice(i,1)
      }
    }
  },
  setTimer: function(channel,question = "") {
    var timer = {}
    var tmpTimer = setTimeout(function() { 
      if (question != "") { 
          // only save a log of it if the question is actually sent
          var log = {}
          log.channel = channel.id
          log.question = question
          log.date = Date.now()

          anna.insertDataMongo(log,"anna","channels")
          channel.send(question) // shhh
      }
    },variableReward(question))
    timer.timer = tmpTimer
    timer.channel = channel.id
    timers.push(timer)

    return timer
  }
}