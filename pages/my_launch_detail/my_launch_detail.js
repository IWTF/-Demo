// pages/my_launch_detail/my_launch_detail.js
var app = getApp();
var util = require('../../utils/util.js')
var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    activity: {},
    like: false,
    objId: '',
    likersUrl: [],
    options: {},
    like_num: 0,
    join_num: 0,
    joiner: ''
  },
  onLoad: function (options) {
    // 获得活动的Id，方便请求数据
    var objId = options.objectId;
    this.setData({
      objId: objId,
      options: options
    })

    var that = this;
    console.log("objectId:", this.data.objId);

    // 获取点赞情况
    var Diary = Bmob.Object.extend("likes");
    var query = new Bmob.Query(Diary);
    console.log(objId);
    query.equalTo("actId", objId);
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        var object = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i].attributes.avatarUrl);
          if (app.globalData.userInfo.nickName == results[i].attributes.nickName) {
            that.setData({
              like: true
            })
          }
        }
        that.setData({
          likersUrl: object,
          like_num: results.length
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

    // 获取活动内容
    var Diary = Bmob.Object.extend("activity");
    var query = new Bmob.Query(Diary);
    query.get(objId, {
      success: function (result) {
        that.setData({
          activity: result.attributes,
        })
        console.log('activity:', that.data.activity);
      },
    });

    //获取参加人数
    var Diary = Bmob.Object.extend("join");
    var query = new Bmob.Query(Diary);
    console.log(objId);
    query.equalTo("actId", objId);
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        var object = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i].attributes.avatarUrl);
        }
        that.setData({
          joiner: object,
          join_num: results.length
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },

  onGotUserInfo: function (e) {
    // 改变图标
    this.setData({
      like: !this.data.like
    })

    console.log(e.detail.userInfo)
    var that = this;
    var name = e.detail.userInfo.nickName;
    var imgUrl = e.detail.userInfo.avatarUrl;

    var Diary = Bmob.Object.extend("likes");
    var diary = new Diary();

    if (this.data.like) {
      // 将点赞数据上传
      diary.set("actId", that.data.objId);
      diary.set("nickName", name);
      diary.set("avatarUrl", imgUrl);

      diary.save(null, {
        success: function (result) {
          that.onLoad(that.data.options);
        },
        error: function (result, error) {
          console.log('创建日记失败');
        }
      });
    } else {
      //删除点赞人的信息
      var query = new Bmob.Query('likes');
      query.equalTo("nickName", name);
      query.find().then(function (todos) {
        return Bmob.Object.destroyAll(todos);
      }).then(function (todos) {
        that.onLoad(that.data.options);
      }, function (error) {
      });
    }
  },

  del: function (e) {
    var userInfo = app.globalData.userInfo;
    var name = this.data.activity.name;
    var that = this;

    var query = new Bmob.Query('activity');
    query.equalTo("userName", userInfo.nickName);
    query.equalTo("name", name);
    query.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 2000
      });
      wx.navigateBack({
        delta: 1
      })
    }, function (error) {
    });
  },

})