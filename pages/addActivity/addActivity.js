const app = getApp();
Page({
  data: {
    inputInfo: {},
    currDate: "",
    winH: 0,
    addrDetail: '',
    addrName: '',
    focusLocation: false,
    addDisable: false,
    allowUpload: false,
    normalRun: true,
    isPublic: true,

    actId: 0,

    openMoreOption: false,
  },
  onLoad: function (options) {
    let that = this
    var util = require('../../utils/util.js')
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winH: res.windowHeight,
        })
      }
    })
    let date = new Date();
    let currDate = util.formatTimeB(date)
    var _inputInfo = {}
    if (options.actInfo) {  //编辑模式
      var detailInfo = JSON.parse(options.actInfo)

      _inputInfo["lng"] = detailInfo.lng
      _inputInfo["lat"] = detailInfo.lat
      _inputInfo["address"] = detailInfo.address
      _inputInfo["remark"] = detailInfo.remark
      _inputInfo["title"] = detailInfo.title
      var deadLineTimeArr = detailInfo.end_datetime.split(" ")
      var startTimeArr = detailInfo.start_datetime.split(" ")
      var endTimeArr = detailInfo.stop_datetime.split(" ")
      var _isPublic = detailInfo.publicstatus == 0 ? true : false
      var _normalRun = detailInfo.is_justin == 0 ? true : false
      var _canupload = detailInfo.canupload == 1 ? true : false
      var addrArr = detailInfo.address.split("\n")
      let _addrName
      if (addrArr.length <= 1) {
        _addrName = detailInfo.address
      }
      else {
        _addrName = addrArr[1]
      }
      _inputInfo["deadlineDate"] = deadLineTimeArr[0]
      _inputInfo["deadlineTime"] = deadLineTimeArr[1]
      _inputInfo["startDate"] = startTimeArr[0]
      _inputInfo["startTime"] = startTimeArr[1]
      _inputInfo["endDate"] = endTimeArr[0]
      _inputInfo["endTime"] = endTimeArr[1]
      that.setData({
        actId: detailInfo.acid,
        addrName: _addrName,
        isPublic: _isPublic,
        normalRun: _normalRun,
        allowUpload: _canupload,
      })
      wx.setNavigationBarTitle({
        title: '编辑活动',
      })
    }
    else {   //新增模式
      let currTime = util.timeWithZero(date.getHours()) + ':00'
      let startDate = util.timePlusHours(currDate, currTime, 1); //加上1个小时
      let endDate = util.timePlusHours(currDate, currTime, 2); //加上2个小时
      let deadLine = util.timePlusHours(currDate, currTime, 1); //加上2个小时

      _inputInfo["startDate"] = startDate.days;
      _inputInfo["startTime"] = startDate.hours;
      _inputInfo["deadlineDate"] = deadLine.days;
      _inputInfo["deadlineTime"] = deadLine.hours;
      _inputInfo["endDate"] = endDate.days;
      _inputInfo["endTime"] = endDate.hours;
    }
    this.setData({
      inputInfo: _inputInfo,
      currDate: currDate,
    });
  },


  //bindMethod

  tapMoreOptions: function (e) {
    let that = this
    this.setData({
      openMoreOption: !that.data.openMoreOption
    })
  },
  bindPickerValChange: function (e) {
    var param = this.data.inputInfo;
    let paramName = e.currentTarget.id;
    param[paramName] = e.detail.value;

    var util = require('../../utils/util.js');
    let startDay = param["startDate"]
    let startHours = param["startTime"]
    let endDay = param["endDate"]
    let endHours = param["endTime"]

    if (util.calTimeStamp(startDay, startHours) >= util.calTimeStamp(endDay, endHours)) { //如果结束时间小于等于开始时间
      var endDate = util.timePlusHours(startDay, startHours, 2); //加上两个小时
      param["endDate"] = endDate.days;
      param["endTime"] = endDate.hours;
    }
    if (e.currentTarget.id == "address") {
      param["lat"] = "";
      param["lng"] = "";

    }
    this.setData({
      inputInfo: param,
    });
  },
  bindCheckValChange: function (e) {
    if (e.currentTarget.id == "allowUpload") {
      this.setData({
        allowUpload: e.detail.value,
      })
    }
    else if (e.currentTarget.id == "normalRun") {
      this.setData({
        normalRun: e.detail.value,
      })
    }
    else if (e.currentTarget.id == "isPublic") {
      this.setData({
        isPublic: e.detail.value,
      })
    }
  },
  bindTapPostBtn: function (e) {
    if (this.data.addDisable) {
      console.log("点击了两次")
      return
    }
    let that = this;
    var util = require('../../utils/util.js');
    var input = this.data.inputInfo;
    let _title = input.title;
    let _deadline = input.deadlineDate + ' ' + input.deadlineTime;
    let _startTime = input.startDate + ' ' + input.startTime;
    let _endTime = input.endDate + ' ' + input.endTime;
    let _remarks = input.remark;
    let _address = input.address;
    let third_session = app.globalData.third_session;
    let _lat = "";
    let _lng = "";
    let _canupload = that.data.allowUpload == true ? 1 : 0
    let _publicstatus = that.data.isPublic ? 0 : 1
    let _is_justin = that.data.normalRun ? 0 : 1
    if (input.lat) {
      _lat = input.lat
    }
    if (input.lng) {
      _lng = input.lng
    }
    if (util.isEmpty(_title)) {
      wx.showModal({
        title: '提示',
        content: '请输入活动主题',
        showCancel: false
      });
      return false;
    }
    if (util.calTimeStamp(input.startDate, input.startTime) > util.calTimeStamp(input.endDate, input.endTime)) {
      wx.showModal({
        title: '提示',
        content: '开始时间大于结束时间了呀',
        showCancel: false
      });
      return false;
    }
    if (util.isEmpty(_address)) {
      _address = "";
    }
    if (util.isEmpty(_remarks)) {
      _remarks = "";
    }
    wx.showModal({
      title: '注意',
      content: '活动一经发布将无法修改。',
      confirmText: '发布',
      cancelText: '返回编辑',
      success: function (res) {
        if (res.confirm) {
          let _url = 'index.php/Xcx/DateAcinfo/addDate'
          let _data = {
            "title": _title, "start_datetime": _startTime, "end_datetime": _deadline, "stop_datetime": _endTime,
            "address": _address, "remark": _remarks,
            "lat": _lat,
            "lng": _lng,
            "canupload": _canupload,
            "publicstatus": _publicstatus,
            "is_justin": _is_justin,
          }
          if (that.data.actId != 0) {
            _data["actid"] = that.data.actId
          }
          that.setData({
            addDisable: true,
          })
          app.request({
            url: _url,
            data: _data,
            success: function (data) {
              var util = require('../../utils/util.js')
              util.dispatchRefreshParam("list")
              let acid = data.acid
              wx.showToast({
                title: '成功添加活动',
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                wx.redirectTo({
                  url: '../actDetail/actDetail?actId=' + acid,
                })
              }, 1000)
            },
            cmp: function (e) {
              that.setData({
                addDisable: false,
              })
            }
          })
        }
      }
    });
  },
  chooseLocation: function (e) {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        var param = that.data.inputInfo;
        console.log(res)
        param["address"] = res.address + '\n' + res.name;
        param["lat"] = res.latitude
        param["lng"] = res.longitude
        that.setData({
          addrDetail: res.address,
          addrName: res.name,
          inputInfo: param,
        });
      },
    });
  },

})