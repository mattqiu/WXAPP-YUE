var app = getApp()
const Store = app.Store
const dispatch = Store.dispatch

Page({
    data: {
        isJoinedActList: true, //是否为参与过的活动列表
        actList: [],

        editScrollX:[],
        currPage: 1,
        loadingMore: true,
        noMoreData: false,
    },
    onLoad: function (options) {
        let _isJoinedActList = options.type == 1 ? true : false
        let navTit = options.type == 1 ? "我参与过的活动" : "我发起的活动"
        this.setData({
            isJoinedActList: _isJoinedActList
        })
        if (this.data.isJoinedActList) {
            this.requestMyEnrollList()
        }
        else {
            this.requestMyCreateList()
        }
        wx.setNavigationBarTitle({
            title: navTit,
        })
    },
    onShow: function () {
        let that = this
        this.unsubStore = Store.subscribe(() => {
            const states = Store.getState().refreshStates
            console.log(states)
            if (states == "list") {
                that.data.currPage = 1;
                that.data.reFreshList = true;
            }
        })
        if (that.data.reFreshList) {
            that.setData({
                noMoreData: false,
                reFreshList: false,
                actList: [],
            })
            if (that.data.isJoinedActList)
             {
                that.requestMyEnrollList()
            }
            else {
                that.requestMyCreateList()
            }
        }
    },
    onHide: function () {
    },
    onUnload: function () {
        this.unsubStore()
    },
    onPullDownRefresh: function () {
    },
    onReachBottom: function () {
        let that = this
        if (!this.data.noMoreData) {
            this.setData({
                currPage: that.data.currPage + 1,
                loadingMore: true
            })
            if (this.data.isJoinedActList) {
                this.requestMyEnrollList()
            }
            else {
                this.requestMyCreateList()
            }
        }
    },

    //bindMethod
    tapActDetail: function (e) 
    {
        let that = this;
        let index = e.currentTarget.id;
        if(this.data.editScrollX.length > 0 && this.data.editScrollX[index] > 0)
        {
            let _editScrollX = this.data.editScrollX
            _editScrollX[index] = 0
            this.setData({
                editScrollX:_editScrollX
            })
            return
        }
        wx.navigateTo({
            url: '../actDetail/actDetail?actId=' + that.data.actList[index].acid,
        })
    },
    tapEnrollListDetail: function (e) {
        let that = this;
        let index = e.currentTarget.id;
        let _actId = that.data.actList[index].acid;
        wx.navigateTo({
            url: '../enrollListDetail/enrollListDetail?actId=' + _actId,
        })
    },
    bindScrollEditCell:function(e)
    {
        let that = this
        let index = e.currentTarget.id
        let scrollX = e.detail.scrollLeft
        // var _editScrollX = this.data.editScrollX
        let maxContentW = Math.ceil(100 * (e.detail.scrollWidth / 810))
        // if(scrollX > 8)
        // {
        //     _editScrollX[index] = maxContentW
        // }
        // else
        // {
        //     _editScrollX[index] = 0
        // }
        // this.setData({
        //     editScrollX:_editScrollX
        // })
        this.data.editScrollX[index] = scrollX
    },
    delAct: function (e) {
        let that = this
        let index = e.currentTarget.id
        let _title = that.data.actList[index].title
        wx.showModal({
            title: '注意',
            content: '确定删除活动' + _title + '?',
            confirmText: '删除',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {

                }
            }
        })
    },
    //request
    requestMyEnrollList: function (e) { //我参与过的活动
        let that = this
        let _data = { "page": that.data.currPage }
        app.request({
            url: "index.php/Xcx/DateEnroll/myEnroll",
            data: _data,
            success: function (res) {
                if (res.myEnrollList && res.myEnrollList.length > 0) {
                    var param = that.data.actList;
                    if (that.data.currPage == 1) {
                        param = [];
                    }
                    var _editScrollX = []
                    for (var i = 0; i < res.myEnrollList.length; i++) {
                        let people = res.myEnrollList[i];
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
                        _editScrollX.push(0)
                    }
                    that.setData({
                        actList: param,
                        editScrollX:_editScrollX,
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
                that.setData({
                    loadingMore: false,
                })
            }
        })
    },
    requestMyCreateList: function (e) { //我发起的活动
        let that = this
        let _data = { "page": that.data.currPage }
        app.request({
            url: "index.php/Xcx/DateAcinfo/myAcinfo",
            data: _data,
            success: function (res) {
                if (res.myAcinfoList && res.myAcinfoList.length > 0) {
                    var param = that.data.actList;
                    if (that.data.currPage == 1) {
                        param = [];
                    }
                    for (var i = 0; i < res.myAcinfoList.length; i++) {
                        let people = res.myAcinfoList[i];
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
                        actList: param,
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
                that.setData({
                    loadingMore: false,
                })
            }
        })
    }
})