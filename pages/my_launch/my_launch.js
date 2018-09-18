// pages/my_launch/my_launch.js
var app = getApp();
var Bmob = require('../../utils/bmob.js'); 

Page({
  data: {
    userInfo: {},
    activity:[],
    id: [],
    options: {}
  },
  onLoad: function (options) {
    var that = this;
    var userInfo = app.globalData.userInfo;
    this.setData({
      userInfo: userInfo,
      options: options
    })

    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
   
    query.equalTo("userName", userInfo.nickName);
    query.find({
      success: function (results) {
        var object = [];
        var id = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i].attributes);
          id = id.concat(results[i].id);
        }
        that.setData({
          activity: object,
          id: id
        })
      },
    });
  },

  onShow: function(){
    this.onLoad(this.data.options);
  }
})