var app = getApp()
Page({
  data: {
    detailData: {},
    actId: 0,
    avatarW: (750 - 60 - 40 - 70) / 7,//展示的头像的宽度
    actPicW: 210,//活动风采的图片的宽度
    actPics: [1, 2, 3, 4, 5, 6],
    actStatusStr: "招募中",
    joinNum: 1,
    refuseReason: "",
    winH: 0,
    join: true,
    formId: 0,
    receiveNote: true,


    time_hour: 0,
    time_min: 0,
    time_sec: 0,
    error_hour: false,
    error_minute: false,
    error_sec: false,
    addingSportRecord: false,
    currScorePage: 1,
    hasMoreScores: true,
    scores: [],
    currentScore: 0,

    showSportRecordBox: false,

    files: [],
    uploadProgress: [],
    uploadLimit: [],
    uploadTimer: [], //定时器
    uploadTask: [],//因为每次只能上传一张，所以要把所有任务给纪录下来
    isUploading: false,
    editMode: false,
  },
  onLoad: function (options) {
    let that = this;
    this.setData({
      actId: options.actId,
    })
    this.requestActDetail(function (res) {
      if (res.status) {
        if (that.data.detailData.is_justin == 0) {
          that.requestScore();
        }
        let _files = [];
        let _progress = [];
        let _timer = [];
        let _uploadLimit = [];
        for (var i = 0; i < res.data.imgList.length; i++) {
          _files[i] = app.globalData.host + res.data.imgList[i].imgurl;
          _progress[i] = 101;
          _timer[i] = -101;
          _uploadLimit[i] = 0;
        }
        that.setData({
          files: _files,
          uploadProgress: _progress,
          uploadTimer: _timer,
        })
      }
    });
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.detailData.title,
      path: '/pages/actDetail/actDetail?actId=' + that.data.actId,
    }
  },
  //bindtap
  tapEnrollList: function (e) {
    let that = this;
    wx.navigateTo({
      url: '../enrollListDetail/enrollListDetail?actId=' + that.data.actId
    })
  },
  previewImage: function (e) {
    let that = this;
    let index = e.currentTarget.id;
    var touchTime = that.data.touch_end - that.data.touch_start;

    if (touchTime > 350) {
      this.tapEditBtn();
    }
    else {
      if (this.data.uploadProgress[index] == -1) //需要重新上传的
      {
        this.reUpload(index);
      }
      else {
        wx.previewImage({
          current: this.data.files[index], // 当前显示图片的http链接
          urls: this.data.files // 需要预览的图片http链接列表
        })
      }
    }

  },
  tapDel: function (e) {
    let index = e.currentTarget.id;
    let that = this;
    this.delImg(index, function (status) {
      if (status == true) {
        that.data.myActListDetail.imgList.splice(index, 1);
      }
    });
    let _files = that.data.files;
    _files.splice(index, 1);
    this.setData({
      files: _files,
    })
  },
  tapAddNum: function (e) {
    let num = this.data.joinNum;
    if (e.currentTarget.dataset.status == '1') {
      num += 1;
    }
    else {
      num -= 1;
    }
    if (num < 1) {
      return;
    }
    this.setData({
      joinNum: num,
    })
  }
  ,
  bindReasonValChange: function (e) {
    this.setData({
      refuseReason: e.detail.value,
    })
  },

  tapLocation: function (e) {
    let that = this;
    let lat = this.data.detailData.lat
    let lng = this.data.detailData.lng
    let address = this.data.detailData.address

    if (lat && lat.length > 0 && lng && lng.length > 0 && address.length > 0) {
      let addrSpliceIdx = address.indexOf("\n");
      let addrName = address.substring(0, addrSpliceIdx)
      let addrDetail = address.substring(addrSpliceIdx)
      lat = parseFloat(lat)
      lng = parseFloat(lng)
      wx.openLocation({
        latitude: lat, // 纬度，范围为-90~90，负数表示南纬
        longitude: lng, // 经度，范围为-180~180，负数表示西经
        scale: 28, // 缩放比例
        name: addrName, // 位置名
        address: addrName,
      })
    }
  },
  //private
  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },
  tapEditBtn: function (e) {
    let _editMode = !this.data.editMode;
    this.setData({
      editMode: _editMode,
    })
  },
  editAct: function (e) {
    let that = this
    wx.redirectTo({
      url: '../addActivity/addActivity?actInfo=' + JSON.stringify(that.data.detailData),
    })
  },
  tapLoadMoreScore: function (e) {
    this.requestMoreScore()
  },
  chooseImage: function (e) {
    var that = this;
    let _uploadProgress = this.data.uploadProgress;
    let currIndex = that.data.files.length;
    wx.chooseImage({
      count: 20,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (imgsInfo) {
        for (var i = currIndex; i < imgsInfo.tempFilePaths.length + currIndex; i++) {
          _uploadProgress[i] = 0 //从零开始
          let imgInfo = { "imgid": -1 };
          that.data.detailData.imgList.push(imgInfo);
        }
        that.setData({
          files: that.data.files.concat(imgsInfo.tempFilePaths),
          uploadProgress: _uploadProgress,
        });
        wx.getNetworkType({
          success: function (res) {
            if (res.networkType != "none") //在有网络的情况下才启动计时器
            {
              for (var i = currIndex; i < imgsInfo.tempFilePaths.length + currIndex; i++) {
                let index = i;
                that.data.uploadTask.push(index);
              }
              that.startUpload();
            }
          }
        })
      }
    })
  },
  growth: function (index) {
    let progress = this.data.uploadProgress[index];
    var util = require('../../utils/util.js');
    let uploadLimit = this.data.uploadLimit[index];
    if (progress < uploadLimit) {
      let uploadLimit = this.data.uploadLimit[index];
      let randomProgress = util.randomNum(progress, uploadLimit);
      if (progress == 0) {
        randomProgress = util.randomNum(progress, 50);
      }
      let _progress = this.data.uploadProgress;
      _progress[index] = randomProgress;
      let randomInterval = util.randomNum(100, 500);
      this.setData({
        uploadProgress: _progress,
      })
      let that = this;
      let timer = setTimeout(function () {
        that.growth(index);
      }, randomInterval);
      this.data.uploadTimer[index] = timer;
    }
  },
  startTimer: function (index) {
    var util = require('../../utils/util.js');
    let _randomUpperLimit = util.randomNum(60, 90);
    let _Limits = this.data.uploadLimit;
    _Limits[index] = _randomUpperLimit;
    this.setData({
      uploadLimit: _Limits,
    })
    this.growth(index);
  },
  stopTimer: function (index, status) {
    let that = this;
    let timer = this.data.uploadTimer[index];
    clearTimeout(timer);
    let _uploadProgress = this.data.uploadProgress;
    if (status == true)//成功了
    {
      _uploadProgress[index] = 100
      this.setData(
        {
          uploadProgress: _uploadProgress,
        }
      )
      setTimeout(function () {  //为了成功的提示能停留久一点
        let __uploadProgress = that.data.uploadProgress;
        __uploadProgress[index] = 101
        that.setData({
          uploadProgress: __uploadProgress,
        })
      }, 500);
    }
    else //失败了
    {
      _uploadProgress[index] = -1
      this.setData(
        {
          uploadProgress: _uploadProgress,
        }
      )
    }
  },
  startUpload: function () {
    let that = this;
    if (this.data.uploadTask.length > 0) {
      if (!this.data.isUploading) {
        this.setData({
          isUploading: true,
        })
        let index = this.data.uploadTask[0];
        that.startTimer(index);
        that.saveImage(function (status) {
          setTimeout(function () {
            that.stopTimer(index, status);
          }, 1000);
        }, index);
      }
    }
    else {
      this.setData({
        isUploading: false,
      })
    }
  },
  finishUpload: function (index) {
    this.data.uploadTask.splice(0, 1);
    this.setData({
      isUploading: false,
    })
    this.startUpload();
  },
  reUpload: function (index) {
    let that = this;
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType != "none") //在有网络的情况下才启动计时器
        {
          let _progesss = that.data.uploadProgress;
          _progesss[index] = 0;
          that.setData({
            uploadProgress: _progesss,
          })
          that.data.uploadTask.push(index);
          that.startUpload();
        }
        else {
          wx.showModal({
            title: '提示',
            content: '网络似乎有点问题',
            showCancel: false,
          })
        }
      }
    })
  },
  changeNoteOpt: function (e) {
    let that = this
    this.setData({
      receiveNote: !that.data.receiveNote,
    })
  },
  tapConfirm: function (e) {
    let that = this
    this.setData({
      showModalStatus: false,
    });
    if (e.currentTarget.id == "join") { //参加
      this.setData({
        formId: e.detail.formId,
      })
      this.requestJoin(function (res) {
        if (res.status == true) {
          var util = require('../../utils/util.js')
          util.dispatchRefreshParam("list")
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 1000
          })
          that.clearState();
          that.requestActDetail()
        }

      })
    }
    else //拒绝参加
    {
      this.refuseJoin(function (res) {
        if (res.status == true) {
          var util = require('../../utils/util.js')
          util.dispatchRefreshParam("list")
          wx.showToast({
            title: '成功拒绝',
            icon: 'success',
            duration: 1000
          })
          that.clearState();
          that.requestActDetail()
        }
      })
    }
  },
  clearState: function () {
    this.setData({
      time_hour: 0,
      time_min: 0,
      time_sec: 0,
      joinNum: 1,
      error_hour: false,
      error_minute: false,
      error_sec: false,
      hasMoreScores: true,
      refuseReason: "",
    })
  },
  tapdial: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.id,
      success: function (res) {

      }
    })
  },
  tapAddSportRecord: function (e) {
    let that = this
    let hour = that.data.time_hour
    let minute = that.data.time_min
    let sec = that.data.time_sec
    let doubleClick = that.data.addingSportRecord

    let hasError = that.data.error_hour || that.data.error_minute || that.data.error_sec
    if (hasError || doubleClick) {
      return;
    }
    let totalTime = parseInt(hour * 3600) + parseInt(minute * 60) + parseInt(sec)
    this.setData({
      addingSportRecord: true,
    })
    let _data = { "acid": that.data.actId, "score": totalTime }
    app.request({
      url: "index.php/Xcx/Date/updateScore",
      data: _data,
      success: function (res) {
        wx.showToast({
          title: '成功添加',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          showSportRecordBox: false,
        })
        that.clearState()
        that.requestActDetail()
        if (that.data.detailData.is_justin == 0) {
          that.requestScore();
        }
      },
      cmp: function (res) {
        that.setData({
          addingSportRecord: false,
        })
      }
    })
  },
  bindTimeFieldInput: function (e) {
    let time = e.detail.value;
    let isNotNum = isNaN(time);
    if (e.currentTarget.id == "hour") {
      this.setData({
        time_hour: time,
        error_hour: (isNotNum || time < 0 || time % 1 != 0)
      })
    }
    else if (e.currentTarget.id == "minute") {
      this.setData({
        time_min: time,
        error_minute: (isNotNum || time > 60 || time < 0 || time % 1 != 0),
      })
    }
    else if (e.currentTarget.id == "second") {
      this.setData({
        time_sec: time,
        error_sec: (isNotNum || time > 60 || time < 0 || time % 1 != 0),
      })
    }
  },
  setShowSportRecordBox: function (e) {
    let that = this
    this.setData({
      showSportRecordBox: !that.data.showSportRecordBox,
    })
  },
  setModalStatus: function (e) {
    if (e.currentTarget.id == "join") {
      this.setData({
        join: true,
      })
    }
    else {
      this.setData({
        join: false,
      })
    }
    // var animation = wx.createAnimation({
    //   duration: 200,
    //   timingFunction: "linear",
    //   delay: 0
    // })
    // this.animation = animation
    // animation.translateY(200).step()
    // this.setData({
    //   animationData: animation.export()
    // })
    if (e.currentTarget.dataset.status == 1) {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    // animation.translateY(0).step()
    // this.setData({
    //   animationData: animation
    // })
    if (e.currentTarget.dataset.status == 0) {
      this.setData(
        {
          showModalStatus: false
        }
      );
    }
  },
  delImg: function (index, cb) {
    let that = this;
    let _url = 'index.php/Xcx/Date/deleteImg'
    let _data = {
      "imgid": that.data.detailData.imgList[index].imgid
    }
    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        if (cb) {
          cb(true);
        }
      }
    })
  },
  saveImage: function (cb, index) {
    let that = this;
    let session = app.getSession();
    wx.uploadFile({
      url: app.globalData.host + 'index.php/Xcx/Date/uploadImg',
      filePath: that.data.files[index],
      name: 'activitypic',
      header: {
        "content-type": "multipart/form-data",
      },
      formData: {
        "third_session": session,
        "acid": that.data.actId,
      },
      success: function (res) {
        let data = JSON.parse(res.data);

        if (data.status == 1) {
          let imgInfo = { "imgid": data.data.imgid, "candelete": 1 };
          let newDetailData = that.data.detailData
          newDetailData.imgList[index] = imgInfo
          that.setData({
            detailData: newDetailData
          })
          that.finishUpload(index);
          if (cb) {
            cb(true);
          }
        }
        else if (data.status == -10 || data.status == -11) {
          app.login(function (status) {
            if (status == -1) {
              wx.showModal({
                title: '错误',
                content: '微信授权登录失败',
                showCancel: false
              });
            }
            else {
              that.saveImage(cb, index)
            }
          })
        }
        else if (data.status == -1) {
          wx.showModal({
            title: '错误',
            content: data.msg,
            showCancel: false
          });
          that.finishUpload(index);
          if (cb) {
            cb(false)
          }
        }
        else {
          that.finishUpload(index);
          if (cb) {
            cb(false)
          }
        }
      },
      fail: function () {
        that.finishUpload(index);
        if (cb) {
          cb(false);
        }
      },
    })
  },
  requestActDetail: function (cb) {
    let that = this;
    let actId = this.data.actId;
    let _data = { "acid": actId }
    let _url = 'index.php/Xcx/Date/acInfo'
    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        let actDetail = result.acinfo
        let _statusStr = "";
        if (actDetail.ac_status == 1) {
          _statusStr = "招募中";
        }
        else if (actDetail.ac_status == 0) {
          _statusStr = "报名截止";
        }
        else {
          _statusStr = "活动进行中";
        }
        var actPics = [];
        for (var i = 0; i < actDetail.imgList.length; i++) {
          actPics[i] = app.globalData.host + actDetail.imgList[i].imgurl;
        }
        that.setData({
          actStatusStr: _statusStr,
          detailData: actDetail,
          files: actPics,
        })
        if (cb) {
          cb({ status: true, data: actDetail })
        }
      }
    })
  },
  requestScore: function (cb) {
    let that = this
    that.setData({
      currScorePage: 1,
    })
    let _url = "index.php/Xcx/Date/acScore"
    let _data = { "acid": that.data.actId, "page": that.data.currScorePage }
    app.request({
      url: _url,
      data: _data,
      success: function (res) {
        if (res.acscore.length == 0) {
          that.setData({
            hasMoreScores: false,
          })
        }
        if (res.myscore) {
          let currScore = res.myscore.score
          let currHour = parseInt(res.myscore.score / 3600)
          let currMin = parseInt((currScore - currHour * 3600) / 60)
          let currSec = parseInt((currScore - currHour * 3600 - currMin * 60))
          that.setData({
            scores: res.acscore,
            currentScore: currScore,
            time_hour: currHour,
            time_min: currMin,
            time_sec: currSec,
          })
        }
      },
      cmp: function (e) {

      }
    })
  },
  requestMoreScore: function (cb) {
    let that = this
    that.setData({
      currScorePage: that.data.currScorePage + 1,
    })
    let _url = "index.php/Xcx/Date/acScore"
    let _data = { "acid": that.data.actId, "page": that.data.currScorePage }
    app.request({
      url: _url,
      data: _data,
      success: function (res) {
        if (res.acscore.length == 0) {
          that.setData({
            hasMoreScores: false,
          })
        }
        let nScores = that.data.scores.oncat(res.acscore)
        that.setData({
          scores: nScores
        })
      },
      cmp: function (e) {

      }
    })
  },
  requestJoin: function (cb) {
    let that = this;
    let _url = 'index.php/Xcx/Date/enrollYes'
    let _cansend = that.data.receiveNote ? 0 : 1 //0表示接受信息
    var util = require('../../utils/util.js')

    let _data = {
      "acid": that.data.detailData.acid,
      "people": that.data.joinNum,
      "form_id": that.data.formId,
      "cansend": _cansend
    }
    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        if (cb) {
          cb({ status: true });
        }
      }
    })
  },
  refuseJoin: function (cb) {
    let that = this;
    let _url = 'index.php/Xcx/Date/enrollNo'
    var util = require('../../utils/util.js')

    let _data = {
      "acid": that.data.detailData.acid,
      "reason": that.data.refuseReason
    }

    app.request({
      url: _url,
      data: _data,
      success: function (result) {
        if (cb) {
          cb({ "status": true })
        }
      }
    })
  }
})