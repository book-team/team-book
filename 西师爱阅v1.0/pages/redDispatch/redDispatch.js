var app = getApp();
var redid;
var random;
Page({
    countDown: '',
    timer: 0,
    data: {
        status: 0,
        loaded: false,
        showTip: false,
        tipText: '',
        uesrList: [],
        leftnum: 0,
        shareRed: 0,
        canOpen: true,
        random: '',
        endtime: '',
        hour: 0,
        minute: 0,
        second: 0,
        everydayStr: '',
        everyoneStr: '',
        overdueStr: '',
        isself: 1,
        coupon_etime: '',
        belong_type: 0,
        full: 0,
        reduce: 0,
        storename: '',
        redgone_pic: app.globalData.siteBaseUrl + '/static/user/images/redgone.png',
        coupontype_pic1: app.globalData.siteBaseUrl + '/static/user/images/coupontype1.png',
        coupontype_pic2: app.globalData.siteBaseUrl + '/static/user/images/coupontype2.png',
        coupontype_pic3: app.globalData.siteBaseUrl + '/static/user/images/coupontype3.png',
        dispatch_pic_pic: app.globalData.siteBaseUrl + '/static/user/images/dispatch_pic.png',
        newcoupon_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/newcoupon_bg.png',
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        redid = e.redid;
        random = e.random || '';
        var shareRed = e.shareRed || 0;
        var canOpen = true;
        if (shareRed == 1) {
            canOpen = false;
        }
        this.setData({
            random: random,
            shareRed: shareRed,
            canOpen: canOpen
        })
        this.loadData();
    },
    onHide: function () {
        clearInterval(this.timer);
    },
    onUnload: function () {
        clearInterval(this.timer);
    },
    dataInitial: function () {
    },
    onShareAppMessage: function () {
        var random = this.data.random;
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/pages/redDispatch/redDispatch?redid=' + redid + '&random=' + random + '&shareRed=1',
            imageUrl: app.globalData.siteBaseUrl + '/static/user/images/sharered_img.png',
            success: function (res) {
            }
        }
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var random = this.data.random;
        var canOpen = this.data.canOpen;
        var url = '';
        if (canOpen) {
            url = '/newapp/openRed';
        } else {
            url = '/newapp/initRed';
        }
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                openid: openid,
                random: random,
                activity_id: redid
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    var uesrList = [];
                    uesrList = res.picArr;
                    var leftnum = res.shengYuPeople;
                    for (var i = 0; i < leftnum; i++) {
                        uesrList.push('');
                    }
                    newdata['uesrList'] = uesrList;
                    newdata['leftnum'] = leftnum;
                    if (canOpen) {
                        newdata['random'] = res.random || '';
                    }
                    newdata['isself'] = res.isBenRen || 1;
                    that.countDown = res.daoJiShi;
                    that.timer = setInterval(that.GetRTime, 1000);
                } else if (res.code == 2 || res.code == 3 || res.code == 5) {
                    newdata['overdueStr'] = res.msg;
                } else if (res.code == 6) {
                    newdata['coupon_etime'] = res.youxiao;
                    newdata['belong_type'] = res.belong_type;
                    newdata['full'] = res.full;
                    newdata['reduce'] = res.reduce;
                    newdata['storename'] = res.storeName;
                } else if (res.code == 4 || res.code == 7) {
                    app.openTip(res.msg);
                }
                newdata['endtime'] = res.endtime;
                newdata['everydayStr'] = res.everydayStr;
                newdata['everyoneStr'] = res.everyoneStr;
                if (res.code != 4 && res.code != 7) {
                    newdata['status'] = res.code;
                }
                newdata['loaded'] = true;
                that.setData(newdata);
            }
        })
    },
    GetRTime: function () {
        var NowTime = new Date();
        var etime = this.countDown;
        var EndTime = new Date(etime);
        var t = EndTime.getTime() - NowTime.getTime();
        var h = 0;
        var m = 0;
        var s = 0;
        var h, m, s;
        if (t >= 0) {
            h = Math.floor(t / 1000 / 60 / 60);
            m = Math.floor(t / 1000 / 60 % 60);
            s = Math.floor(t / 1000 % 60);
            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            this.setData({
                hour: h,
                minute: m,
                second: s
            })
        } else {
            clearInterval(this.timer);
        }
    },
    backhome: function () {
        app.backhome();
    },
    dismantlRed: function (e) {
        var num = app.getset(e).num;
        if (num == 1) {
            this.setData({
                random: '',
                shareRed: 0
            })
        }
        this.setData({
            canOpen: true
        })
        this.loadData();
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    backhome: function () {
        app.backhome();
    },
    closenewgift: function () {
        app.closenewgift();
    }
})