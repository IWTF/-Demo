// pages/suggestion/suggestion.js
var Bmob = require('../../utils/bmob.js'); 

Page({
  data: {
    userInfo: {},
    btn: "sdfds"
  },
  
  onLoad: function (options) {
    
  },

  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    this.setData({
      btn: "点我了"
    })

    var Diary = Bmob.Object.extend("likes");
    var query = new Bmob.Query(Diary);
   
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },
})