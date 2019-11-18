var timers = []

module.exports = {
	resetTimer: function(channel) {
    this.clearTimer(channel)
    this.setTimer(channel,this.variableReward())
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
          channel.send(question) 
      }
    },this.variableReward(question))
    timer.timer = tmpTimer
    timer.channel = channel.id
    timers.push(timer)

    return timer
  },
  variableReward: function(question = "") {
    var retval = Math.floor(Math.random() * Math.floor(5000)) 
    retval += (question.length * 50) // add .5s per character

    return retval
  }
}