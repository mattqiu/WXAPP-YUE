const app = getApp();
Page({
    data: {
        userInfo: {},
        imgSources:
        {
            topImg: '/images/p1-top.png',
            bomImg: '/images/p1-bom.png'
        },
        office: ['中心领导', '技术部', '运营部', '产品部', '综合部', "视觉中心"],
        officeIdx: 0,
        userName: '',
        tel: '',
        registering: false,
    },
    onLoad(query) {
    },
    //bindMethod
    bindPickerChange(e) {
        this.setData({
            officeIdx: e.detail.value
        })
    },
    register(e) {
        let that = this
        let _usrName = this.data.userName;
        let _office = this.data.office[this.data.officeIdx];
        let _tel = this.data.tel;
        let _openid = this.data.openId;
        if (typeof (_usrName) == 'undefined' || !_usrName) {
            wx.showModal({
                title: '提示',
                content: '请输入姓名',
                showCancel: false
            });
            return false;
        }
        if (typeof (_tel) == 'undefined' || !_tel) {
            wx.showModal({
                title: '提示',
                content: '请输入手机号码',
                showCancel: false
            });
            return false;
        }
        if (typeof (_office) == 'undefined' || !_office) {
            wx.showModal({
                title: '提示',
                content: '请选择部门',
                showCancel: false
            });
            return false
        }
        if (this.data.registering) {
            return;
        }
        this.setData({
            registering: true,
        })
        if (app.globalData.userInfo) {
            let _nickName = app.globalData.userInfo.nickName;
            let _avatarImg = app.globalData.userInfo.avatarUrl;
            let _data = {
                'department': _office,
                'name': _usrName,
                'mobile': _tel,
                'nickname': _nickName,
                'headimgurl': _avatarImg
            }
            that.requestRegister(_data)
        }
        else {
            wx.login({
                success: function (res) {
                    wx.getUserInfo({
                        success: function (res) {
                            app.globalData.userInfo = res.userInfo
                            let _data = {
                                'department': _office,
                                'name': _usrName,
                                'mobile': _tel,
                                'nickname': app.globalData.userInfo.nickName,
                                'headimgurl': app.globalData.userInfo.avatarUrl
                            }
                            that.requestRegister(_data)
                        },
                        fail: function () {
                            that.setData({
                                registering: false,
                            })
                            wx.showModal({
                                title: '错误',
                                content: '获取授权失败,请在设置修改允许获取用户信息(仅用于录入昵称和头像)',
                                showCancel: false
                            });

                        }
                    })
                },
                fail: function () {
                    wx.showModal({
                        title: '错误',
                        content: '微信登录失败',
                        showCancel: false
                    });
                },
            })
        }

    },
    requestRegister: function (param) {
        let that = this
        let _url= 'index.php/Xcx/DateUserinfo/addUserInfo'
        let _data = param
        app.request({
            url: _url,
            data: _data,
            success: function (result) {
                wx.redirectTo({
                    url: '../index/index'
                })
            },
            cmp: function (e) {
                that.setData({
                    registering: false,
                })
            }
        })
    },
    bindNameValChange(e) {
        this.setData({
            userName: e.detail.value
        })
    },
    bindTelValChange(e) {
        this.setData({
            tel: e.detail.value
        })
    }
})