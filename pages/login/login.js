//index.js
//获取应用实例
const app = getApp()
var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    motto: '约 吧',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.switchTab({
      url: '../home/home',
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.userInfo);
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    console.log(e.detail.userInfo)
    var user = e.detail.userInfo;

    var Diary = Bmob.Object.extend("user");
    var diary = new Diary();
    diary.set("name", user.nickName);
    diary.set("gender", user.gender);
    diary.set("avatar", user.avatarUrl);
    diary.save(null, {
      success: function (result) {
        console.log("日记创建成功, objectId:" + result.id);
      },
      error: function (result, error) {
        console.log('创建日记失败');
      }
    });
  }
})