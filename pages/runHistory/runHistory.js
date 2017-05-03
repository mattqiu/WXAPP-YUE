var app = getApp()
Page({
  data: {
    list: [],
    userId: 0,
    name: '我的',
    currPage: 1,
    loading: true,
    noMoreData: false,
  },
  onLoad: function (options) {
    this.requestMyRecord()
    if (options.userId) {
      this.setData({
        userId: options.userId,
      })
    }
  },
  onShow: function () {
  },
  onReachBottom: function () {
    if (!this.data.noMoreData) {
      this.requestMyRecord();
    }
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.name + '跑步记录',
      path: '/pages/runHistory/runHistory?userId=' + that.data.userId,
    }
  },

  //网络
  requestMyRecord: function (cb) {
    let that = this
    let _url = "index.php/Xcx/Date/myScore"
    let _data = { "page": that.data.currPage }
    if (that.data.userId != 0) {
      _data["userid"] = that.data.userId
    }
    this.setData({
      loading: true,
    })
    app.request({
      url: _url,
      data: _data,
      success: function (res) {
        let scores = res.myscore;
        if (that.data.currPage == 1) {
          let newList = scores
          if (res.name && that.data.userId != 0) {
            wx.setNavigationBarTitle({
              title: res.name + '的跑步记录',
            })
          }
          that.setData({
              name: res.name
            })
          that.setData({
            list: newList,
            userId: res.userid
          })
        }
        else {
          let newList = that.data.list.concat(scores)
          that.setData({
            list: newList,
          })
        }
        that.setData({
          currPage: that.data.currPage + 1,
        })
        if (scores.length == 0) {
          that.setData({
            noMoreData: true,
          })
        }
        if (cb) {
          cb()
        }
      },
      cmp: function (e) {
        that.setData({
          loading: false,
        })
      }
    })
  }
})