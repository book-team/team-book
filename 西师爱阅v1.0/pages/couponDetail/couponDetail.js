var app = getApp();
var cid;
Page({
    data: {
        loaded: false,
        full: 0,
        reduce: 0,
        storeName: '',
        goodtype: '',
        gettime: '',
        endtime: '',
        belong_type: 0,
        everyday_num: '',
        everyone_num: '',
        activity_shuo: ''
    },
    onLoad: function (e) {
        app.addIplog();
        cid = e.cid;
        this.loadData();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/newapp/coupDetail',
            method: 'post',
            data: {
                coup_logid: cid
            },
            success: function (res) {
                var newdata = {};
                newdata['full'] = res.full;
                newdata['reduce'] = res.reduce;
                newdata['storeName'] = res.storeName;
                newdata['goodtype'] = res.goodtype;
                newdata['gettime'] = res.gettime;
                newdata['endtime'] = res.youxiaoQi;
                newdata['belong_type'] = res.belong_type;
                newdata['everyday_num'] = res.everyday_num;
                newdata['everyone_num'] = res.everyone_num;
                newdata['activity_shuo'] = res.activity_shuo;
                newdata['loaded'] = true;
                that.setData(newdata);
            }
        })
    }
})