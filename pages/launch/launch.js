// pages/launch/launch.js
const util = require('../../utils/util.js');
var Bmob = require('../../utils/bmob.js'); 
var app = getApp();

Page({
  data: {
    index: 0,
    kind: [
      "其他","运动","游戏","交友","旅行","读书","竞赛","电影","音乐",
    ],
    dates: "2018-7-8",
    check: false,
    imgUrl:"",
    name: '',
    place: '',
    content: ''
  },

  onLoad:function(options){
    this.setData({
      dates: util.formatTime(new Date())
    })
  },

  kind_change:function(e){
    this.setData({
      index: e.detail.value
    })
  },

  time_change:function(e){
    this.setData({
      dates: e.detail.value
    })
  },

  check_change:function(e){
    this.setData({
      check: !this.data.check
    })
  },

  upload:function(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length > 0) {
          var name = "1.jpg";//上传的图片的别名，建议可以用日期命名
          var file = new Bmob.File(name, tempFilePaths);
          file.save().then(function (res) {
            that.setData({
              imgUrl: res.url()
            })
            console.log(that.data.imgUrl)
          }, function (error) {
            console.log(error);
          })
        }
      }
    })
  },

  cancel: function(){
    this.setData({
      imgUrl: ""
    })
  },

  formSubmit: function (e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let {name,typ,place,dates,limit,num,content} = e.detail.value;
    if(name == "" || place == "" || (limit == true && num == "") || content == ""){
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    }else{
      if (!limit) { num = '500'; }
      typ = this.data.kind[typ];
      if (dates == null) { dates = util.formatTime(new Date()); }
      var user = app.globalData.userInfo;

      var Diary = Bmob.Object.extend("activity");
      var diary = new Diary();
      var activity = {};

      diary.set("userName", user.nickName);
      diary.set("avatarImg", user.avatarUrl);
      diary.set("name", name);
      diary.set("typ", typ);
      diary.set("place", place);
      diary.set("date", dates);
      diary.set("limit", limit);
      diary.set("num", num);
      diary.set("content", content);
      diary.set("imgUrl", this.data.imgUrl);
      diary.save(null, {
        success: function (result) {
          console.log("日记创建成功, objectId:" + result.id);
          wx.showToast({
            title: '创建活动成功',
            icon: 'success',
            duration: 2000
          })
          // 重新设置缓存
          that.strotage();
        },
        error: function (result, error) {
          console.log(error);
          wx.showToast({
            title: '请检查数据',
            icon: 'none',
            duration: 2000
          })
        }
      });

      this.setData({
        imgUrl: '',
        name: '',
        place: '',
        index: 0,
        dates: util.formatTime(new Date()),
        content: ''
      })

      if (limit) {
        this.setData({
          check: false
        })
      }
    }
  },

  strotage: function()
  {
    var that = this;

    var arr = []; var arrTime = []; var id = [];
    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
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
        wx.setStorage({
          key: 'activity',
          data: arr,
        })
        wx.setStorage({
          key: 'arrTime',
          data: arrTime,
        })
        wx.setStorage({
          key: 'id',
          data: id,
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  }
})