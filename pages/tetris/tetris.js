"use strict";
import GameView from './view.js'
const contact = require('./contact.js')
const app = getApp();// 获得小程序实例
var gv = new GameView()
var longtap = false
var ctx = wx.createCanvasContext('firstCanvas')
var player = {
  name: "null",
  score: 0,
  animal: 0
}
//地图
var map = new Array(21)
for (let i = 0; i < 20; i++) {
  map[i] = 0x801
}
map[20] = 0xfff
var color = new Array(21)
for (let i = 0; i < 21; i++) {
  color[i] = new Array(12)
  for (let j = 0; j < 12; j++) {
    color[i][j] = 2
  }
}
//俄罗斯方块OISZLJT
var tetris = [[0x0660], [0x2222, 0xf00], [0xc600, 0x2640], [0x6c00, 0x4620], [0x4460, 0x2e0, 0x6220, 0x740], [0x2260, 0xe20, 0x6440, 0x4700], [0x2620, 0x720, 0x2320, 0x2700]]
var dia, pos, bak, run, sd, cot, che, tetris_20; //timecounter and something else

Page({
  data: {
  },
  readybtn: function () {
    contact.link()
  },
  check: function () {
    var st = contact.caniget('state')
    switch (st) {
      case 'wait': { break }
      case 'pool': { tetris_20 = contact.tetris_20; contact.setstate('wait');break; }
      case 'start': { clearInterval(che); this.restart(); contact.setstate('wait'); break; }
      default: { break }
    }
  },
  onReady: function (e) {
    // this.restart()
    che = setInterval(this.check.bind(this), 1000)
  },
  start() {
    cot = ~~(Math.random() * 7)
    dia = tetris[cot];
    pos = { fk: [], y: 0, x: 4, s: ~~(Math.random() * 4) };
    bak = { fk: pos.fk.slice(0), y: pos.y, x: pos.x, s: pos.s }
    this.rotate(0);
  },
  iscan() {
    for (var i = 0; i < 4; i++)
      if ((pos.fk[i] & map[pos.y + i]) != 0) { console.log('hit!'); return (pos = bak); }
  },
  rotate(r) {
    var f = dia[pos.s = (pos.s + r) % dia.length];
    for (var i = 0; i < 4; i++) {
      pos.fk[i] = (((f >> ((4 - i - 1) * 4)) & 15) << (8 - pos.x));
    }
    this.update(this.iscan());
  },
  straightdown() {
    if (longtap) {
      this.down()
    }
  },
  down() {
    ++pos.y;
    if (this.iscan()) {
      for (var i = 0; (i < 4) && ((pos.y + i) < 20); i++) {
        if ((map[pos.y + i] |= pos.fk[i]) == 0xfff) {
          map.splice(pos.y + i, 1)
          map.unshift(0x801)
        }
      }
      contact.update(map);
      if (map[0] != 0x801) return this.over();
      this.start();
    }
    this.update(0);
  },
  move(t, k) {
    pos.x += k;
    for (var i = 0; i < 4; i++)pos.fk[i] *= t;
    this.update(this.iscan());
  },
  over() {
    document.onkeydown = null;
    clearInterval(run);
    clearInterval(sd);

  },
  update(t) {
    bak = { fk: pos.fk.slice(0), y: pos.y, x: pos.x, s: pos.s }
    if (t) return;
    this.render()
  },
  left() {
    console.log('left!')
    this.move(2, -1)
  },
  right() {
    console.log('right!')
    this.move(0.5, 1)
  },
  up() {
    console.log('up!')
  },
  turn() {
    this.rotate(1)
    console.log('turn!')
  },
  restart() {
    longtap = false
    this.start();
    // run = setInterval(this.down.bind(this), 5000);
    sd = setInterval(this.straightdown.bind(this), 100);
    /*window.requestAnimationFrame(
      this.loop.bind(this),
      canvas
    )*/
  },
  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, 200, 500)
    // ctx.drawImage('../images/tetris.png',0,0,100,100)

    //gv.test()
    gv.renderBackGround(ctx)
    gv.renderGameScore(ctx, player.score)
    gv.renderTetris(ctx, cot, bak)
    gv.renderTetrispool(ctx, map, color)
    var otherstates = contact.caniget('otherstates')
    otherstates.forEach((val,key)=>{
      if (val === 'update') { gv.renderOthers(ctx, (contact.caniget('maps'))[key], color)}
    })
    // gv.renderOthers(ctx, map, color)
    ctx.draw()
    
  }
})