var app = getApp();
var childid, coutype;
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        status: 0,
        couponArr: [
        ],
        coupontype_pic1: app.globalData.siteBaseUrl + '/static/user/images/coupontype1.png',
        coupontype_pic2: app.globalData.siteBaseUrl + '/static/user/images/coupontype2.png',
        coupontype_pic3: app.globalData.siteBaseUrl + '/static/user/images/coupontype3.png',
        coupontype_nouse_pic1: app.globalData.siteBaseUrl + '/static/user/images/coupontype1_nouse.png',
        coupontype_nouse_pic2: app.globalData.siteBaseUrl + '/static/user/images/coupontype2_nouse.png',
        coupontype_nouse_pic3: app.globalData.siteBaseUrl + '/static/user/images/coupontype3_nouse.png',
        coupon_used_pic: app.globalData.siteBaseUrl + '/static/user/images/coupon_used.png',
        coupon_overdue_pic: app.globalData.siteBaseUrl + '/static/user/images/coupon_overdue.png',
        newcoupon_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/newcoupon_bg.png',
        newcoupon_nouse_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/newcoupon_nouse_bg.png',
        newcouponl_bg_pic: app.globalData.siteBaseUrl + '/static/user/images/newcouponl_bg.png',
    },
    onLoad: function (e) {
        childid = e.childid || 0;
        coutype = e.coutype || null;
        app.addIplog();
        this.loadData();
    },
    selbespCoupon: function (e) {
        var num = e.target.dataset.num;
        this.setData({
            status: num,
            couponArr: [],
            nothing: false
        })
        this.resetNum();
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        var status = this.data.status;
        app.sendRequest({
            url: '/newapp/myCoupons',
            method: 'post',
            data: {
                openid: openid,
                status: status,
                pageNum: pagenum,
                coutype: coutype,
                child_id: childid
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.haveNums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.couponArr;
                    var couponArr = oldList.concat(res.coupons);
                    for (var i = 0; i < couponArr.length; i++) {
                        couponArr[i].showstore = false;
                    }
                    newdata['couponArr'] = couponArr;
                    newdata['nothing'] = true;
                    that.setData(newdata);
                } else if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        vqdlevel: res.code
                    });
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                } else {
                    that.setData({
                        nothing: true
                    });
                }
            }
        })
    },
    loadmoreCoupon: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    },
    resetNum: function () {
        this.prenum = 0;
        this.pagenum = 1;
        this.havenums = 1;
    },
    showAllStore: function (e) {
        var couponArr = this.data.couponArr;
        var index = app.getset(e).index;
        var showstore = !couponArr[index].showstore;
        couponArr[index].showstore = showstore;
        this.setData({
            couponArr: couponArr
        })
    },
    goToCouponDetail: function (e) {
        var cid = app.getset(e).cid;
        var url = '/pages/couponDetail/couponDetail?cid=' + cid;
        app.turnToPage(url);
    }
})