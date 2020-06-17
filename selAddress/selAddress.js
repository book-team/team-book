var app = getApp();
var type, addrIdx;
Page({
    data: {
        addrIdx: 0,
        type: 0,
        dzpidx: '',
        id: '',
        nid: '',
    },
    onLoad: function (e) {
        var dzpidx = this.data.dzpidx;
        var id = this.data.id;
        this.setData({
            dzpidx: e.dzpidx,
            id: e.id,
            nid: e.nid
        })
        app.addIplog();
        addrIdx = e.addrIdx;
        type = e.type;
        this.setData({
            addrIdx: addrIdx,
            type: type
        })
        if (type == 0) {
            this.setData({
                addinfo: {}
            })
        } else if (type == 1) {
            this.setData({
                addinfo: {
                    'consignee': '',
                    'telphone': ''
                }
            })
        }
    },
    onShow: function () {
        this.loadAddress();
    },
    initAddress: function () {
        if (this.data.addrIdx == 0) {
            this.setData({
                addrIdx: 1
            })
            var addressList = this.data.addressList;
            for (var i = 0; i < addressList.length; i++) {
                if (addressList[i].isdefault == 1) {
                    this.setData({
                        addrIdx: i + 1
                    })
                    break;
                }
            }
        }
    },
    loadAddress: function () {
        var that = this;
        var url = '';
        app.sendRequest({
            url: '/webapp/shipAddress',
            method: 'post',
            data: {
                openid: app.getSessionKey()
            },
            success: function (res) {
                that.setData({
                    addressList: res.shipaddress,
                    loaded: true
                })
                that.initAddress();
            }
        })
    },
    addNewAddress: function () {
        var url = '/pages/filladdress/filladdress?edit=0';
        app.turnToPage(url);
    },
    backhome: function () {
        app.backhome();
    },
    selectAddr: function (e) {
        var dzpidx = this.data.dzpidx;
        if (dzpidx == 1) {
            var nid = this.data.nid;
            var addressList = this.data.addressList;
            var Idx = app.getset(e).index;
            var consignee = addressList[Idx].consignee;
            var telphone = addressList[Idx].telphone;
            var address = addressList[Idx].province + addressList[Idx].city + addressList[Idx].county + addressList[Idx].street;
            app.sendRequest({
                url: '/webreward/underline_msg',
                method: 'post',
                data: {
                    nid: nid,
                    consignee: consignee,
                    telphone: telphone,
                    address: address
                },
                success: function (res) {
                    if (res.code == 1) {
                        var status = 1;
                        var url = '/dazhuanpan/turntable/turntable?msg=' + res.msg + '&status=' + status;
                        app.turnToPage(url);
                    } else {
                        wx.showToast({
                            title: res.msg,
                            icon: 'success',
                        })
                        app.turnBack();
                    }
                }
            })
        } else if (dzpidx == 2) {
            var nid = this.data.id;
            var addressList = this.data.addressList;
            var Idx = app.getset(e).index;
            var consignee = addressList[Idx].consignee;
            var telphone = addressList[Idx].telphone;
            var address = addressList[Idx].province + addressList[Idx].city + addressList[Idx].county + addressList[Idx].street;
            app.sendRequest({
                url: '/webreward/underline_msg',
                method: 'post',
                data: {
                    nid: nid,
                    consignee: consignee,
                    telphone: telphone,
                    address: address
                },
                success: function (res) {
                    if (res.code == 1) {
                        var show_code = 2;
                        var url = '/dazhuanpan/winnorder/winnorder?show_code=' + show_code;
                        app.turnToPage(url);
                    } else {
                        wx.showToast({
                            title: res.msg,
                            icon: 'success',
                        })
                        app.turnBack();
                    }
                }
            })
        } else {
            var addressid = app.getset(e).addressid;
            var addrIdx = app.getset(e).index + 1;
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setData({
                addressid: addressid,
                addrIdx: addrIdx
            })
            app.turnBack();
        }
    },
    goToAddress: function (e) {
        var url = ''
        if (type == 0) {
            url = '/pages/address/address';
        } else if (type == 1) {
            url = '/waimai/takeoutAddress/takeoutAddress';
        }
        app.turnToPage(url);
    }
})