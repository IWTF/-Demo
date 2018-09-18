// pages/revise/revise.js
const util = require('../../utils/util.js');
var Bmob = require('../../utils/bmob.js');
var app = getApp();

Page({
  data: {
    index: 0,
    kind: [
      "其他", "运动", "游戏", "交友", "旅行", "读书", "竞赛", "电影", "音乐",
    ],
    dates: "2018-7-8",
    check: false,
    imgUrl: "",
    name: '',
    place: '',
    content: '',
    objId: ''
  },

  onLoad: function (options) {
    console.log("revise:",options);
    var index;
    for(var i = 0; i < 9; i++)
    {
      if(this.data.kind[i] == options.type)
      {
        index = i;
        break;
      }
    }

    this.setData({
      dates: util.formatTime(new Date()),
      dates: options.time,
      check: options.limit,
      name: options.name,
      place: options.place,
      content: options.content,
      num: options.num,
      imgUrl: options.imgUrl,
      index: index,
      objId: options.objId
    })
  },

  kind_change: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  time_change: function (e) {
    this.setData({
      dates: e.detail.value
    })
  },

  check_change: function (e) {
    this.setData({
      check: !this.data.check
    })
  },

  upload: function () {
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

  formSubmit: function (e) {
    let { name, typ, place, dates, limit, num, content } = e.detail.value;
    if (name == "" || place == "" || (limit == true && num == "") || content == "") {
      wx.showToast({
        title: '请把表单填写完整',
        icon: 'none',
        duration: 2000
      })
    }
    if (!limit) { num = '500'; }
    typ = this.data.kind[typ];
    if (dates == null) { dates = util.formatTime(new Date()); }
    var user = app.globalData.userInfo;

    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
    var id = this.data.objId;
    var img = this.data.imgUrl;
    console.log("imgUrlddddd:",img);

    query.get(id, {
      success: function (result) {
        result.set("userName", user.nickName);
        result.set("avatarImg", user.avatarUrl);
        result.set("name", name);
        result.set("typ", typ);
        result.set("place", place);
        result.set("date", dates);
        result.set("limit", limit);
        result.set("num", num);
        result.set("content", content);
        result.set("imgUrl", img);
        result.save();
        wx.showToast({
          title: '修改表单成功',
          icon: 'success',
          duration: 2000
        })
      },
      error: function (object, error) {
        console.log("error",error);
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

    wx.navigateBack({
      delta: 2
    })
  }
})