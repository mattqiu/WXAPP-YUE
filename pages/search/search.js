var app = getApp()
Page({
  data: {
    loadingResult: false,
    searchRes: [],
    searchKey: "",
    currPage: 1,
    noMoreData: false,
  },
  onLoad: function (options) {
  },
  onReady: function () {
  },
  onShow: function () {
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
    let that = this
    if (!this.data.noMoreData) {
      this.setData({
        loadingResult: true,
        currPage: that.data.currPage + 1,
      })
      that.search()
    }
  },

  //bindMethod
  confrimSearch: function (e) {
    let _searchKey = e.detail.value
    this.setData({
      loadingResult: true,
      searchKey: _searchKey,
      currPage: 1,
      noMoreData: false,
    })
    this.search()
  },
  tapactDetailCell: function (e) {
    let that = this;
    let index = e.currentTarget.id
    wx.navigateTo({
      url: '../actDetail/actDetail?actId=' + that.data.searchRes[index].acid,
    })
  },
  //private

  //request
  search: function (e) {
    let that = this
    let _s_field = this.data.searchKey
    let _currPage = this.data.currPage
    let _data = { "s_field": _s_field, "page": _currPage }
    app.request({
      url: "index.php/Xcx/DateAcinfo/acList",
      data: _data,
      success: function (res) {
        if (res.acList.length > 0) {
          that.setData({
            searchRes: [], //主要是清除上次的搜索结果
            noMoreData:false,
          })
          var param = that.data.searchRes;
          if (that.data.currPage == 1) {
            param = [];
          }
          for (var i = 0; i < res.acList.length; i++) {
            let people = res.acList[i];
            let status = people.ac_status;
            let statusStr = "";
            if (status == 0) {
              statusStr = "报名截止";
            }
            else if (status == 1) {
              statusStr = "招募中";
            }
            else {
              statusStr = "活动结束";
            }
            people.statusStr = statusStr;
            param.push(people)
          }
          that.setData({
            searchRes: param,
            noMoreData: false,
          })
        }
        else {
          that.setData({
            noMoreData: true,
          })
        }
      },
      cmp: function (e) {
        console.log(e)
        that.setData({
          loadingResult: false,
        })
      }
    })
  },

})