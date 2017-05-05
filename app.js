//app.js
import { createStore, combineReducers } from './lib/redux.min'
import reducers from './reducers'
const Store = createStore(combineReducers(reducers))

App({
  Store,
  onLaunch: function () {
  },
  getSession: function () {
    let that = this
    if (this.globalData.third_session) {
      return this.globalData.third_session;
    }
    else {
      try {
        var value = wx.getStorageSync('third_session')
        if (value) {
          that.globalData.third_session = value
          return value
        }
        else {
          return '';
        }
      } catch (e) {
        return '';
      }
    }
  },
  //0为未注册 1为登录成功 -1为登录失败
  login: function (cb) {
    let that = this;
    wx.login({
      success: function (res) {
        wx.getUserInfo({
          success: function (res) {
            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(that.globalData.userInfo)
          }
        })
        that.requestSession(res.code, function (status) {
          if (cb) cb(status)
        });
      },
      fail: function () {
        if (cb) {
          cb(-1)
        }
      },
    })
  },
  requestSession: function (code, cb) {
    let that = this;
    wx.request({
      url: that.globalData.host + 'index.php/Xcx/Date/getSession',
      data: { "code": code },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 1) //注册了
        {
          that.globalData.third_session = res.data.data.third_session;
          wx.setStorage({
            key: 'third_session',
            data: res.data.data.third_session,
          })
          if (cb) cb(1)
        }
        else  //未注册
        {
          that.globalData.third_session = res.data.data.third_session;
          wx.setStorage({
            key: 'third_session',
            data: res.data.data.third_session,
          })
          if (cb) cb(0)
        }
      },
      fail: function () {
        if (cb) cb(-1);
      },
    })
  },
  request(param) {
    let that = this
    var _data = param.data
    let _url = param.url
    let _success = param.success
    let _cmp = param.cmp
    let session = this.getSession();
    _data["third_session"] = session

    wx.request({
      url: that.globalData.host + _url,
      data: _data,
      method: 'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.status == 1) {
          if (_success) _success(res.data.data)
        }
        else if (res.data.status == -1) {
          console.log("错误信息是" + res.data.msg)
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          });
        }
        else if (res.data.status == -12) {
          if (!that.globalData.hasDirectToRigister) {
            wx.redirectTo({
              url: '../register/register',
            })
            that.globalData.hasDirectToRigister = true
          }
        }
        else if (res.data.status == -10 || res.data.status == -11) { //没有登录
          console.log("登录期已过")
          that.login(function (status) {
            if (status == -1) {
              console.log("重新登录失败")
              wx.showModal({
                title: '错误',
                content: '微信授权登录失败',
                showCancel: false
              });
            }
            else {
              console.log("重新登录，需要继续的操作是" + _url)
              that.request(param)
            }
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '警告',
          content: '网络请求失败',
          showCancel: false
        });
      },
      complete: function (e) {
        if (_cmp) {
          _cmp(e);
        }
      }

    })
  },
  globalData: {
    userInfo: null,
    third_session: '',
    hasDirectToRigister: false,
    //常量
    // host: "http://192.183.3.91/tpcluster/",
    host: "https://weiapp.doyoteam.com/justin/",
    // host:"https://118.178.185.211/justin/"
  }
})