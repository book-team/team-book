var app = getApp();
Page({
    data: {
        loaded: false,
        dsNotice: '',
        groupNotice: '',
        disNotice: '',
        seckNotice: '',
        kjNotice: '',
        otherNotice: '',
        takeoutNotice: '',
        cityNotice: '',
        orderNotice: '',
        hotelNotice: '',
        goods_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/goods_msg.png',
        group_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/group_msg.png',
        dist_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/dist_msg.png',
        seckill_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/seckill_msg.png',
        bargain_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/bargain_msg.png',
        other_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/other_msg.png',
        takeout_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/takeout_msg.png',
        city_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/city_msg.png',
        appoint_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/appoint_msg.png',
        hotel_msg_pic: app.globalData.siteBaseUrl + '/static/user/images/hotel_msg.png',
    },
    onLoad: function (e) {
        app.addIplog();
    },
    onShow: function () {
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/newapp/allNotice',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                var newdata = {};
                newdata['dsNotice'] = res.dsNotice;
                newdata['groupNotice'] = res.groupNotice;
                newdata['disNotice'] = res.disNotice;
                newdata['seckNotice'] = res.seckNotice;
                newdata['kjNotice'] = res.kjNotice;
                newdata['otherNotice'] = res.otherNotice;
                newdata['takeoutNotice'] = res.takeoutNotice;
                newdata['cityNotice'] = res.cityNotice;
                newdata['orderNotice'] = res.orderNotice;
                newdata['hotelNotice'] = res.hotelNotice;
                newdata['loaded'] = true;
                that.setData(newdata);
            }
        })
    },
    goToMessageList: function (e) {
        var num = app.getset(e).num;
        var url = '/pages/messageList/messageList?num=' + num;
        app.turnToPage(url);
    }
})