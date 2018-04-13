"use strict"
var ws;
var state = 'wait';
var tetris_20 = null;
function update() {

}
function score(sc) {

}
function link() {
  wx.connectSocket({
    url: 'wss://luif.yxsvip.cn',
    header: { flueid: parseInt(Math.random() * 1000000000).toString() }
  })
  wx.onSocketOpen(() => {
    console.log('已连接')
    var outmsg = { code: 'ready0' }
    send(outmsg)
  })
  wx.onSocketMessage((message) => {
    console.log(message)
    var immsg = JSON.parse(message.data)
    switch (immsg.code) {
      case 'pool': {
        tetris_20 = immsg.data
        state = 'pool'
        var outmsg = { code: 'ready1' }
        send(outmsg)
        break
      }
      case 'start': {
        break
      }
      default: { break }
    }
  })
  wx.onSocketClose((close) => {

  })
  
}
function join() {

}
function send(outmsg) {
  var msg={
    data:JSON.stringify(outmsg)
  }
  wx.sendSocketMessage(msg)
}
module.exports = {
  state: state,
  link: link,
  join: join,
  score: score,
  update: update,
  send: send,
  tetris_20: tetris_20
}