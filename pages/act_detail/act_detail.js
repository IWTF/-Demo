// pages/act_detail/act_detail.js
var app = getApp();
var util = require('../../utils/util.js')
var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    activity: {},
    like: false,
    objId: '',
    likersUrl: [],
    options:{},
    like_num: 0,
    join_num: 0,
    joiner: '',
    page: Number,
    display: "none",
    windowHeight: wx.getSystemInfoSync().windowHeight,
    translate: '',
    collect: false,
    index: -1,
    userInfo: {},
    talk: []
  },
  onLoad: function (options) {

    var userInfo = app.globalData.userInfo;

    // 获得活动的Id，方便请求数据
    var objId = options.objectId;
    this.setData({
      objId: objId,
      options: options,
      page: options.page,
      userInfo: userInfo
    })

    var that = this;

    //获取评论信息
    var Diary = Bmob.Object.extend("talk");
    var query = new Bmob.Query(Diary);

    query.equalTo("name", this.data.activity.name);
    query.equalTo("userName", this.data.activity.userName);

    query.find({
      success: function (results) {
        var object = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i]);
        }
        that.setData({
          talk: object
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

    // 获取点赞情况
    var nickName = userInfo.nickName;
    var Diary = Bmob.Object.extend("likes");
    var query = new Bmob.Query(Diary);
    console.log(objId);
    query.equalTo("actId", objId);
    query.find({
      success: function (results) {
        var object = [];
        for (var i = 0; i < results.length; i++) {
          object = object.concat(results[i].attributes.avatarUrl);
          if(nickName == results[i].attributes.nickName)
          {
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
          activity: result.attributes
        })
        console.log('activity:',that.data.activity);
      },
    });

    //获取参加人数
    var Diary = Bmob.Object.extend("join");
    var query = new Bmob.Query(Diary);
    console.log(objId);
    query.equalTo("actId", objId);
    query.find({
      success: function (results) {
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

    if(this.data.like){
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
    }else{
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

  join: function(e){
    var that = this;

    var Diary = Bmob.Object.extend("join");
    var diary = new Diary();
    diary.set("joiner", e.detail.userInfo.nickName);
    diary.set("avatarUrl",e.detail.userInfo.avatarUrl);
    diary.set("imgUrl", this.data.activity.imgUrl);
    diary.set("date", this.data.activity.date);
    diary.set("place", this.data.activity.place);
    diary.set("name", this.data.activity.name);
    diary.set("actId", this.data.objId);
    
    diary.save(null, {
      success: function (result) {
        wx.showToast({
          title: '加入成功',
          icon: 'success',
          duration: 2000
        })
        that.onLoad(that.data.options);
      },
      error: function (result, error) {
        wx.showToast({
          title: '对不起，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

  collect: function(e){
    var that = this;
    var Diary = Bmob.Object.extend("collect");
    var diary = new Diary();
    diary.set("joiner", e.detail.userInfo.nickName);
    diary.set("avatarUrl", e.detail.userInfo.avatarUrl);
    diary.set("imgUrl", this.data.activity.imgUrl);
    diary.set("date", this.data.activity.date);
    diary.set("place", this.data.activity.place);
    diary.set("name", this.data.activity.name);
    diary.set("actId", this.data.objId);

    diary.save(null, {
      success: function (result) {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 2000
        })
        that.setData({
          collect: true
        })
      },
      error: function (result, error) {
        wx.showToast({
          title: '对不起，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },

// 会出现闪退的现象？？
  cancel_collect:function(e){
    var that = this;

    var query = new Bmob.Query('collect');
    query.equalTo("name", that.data.activity.name);
    query.equalTo("joiner", e.detail.userInfo.nickName);
    query.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      that.setData({
        collect: false
      })
    },function(error){
    });
  },

  cancel_join:function(e){
    var nickName = e.detail.userInfo.nickName;
    var name = this.data.activity.name;
    var that = this;

    var query = new Bmob.Query('join');
    query.equalTo("name", name);
    query.equalTo("joiner", nickName);
    query.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      wx.showToast({
        title: '成功退出该活动',
        icon: 'success',
        duration: 2000
      });

      wx.navigateBack({
        delta: 1      
      })
    }, function (error) {
      // 异常处理
    });
  },

  cancel_collect: function (e) {
    var nickName = e.detail.userInfo.nickName;
    var name = this.data.activity.name;
    var that = this;

    var query = new Bmob.Query('collect');
    query.equalTo("name", name);
    query.equalTo("joiner", nickName);
    query.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
        duration: 2000
      });

      wx.navigateBack({
        delta: 1
      })
    }, function (error) {
      // 异常处理
    });
  },

  talk: function(){
    this.setData({
      display: "block",
      translate: 'transform: translateY(-' + this.data.windowHeight * 0.3 + 'px);',
      index: 9999
    })
  },

  hideview: function(){
    this.setData({
      display: "none",
      translate: '',
      index: -1
    })
  },

  bindFormSubmit: function (e) {
    var that = this;
    var userInfo = this.data.userInfo;
    var nickName = userInfo.nickName;
    var avatarUrl = userInfo.avatarUrl;
    var content = e.detail.value.textarea;

    var Diary = Bmob.Object.extend("talk");
    var diary = new Diary();
    diary.set("nickName", nickName);
    diary.set("avatarUrl", avatarUrl);
    diary.set("content", content);
    diary.set("name", this.data.activity.name);
    diary.set("userName", this.data.activity.userName);

    diary.save(null, {
      success: function (result) {
        that.onLoad(that.data.options);
        wx.showToast({
          title: '评论成功',
          icon: 'success',
          duration: 2000
        });
      },
      error: function (result, error) {
        console.log('创建日记失败');
      }
    });

    this.setData({
      display: "none",
      translate: '',
      index: -1
    })
  },

  cancel: function(){
    this.setData({
      display: "none",
      translate: '',
      index: -1
    })
  }
})