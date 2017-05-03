var app = getApp()
Page({
  data: {
    actId: 0,
    loading: true,
    join: [],
    joinNum:0,
    refuse: [],
    refuseNum:0,
    others: [],
    othersNum:0,
    isOwner:false,
    emailAddr: "",
    errorEmailAddr: false,
    showSendWindow: false,
    sendingEmail: false,
  },
  onLoad: function (options) {
    this.setData({
      actId: options.actId,
    })
    this.requestEnrollList()
  },
  //bindMethod
  tapDial: function (e) {
    let phone = e.currentTarget.id;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  tapSendEmail: function (e) {
    this.setData({
      showSendWindow: true,
    })
  },
  tapComfirmSend: function (e) {
    let that = this
    var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    var strEmail = pattern.test(this.data.emailAddr.replace(/(^\s*)|(\s*$)/g, ""))
    console.log(this.data.emailAddr)
    if (strEmail) {
      this.setData({
        sendingEmail: true,
      })
      this.requestSendEmail();
    } else {
      this.setData({
        errorEmailAddr: true,
      })
      setTimeout(function () {
        that.setData({
          errorEmailAddr: false,
        })
      }, 4000)

    }

  },
  inputEmail: function (e) {
    this.setData({
      emailAddr: e.detail.value,
    })
  },
  setShowInputWindow: function (e) {
    let _status = e.currentTarget.dataset.status == 0 ? false : true;
    this.setData({
      showSendWindow: _status
    })

  },
  //private

  //request
  requestEnrollList: function () {
    let that = this
    let _data = { "acid": that.data.actId }
    app.request({
      url: "index.php/Xcx/Date/enrollList",
      data: _data,
      success: function (res) {
        console.log(res)
        that.setData({
          joinNum:res.people1,
          refuseNum:res.people2,
          othersNum:res.people3,
          isOwner:res.isOwner,
        })
        if (res.data1) {
          that.setData({
            join: res.data1
          })
        }
        if (res.data2) {
          that.setData({
            refuse: res.data2
          })
        }
        if (res.data3) {
          that.setData({
            others: res.data3
          })
        }
      },
      cmp: function (e) {
        that.setData({
          loading: false,
        })
      }
    })
  },
  requestSendEmail: function (e) {
    let that = this
    let _data = { "email": that.data.emailAddr, "acid": that.data.actId }
    app.request({
      url: "index.php/Xcx/Date/doExcel",
      data: _data,
      success: function (res) {
        console.log("成功了")
        setTimeout(function () {
          wx.showToast({
            title: '成功发送邮件',
            icon: 'success',
            duration: 2000
          })
        }, 500)

      },
      cmp: function (e) {
        that.setData({
          sendingEmail: false,
          showSendWindow: false,
        })
      }
    })
  }
})