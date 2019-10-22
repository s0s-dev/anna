var anna = function () {}

const fs = require('fs')

// puased channels (probably shouldn't be an array)
var paused_channels = ["0"]

anna.prototype.pause = function(channel_name) {
  paused_channels.push(channel_name)
}

anna.prototype.resume = function(chan) {
  if (paused_channels) {
    for (var i = 0; i < paused_channels.length; i++) {
      console.log(paused_channels[i])
      if (chan == paused_channels[i]) {
        paused_channels.splice(i-1,2)
      }
    }
  console.log(paused_channels)
  }
}

anna.prototype.isPaused = function(chan) {
  var retVal = false
  for (var i in paused_channels) {
    if (paused_channels[i] == chan) {
      retVal = true
    }
  }
  return retVal
}

anna.prototype.logChan = function(chan) {
  fs.appendFile("./conf/channels.txt", chan + "\n", (err) => {
    if (err) throw err;
    console.log("Channel saved");
  })
}

module.exports = anna