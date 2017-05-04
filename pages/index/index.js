//index.js
//获取应用实例
var app = getApp()

const Store = app.Store
const dispatch = Store.dispatch
Page({
  data: {
    //我可以参加的活动的列表
    actListCurrPage: 1,
    actListData: [],
    refreshActList: false,
    reloadingActList: false,
    loadingMoreActList: true,
    noMoreActList: false,

    winH:0,
  },

  onLoad: function () {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winH:res.windowHeight,
        })
      }
    })
    that.requestActList()
  },
  onShow: function () {
    let that = this
    this.unsubStore = Store.subscribe(() => {
      const states = Store.getState().refreshStates
      if (states == "list") {
        that.data.actListCurrPage = 1;
        that.data.refreshActList = true;
      }
    })
    if (that.data.refreshActList) {
      that.setData({
        noMoreActList:false,
        actListData:[],
      })
      that.requestActList()
    }
  },
  onHide() {
    this.data.refreshActList = false;
  },
  onUnload() {
    this.unsubStore()
  },
  onReachBottom: function (e) {
    this.reachBottom()
  },
  onPullDownRefresh:function(e){
    this.reachTop()
  },
  //bindMethod
  reachTop: function (e) {
    console.log("到达顶部")
    this.setData({
      noMoreActList: false,
      reloadingActList: true,
    })
    this.data.actListCurrPage = 1;
    this.requestActList();
  },
  reachBottom: function (e) {
    console.log("到达底部")
    if (!this.data.noMoreActList && !this.data.reloadingActList) {
      this.data.actListCurrPage += 1;
      this.setData({
        loadingMoreActList: true,
      })
      this.requestActList();
    }
  },
  tapactDetailCell: function (e) {
    let that = this;
    let index = e.currentTarget.id
    wx.navigateTo({
      url: '../actDetail/actDetail?actId=' + that.data.actListData[index].acid,
    })
  }
  ,
  tapSearch:function(e){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  tapEditUsrInfo: function (e) {
    wx.navigateTo({
      url: '../editUsrInfo/editUsrInfo',
    })
  },
  tapEnrollListDetail: function (e) {
    let that = this;
    let index = e.currentTarget.id;
    let _actId = that.data.actListData[index].acid
    wx.navigateTo({
      url: '../enrollListDetail/enrollListDetail?actId=' + _actId
    })
  },
  tapMycenter:function(e){
    wx.navigateTo({
      url: '../myCenter/myCenter',
    })
  },
  //请求我可以参与的活动的列表
  requestActList() {
    let that = this;
    let _url = 'index.php/Xcx/DateAcinfo/acList'
    let _data = { "page": that.data.actListCurrPage }
    app.request({url:_url,
     data:_data,
     success:function (data) {
      if (data.acList.length > 0) {
        var param = that.data.actListData;
        if (that.data.actListCurrPage == 1) {
          param = [];
        }
        for (var i = 0; i < data.acList.length; i++) {
          let people = data.acList[i];
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
          actListData: param,
          reloadingActList: false,
          loadingMoreActList: false,
        })
      }
      else {
        that.setData({
          actListCurrPage: that.data.actListCurrPage - 1,
          noMoreActList: true,
          reloadingActList: false,
          loadingMoreActList: false,
        })
      }
    },
      cmp:function () {
        wx.stopPullDownRefresh()
      }})
  },
})
