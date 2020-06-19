var app = getApp();
Page({
    data: {
        chooseIndex: 0,
        showcouponDetail: true,
        orderType: [
            { name: '全部' },
            { name: '未使用' },
            { name: '已使用' },
            { name: '已过期' }
        ],
        phone_icon_pic: app.globalData.siteBaseUrl + '/static/user/images/phone_icon.png',
    },
    onLoad: function (e) {
        app.addIplog();
        var that = this;
        app.sendRequest({
            url: '/webapp/myCoupon',
            method: 'post',
            data: {
                openid: app.getSessionKey()
            },
            success: function (res) {
                if (res.code != 2) {
                    that.setData({
                        appname: res.appname,
                        mycoupon: res.mycoupon
                    });
                }
                if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        vqdlevel: res.code
                    });
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                }
            }
        })
    },
    chooseType: function (e) {
        var index = e.target.dataset.index;
        this.setData({
            chooseIndex: index
        });
        var that = this;
        that.setData({
            appname: '',
            mycoupon: ''
        });
        if (index == 0) {
            app.sendRequest({
                url: '/webapp/myCoupon',
                method: 'post',
                data: {
                    openid: app.getSessionKey()
                },
                success: function (res) {
                    if (res.code != 2) {
                        that.setData({
                            appname: res.appname,
                            mycoupon: res.mycoupon
                        });
                    }
                }
            })
        } else if (index == 1) {
            app.sendRequest({
                url: '/webapp/nuseCoupon',
                method: 'post',
                data: {
                    openid: app.getSessionKey()
                },
                success: function (res) {
                    if (res.code != 2) {
                        that.setData({
                            appname: res.appname,
                            mycoupon: res.mycoupon
                        });
                    }
                }
            })
        } else if (index == 2) {
            app.sendRequest({
                url: '/webapp/useCoupon',
                method: 'post',
                data: {
                    openid: app.getSessionKey()
                },
                success: function (res) {
                    if (res.code != 2) {
                        that.setData({
                            appname: res.appname,
                            mycoupon: res.mycoupon
                        });
                    }
                }
            })
        } else if (index == 3) {
            app.sendRequest({
                url: '/webapp/overCoupon',
                method: 'post',
                data: {
                    openid: app.getSessionKey()
                },
                success: function (res) {
                    if (res.code != 2) {
                        that.setData({
                            appname: res.appname,
                            mycoupon: res.mycoupon
                        });
                    }
                }
            })
        }
    },
    showDetail: function (e) {
        var that = this;
        var couponid = app.getset(e).couponid
        app.sendRequest({
            url: '/webapp/couponDetails',
            method: 'post',
            data: {
                couponid: couponid
            },
            success: function (res) {
                that.setData({
                    showcouponDetail: false,
                    coupon: res.coupon,
                    appname: res.appname,
                    usetime: res.usetime,
                    usehour: res.usehour
                });
            }
        })
    },
    back: function (e) {
        this.setData({
            showcouponDetail: true
        })
    }
})