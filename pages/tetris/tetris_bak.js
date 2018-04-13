"use strict";
import GameView from './view.js'
require('../../lib/regenerator-runtime');
const regeneratorRuntime = global.regeneratorRuntime;// 引入 co 和 promisify 帮助我们进行异步处理
const co = require('../../lib/co');
const promisify = require('../../lib/promisify');
const wafer = require('../../vendors/wafer-client-sdk/index');// 引入 Wafer 客户端 SDK 支持会话
const Tunnel = require('../../lib/tunnel');// 简单的小程序 WebSocket 信道封装
const login = promisify(wafer.login);// 登录接口转成返回 Promise 形式
const app = getApp();// 获得小程序实例
const lab = require('../../lib/lab');// 用于记录实验成功
wafer.setLoginUrl(`https://${app.config.host}/login`);// 设置会话登录地址
var gv=new GameView()
var longtap = false
var ctx = wx.createCanvasContext('firstCanvas')
var player={
  name:"null",
  score:999,
  animal:0
}
// var gv=require("./view.js")
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
var dia, pos, bak, run, sd, cot;

Page({
  data:{
    connected: false,// 是否已经和服务器连接
    playing: false,// 游戏是否进行中
    gameInfo: "",// 当前需要展示的游戏信息
    t1:"me",
    t2:"you"
  },
  // 页面显示后，开始连接
  onShow: function () {
    this.begin();
  },
  onReady: function (e) {
    // console.log("1")
    // 使用 wx.createContext 获取绘图上下文 context
// console.log(gv)
    this.restart()
  },
  // 进行登录和链接，完成后开始启动游戏服务
  begin: co.wrap(function* () {
    try {
      this.setData({ gameInfo: "正在登陆" });
      yield login();

      this.setData({ gameInfo: "正在连接" });
      yield this.connect();
    } catch (error) {
      console.error('error on login or connect: ', error);
    }
    this.serve();
  }),
  // 链接到服务器后进行身份识别
  connect: co.wrap(function* () {
    const tunnel = this.tunnel = new Tunnel();
    try {
      yield tunnel.connect(`wss://${app.config.host}/tetris`, wafer.buildSessionHeader());
    } catch (connectError) {
      console.error({ connectError });
      this.setData({ gameInfo: "连接错误" });
      throw connectError;
    }
    tunnel.on('close', () => {
      this.setData({
        connected: false,
        gameInfo: "连接已中断"
      });
    });
    this.setData({
      gameInfo: "准备",
      connected: true,
      gameState: 'connected'
    });
    return new Promise((resolve, reject) => {
      // 10 秒后超时
      const timeout = setTimeout(() => reject, 10000);
      tunnel.on('id', ({ uname, uid, uavatar }) => {
        this.uid = uid;
        this.setData({
          myName: uname,
          myAvatar: uavatar
        });
        resolve(tunnel);
        clearTimeout(timeout);
      });
    });
  }),
  // 开始进行游戏服务
  serve: co.wrap(function* () {
    const tunnel = this.tunnel;
    tunnel.on('start', packet => {

    })
    // 服务器通知结果
    tunnel.on('result', packet => {

    })
  }),
  // 点击开始游戏按钮，发送加入游戏请求
  startGame: co.wrap(function* () {
    if (this.data.playing) return;
    if (!this.data.connected) return;

    this.setData({
      playing: false,
      done: false,
      finding: true,
      gameInfo: '正在寻找玩伴...'
    });
    this.tunnel.emit('join');
  }),
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
      if (map[0] != 0x801) return this.over();
      this.start();
    }
    this.update(0);
  },
  move(t, k) {
    pos.x += k;
    for (var i = 0; i < 4; i++)pos.fk[i] *= t;
    this.update(this.iscan());
    //console.log(cot, bak, pos)
  },
  over() {
    document.onkeydown = null;
    clearInterval(run);
    clearInterval(sd);

    //alert("GAME OVER");
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
    //this.gameinfo = new GameInfo()
    //this.music = new Music()

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
    ctx.draw()
  }
})