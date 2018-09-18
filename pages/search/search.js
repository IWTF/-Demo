var Bmob = require('../../utils/bmob.js'); 
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var app = getApp();

Page({

  data: {
    userInfo:{},
    hot: [],
    mate: [],
    activity: [],
    nowDate: []
  },


  onLoad: function () {
    var user = app.globalData.userInfo;
    this.setData({
      userInfo: user
    })

    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);

    var hot = [];
    var activity = [];
    var arrTime = [];
    var that = this;


    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          hot = hot.concat(results[i].attributes.name);
          activity = activity.concat(results[i].attributes);
          arrTime = arrTime.concat(results[i].updatedAt);
          activity[i].id = results[i].id;
        }
        that.setData({
          hot: hot,
          mate: hot,
          activity: activity,
          nowDate: arrTime
        })

        // 2 搜索栏初始化
        WxSearch.init(
          that,  // 本页面一个引用
          that.data.hot, // 热点搜索推荐，[]表示不使用
          that.data.hot,// 搜索匹配，[]表示不使用
          that.mySearchFunction, // 提供一个搜索回调函数
          that.myGobackFunction //提供一个返回回调函数
        );
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },

  // 3 转发函数，固定部分，直接拷贝即可
  wxSearchInput: WxSearch.wxSearchInput,  // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  // 点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, // 删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear,  // 清空函数

  // 4 搜索回调函数  
  mySearchFunction: function (value) {
    var obj = {};
    var flag;
    for(var i = 0; i < this.data.activity.length; i++)
    {
      if (this.data.activity[i].name == value)
      {
        obj = this.data.activity[i];
        flag = i;
      }
    }
    this.data.activity.splice(flag,1);
    this.data.activity.unshift(obj);
    this.setData({
      activity: this.data.activity
    })
  },

  // 5 返回回调函数
  myGobackFunction: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  onShow: function () {
    this.onLoad();
  },

})