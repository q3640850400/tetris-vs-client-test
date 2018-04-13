"use strict"
var ws;
var state = 'wait';
var tetris_20 = null;
var socketState = false;
var others = ['none','none','none']//其他玩家id
var otherstates = new Map() //其他玩家状态
var maps = new Map()//其他玩家积木池
var flueid = parseInt(Math.random() * 1000000000).toString()
function caniget(st) {
  switch (st) {
    case 'state': { return state }
    case 'tetrris_20': { return tetris_20 }
    case 'others': { return others }
    case 'otherstates': { return otherstates }
    case 'maps': { return maps }
    default: { return }
  }
}
function setstate(st) {
  state = st
}
function update(map) {
  if (socketState === true) {
    var outmsg = { code: 'update', data: { flueid: flueid, map: map } }
    send(outmsg)
  }
}
function score(sc) {

}
function link() {
  wx.connectSocket({
    url: 'wss://luif.yxsvip.cn',
    header: { flueid: flueid }
  })
  wx.onSocketOpen(() => {
    console.log('已连接')
    socketState = true;
    var outmsg = { code: 'ready0' }
    send(outmsg)
  })
  wx.onSocketMessage((message) => {
    console.log(`[CLIENT]${message}`)
    var immsg = JSON.parse(message.data)
    switch (immsg.code) {
      case 'join': {
        console.log(`[CLIENT][${immsg.data}]进来了`)
        for (let i = 0; i < 3; i++) {
          if (others[i]!=='none') { others[i]=immsg.data; otherstates.set(immsg.data,'wait');break ;}
        }
        console.log(`[CLIENT]目前玩家:${others}`)
        break
      }
      case 'pool': {
        tetris_20 = immsg.data
        state = 'pool'
        var outmsg = { code: 'ready1' }
        send(outmsg)
        break
      }
      case 'start': {
        state = 'start'
        break
      }
      case 'update': {
        maps.set(immsg.data.flueid, immsg.data.map)
        otherstates.set(immsg.data.flueid, 'update')
        break
      }
      default: { break }
    }
  })
  wx.onSocketClose((close) => {
    socketState = false
  })

}
function join() {

}
function send(outmsg) {
  var msg = {
    data: JSON.stringify(outmsg)
  }
  wx.sendSocketMessage(msg)
}
module.exports = {
  link: link,
  join: join,
  score: score,
  update: update,
  send: send,
  caniget: caniget,
  setstate: setstate
}