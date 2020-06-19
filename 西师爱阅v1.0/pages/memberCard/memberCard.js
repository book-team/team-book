var app = getApp();
Page({
    data: {
        discountInfo: [],
        discard_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/discard_bg.png',
        stocard_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/stocard_bg.png',
    },
    onLoad: function (e) {
        app.setPageUserInfo();
        app.addIplog();
        this.loadData();
    },
    gotoMember: function (e) {
        var type = app.getset(e).type;
        var discardid = this.data.discountInfo.id || 0;
        if (type == 0) {
            var url = '/pages/newMemberDetail/newMemberDetail?type=' + type + '&discardid=' + discardid;
            app.turnToPage(url);
        } else {
            if (!this.data.is_stored) {
                return;
            }
            var that = this;
            app.sendRequest({
                url: '/newapp/issetStoreCard',
                method: 'post',
                data: {
                },
                success: function (res) {
                    if (res.code == 1) {
                        var url = '/pages/newMemberDetail/newMemberDetail?type=' + type + '&discardid=' + discardid;
                        app.turnToPage(url);
                    } else {
                        app.toast({
                            title: '商家还没设置储值卡！'
                        })
                    }
                }
            })
        }
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/newapp/card_info',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                that.setData({
                    is_stored: res.is_stored,
                    discountInfo: res.discountInfo || {},
                    mycardinfo: res.mycardinfo || {},
                    cardlog: res.cardlog,
                    show_discount: res.show_discount
                })
            }
        })
    },
    consumeDetail: function () {
        var url = '/pages/consumeDetail/consumeDetail';
        app.turnToPage(url);
    },
    opencard: function (e) {
        var that = this;
        var openid = app.getSessionKey();
        var type = app.getset(e).type;
        if (type == 0) {
            var turl = '/newapp/OpenReduceCard';
        } else {
            var turl = '/newapp/OpenStoreCard';
        }
        app.sendRequest({
            url: turl,
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.showToast({
                        title: '开卡成功',
                        icon: 'none',
                        duration: 1000
                    })
                    that.loadData();
                } else {
                    wx.showModal({
                        content: res.msg,
                        confirmText: '点击跳转',
                        success: function (res) {
                            if (res.confirm) {
                                var url = '/pages/userinfo/userinfo';
                                app.turnToPage(url);
                            } else if (res.cancel) {
                            }
                        }
                    })
                }
            }
        })
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    },
    closenewgift: function () {
        app.closenewgift();
    },
})