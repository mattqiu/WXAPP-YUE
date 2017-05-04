var app = getApp()
const Store = app.Store
const dispatch = Store.dispatch
Page({
  data: {
    userInfo: {},
    refreshUsrInfo: false,
  },
  onLoad: function (options) {
    this.requestUserInfo()
  },

  onShow: function () {
    let that = this
    this.unsubStore = Store.subscribe(() => {
      const states = Store.getState().refreshStates
      if (states == "usrInfo") {
        that.data.myActListCurrPage = 1;
        that.data.refreshUsrInfo = true;
      }
    })
    if (that.data.refreshUsrInfo) {
      that.requestUserInfo()
    }
  },
  onHide: function () {
    this.data.refreshUsrInfo = false;

  },
  onUnload: function () {
    this.unsubStore()
  },

  //bindMethod
  tapEditUsrInfo: function (e) {
    wx.navigateTo({
      url: '../editUsrInfo/editUsrInfo',
    })
  },
  addAct:function(e){
    wx.navigateTo({
      url: '../addActivity/addActivity',
    })
  },
  //private

  //request
  requestUserInfo() {
    let that = this
    let _url = 'index.php/Xcx/DateUserinfo/getUserinfo'
    let _data = {}
    app.request({url:_url, 
    data:_data,
    success: function (data) {
      that.setData(
        {
          userInfo: data.myUserinfo,
        });
    }});
  },

})