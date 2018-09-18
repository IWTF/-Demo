//logs.js
const util = require('../../utils/util.js')
var Bmob = require('../../utils/bmob.js'); 
var app = getApp();
var start_clientX;
var end_clientX;
var len = 3;
var count = 1;

Page({
  data: {
    userInfo:{},
    windowWidth: wx.getSystemInfoSync().windowWidth,
    activity:[],
    nowDate: [],
    id: [],
    image: [
      '/images/sls.png',
      '/images/vr.png',
      '/images/xiaolong.jpg'
    ]
  },

  onLoad: function (options) {
    var user = app.globalData.userInfo;
    this.setData({
      userInfo: user
    })
    var that = this;

    var arr = [];  var arrTime = []; var id = [];
    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          // if(i > len)
          //   break;
          var obj = results[i];
          arr = arr.concat(obj.attributes);
          arrTime = arrTime.concat(obj.updatedAt)
          id = id.concat(obj.id)
        }
        that.setData({
          activity: arr,
          nowDate: arrTime,
          id: id
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  onShow: function(){
    this.onLoad();
  },

  change:function(){
    wx.navigateTo({
      url: '/pages/search/search',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  
  touchend: function (e) {
    end_clientX = e.changedTouches[0].clientX;
    if (end_clientX - start_clientX > 120) {
      this.setData({
        display: "block",
        translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
      })
    } else if (start_clientX - end_clientX > 0) {
      this.setData({
        display: "none",
        translate: ''
      })
    }
  },

  touchstart: function (e) {
    start_clientX = e.changedTouches[0].clientX
  },

  showview: function () {
    this.setData({
      display: "block",
      translate: 'transform: translateX(' + this.data.windowWidth * 0.7 + 'px);'
    })
  },

  hideview: function () {
    this.setData({
      display: "none",
      translate: '',
    })
  }
})