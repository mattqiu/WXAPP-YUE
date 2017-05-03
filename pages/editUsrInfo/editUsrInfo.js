var app = getApp()
Page({
  data: {
    inputInfo: {},
    office: ['中心领导','技术部', '运营部', '产品部', '综合部', "视觉中心"],
    officeIdx: 0,
  },
  onLoad: function (options) {
    this.requestUsrInfo();
  },

  //bindMethod
  bindInputValChange: function (e) {
    var param = this.data.inputInfo;
    param[e.currentTarget.id] = e.detail.value;
    this.setData({
      inputInfo: param,
    });
  },
  bindPickerChange(e) {
    this.setData({
      officeIdx: e.detail.value
    })
  },
  tapSaveInfo: function (e) {
    let that = this;
    this.requestSaveInfo(function (success) {
      if (success) {
        setTimeout(function () {
          that.goBack();
        }, 1000);
      }
    });
  },

  //private
  goBack: function (e) {
    var util = require('../../utils/util.js')
    util.dispatchRefreshParam("usrInfo")
    wx.navigateBack({
      delta: 1,
    })
  },
  //网络访问
  requestUsrInfo: function (e) {
    let that = this;
    let _url = 'index.php/Xcx/Date/getUserinfo'
    let _data = {}
    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        var param = {};
        param.name = result.myUserinfo.name
        param.tel = result.myUserinfo.mobile
        param.avatar = result.myUserinfo.headimgurl
        var departMent = result.myUserinfo.department
        let currIdx = 0;
        for (var i = 0; i < that.data.office.length; i++) {
          if (that.data.office[i] == departMent) {
            currIdx = i;
          }
        }
        that.setData({
          officeIdx: currIdx,
          inputInfo: param,
        })
      }
    })
  },
  requestSaveInfo: function (cb) {
    let that = this;
    let name = that.data.inputInfo.name;
    let tel = that.data.inputInfo.tel;
    let departMent = that.data.office[that.data.officeIdx];
    var util = require('../../utils/util.js');
    if (!util.isPhone(tel)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号码',
        showCancel: false,

      })
      return;
    }
    if (util.isEmpty(name)) {
      wx.showModal({
        title: '提示',
        content: '请输入姓名',
        showCancel: false,
      })
      return;
    }
    let _url = 'index.php/Xcx/Date/saveUserInfo'
    let _data = {
      "department": departMent,
      "name": name,
      "mobile": tel
    }
    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 1000
        })
        if (cb) {
          cb(true);
        }
      }
    })
  },

})