// pages/collect/collect.js
var app = getApp();
var Bmob = require('../../utils/bmob.js');
const util = require('../../utils/util.js');

Page({

  data: {
    userInfo: {},
    activity: [],
    startX: 0, //开始坐标
    startY: 0,
    now: '',
    options: {}
  },

  onLoad: function (options) {
    var that = this;
    var userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo,
      now: util.formatTime(new Date()),
      options: options
    })

    var Diary = Bmob.Object.extend("collect");
    var query = new Bmob.Query(Diary);

    query.equalTo("joiner", userInfo.nickName);
    query.find({
      success: function (results) {
        var object = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i].attributes);
          object.isTouchMove = false;
        }
        that.setData({
          activity: object,
        })
      },
    });
  },

  onShow: function () {
    console.log("onShow excute");
    this.onLoad(this.data.options);
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.activity.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    console.log("touched1", this.data.activity);
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      activity: this.data.activity
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.activity.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      activity: that.data.activity
    })
    console.log("touched2", this.data.activity);
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    // 删除数据库的数据
    var that = this;
    var name = this.data.activity[e.currentTarget.dataset.index].name;

    var query = new Bmob.Query('collect');
    query.equalTo("name", name);
    query.equalTo("joiner", that.data.userInfo.nickName);
    query.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      that.setData({
        activity: that.data.activity
      })
    }, function (error) {
      // 异常处理
    });

    //删除本地数组中的数据
    this.data.activity.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      activity: this.data.activity
    })
  }
})