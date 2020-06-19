var app = getApp();
var childid, seltype;
Page({
    data: {
    },
    onLoad: function (e) {
        app.addIplog();
        childid = e.childid;
        seltype = e.seltype;
        this.setData({
            seltype: seltype
        })
        this.loadData();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/city/add_city_goods',
            method: 'post',
            data: {
                child_id: childid
            },
            success: function (res) {
                var store = res.store;
                that.setData({
                    store_site: store.store_site,
                    phone: store.phone,
                    password: store.password,
                    qrcode: res.qrcode
                })
            }
        })
    },
    copyurl: function () {
        var pcurl = this.data.store_site;
        var that = this;
        wx.setClipboardData({
            data: pcurl,
            success: function (res) {
                wx.getClipboardData({
                    success: function (res) {
                        app.toast({ title: '成功复制到剪贴板', mask: true });
                    }
                })
            }
        })
    },
    previewImage: function () {
        var picpath = this.data.qrcode;
        var url = [];
        url.push(picpath);
        wx.previewImage({
            current: '',
            urls: url
        });
    },
    changeInfo: function (e) {
        var type = app.getset(e).type;
        var val = app.getset(e).val;
        var url = '/pages/changeInfo/changeInfo?type=' + type + '&val=' + val + '&childid=' + childid + '&seltype=' + seltype;
        app.turnToPage(url);
    },
})