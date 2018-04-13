"use strict"
var ws;
var state = 'wait';
var tetris_20 = null;
var socketState = false;
var emptyseat = new Set([1, 2, 3])
var Room = new Map()
// var others = ['none','none','none']//其他玩家id
// var otherstates = new Map() //其他玩家状态
// var maps = new Map()//其他玩家积木池
var flueid = parseInt(Math.random() * 1000000000).toString()
function caniget(st) {
  switch (st) {
    case 'state': { return state }
    case 'tetrris_20': { return tetris_20 }
    case 'Room': { return Room }
    // case 'others': { return others }
    // case 'otherstates': { return otherstates }
    // case 'maps': { return maps }
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
    header: { flueid: flueid,gamers:2 }
  })
  wx.onSocketOpen(() => {
    console.log('已连接')
    socketState = true;
    var outmsg = { code: 'ready0' }
    send(outmsg)
  })
  wx.onSocketMessage((message) => {
    var immsg = JSON.parse(message.data)
    console.log(immsg)
    switch (immsg.code) {
      case 'join': {
        console.log(`[CLIENT][${immsg.data}]进来了`)
        var player = {
          flueid: immsg.data,//玩家号
          seat: null,
          map: null,//当前的积木池
          score: null,//分数
          state: 'wait'//状态
        }
        emptyseat.forEach((key) => { player.seat = key; emptyseat.delete(key); return; })
        Room.set(player.flueid, player)
        player = null
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
        Room[immsg.data.flueid].map = immsg.data.map
        Room[immsg.data.flueid].state = 'update'
        break
      }
      default: { break }
    }
  })
  wx.onSocketClose((close) => {
    socketState = false
    console.log('连接丢失')
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