var app = getApp();
Page({
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    data: {
        billArr: []
    },
    onLoad: function (options) {
        app.addIplog();
        this.loadData();
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        var pagenum = this.pagenum;
        app.sendRequest({
            url: '/neworder/show_memberbill',
            method: 'post',
            data: {
                openid: openid,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    that.havenums = res.havenums;
                    that.pagenum = that.pagenum + 1;
                    var oldList = that.data.billArr;
                    newdata['billArr'] = oldList.concat(res.detailed);
                    newdata['nothing'] = true;
                    that.setData(newdata);
                } else {
                    that.setData({
                        nothing: true
                    });
                }
            }
        })
    },
    scrollMoreBill: function () {
        var prenum = this.prenum;
        var pagenum = this.pagenum;
        var havenums = this.havenums;
        if (prenum != pagenum && havenums != 0) {
            this.prenum = pagenum;
            this.loadData();
        }
    }
})