var app = getApp();
var discard_id;
var paysubmit = false;
Page({
    data: {
        membertype: 0,
        balance: 0,
        selidx: -1,
        selid: 0,
        disCard: [],
        loaded: false,
        discard_bg: app.globalData.siteBaseUrl + '/static/user/images/discard_bg.png',
        stocard_bg: app.globalData.siteBaseUrl + '/static/user/images/stocard_bg.png',
        isgive: 0
    },
    onLoad: function (e) {
        app.addIplog();
        this.setData({
            membertype: e.type || 0
        })
        discard_id = e.discardid;
        if (e.type == 1) {
            this.loadRecData();
        } else {
            this.loadDisData();
        }
    },
    loadRecData: function () {
        var that = this;
        app.sendRequest({
            url: '/neworder/show_membercard',
            method: 'post',
            data: {
                openid: app.getSessionKey()
            },
            success: function (res) {
                that.setData({
                    balance: res.balance,
                    membercard: res.membercard,
                    loaded: true,
                    cardlog: res.cardlog,
                    isgive: res.isgive
                })
            }
        })
    },
    loadDisData: function () {
        var that = this;
        app.sendRequest({
            url: '/newapp/my_memcard',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                discard_id: discard_id
            },
            success: function (res) {
                if (res.code == 1) {
                    var nextpow = [];
                    var condition = [];
                    if (res.nextlevel == 1) {
                        if (res.nextdisCard.auto_discounts) {
                            nextpow.push(res.nextdisCard.auto_discounts);
                        }
                        if (res.nextdisCard.free) {
                            nextpow.push(res.nextdisCard.free);
                        }
                        if (res.nextdisCard.reduce) {
                            nextpow.push(res.nextdisCard.reduce);
                        }
                        if (res.nextdisCard.sendIntegral) {
                            nextpow.push(res.nextdisCard.sendIntegral);
                        }
                        condition = res.nextdisCard.condition.split(',');
                    }
                    that.setData({
                        disCard: res.disCard,
                        hascard: res.hascard,
                        nextlevel: res.nextlevel,
                        nextdisCard: res.nextdisCard,
                        loaded: true,
                        nextpow: nextpow,
                        condition: condition
                    })
                } else if (res.code == 4) {
                    var condition = [];
                    condition = res.condition.split(',');
                    that.setData({
                        loaded: true,
                        condition: condition
                    })
                } else {
                    app.toast({ title: res.msg });
                }
            }
        })
    },
    selRecharge: function (e) {
        var dataset = app.getset(e);
        var idx = dataset.idx;
        var id = dataset.id;
        this.setData({
            selid: id,
            selidx: idx
        })
    },
    gotoRecharge: function () {
        var that = this;
        var selid = this.data.selid;
        var membercard = this.data.membercard;
        var selidx = this.data.selidx;
        if (!selid) {
            app.toast({ title: '请选择充值金额' });
            return;
        }
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: '/neworder/vip_recharge',
            method: 'post',
            data: {
                openid: app.getSessionKey(),
                setid: selid
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.requestPayment({
                        timeStamp: res.payinfo.timeStamp,
                        nonceStr: res.payinfo.nonceStr,
                        package: res.payinfo.package,
                        signType: res.payinfo.signType,
                        paySign: res.payinfo.paySign,
                        success: function (data) {
                            paysubmit = false;
                            var add = parseFloat(membercard[selidx].recharge) + parseFloat(membercard[selidx].gives);
                            var balance = that.data.balance;
                            balance = (parseFloat(balance) + add).toFixed(2);
                            that.setData({
                                balance: balance
                            })
                            that.sendNotice(res.payinfo.package, res.record_id, 1);
                        },
                        fail: function (data) {
                            paysubmit = false;
                            that.sendNotice(res.payinfo.package, res.record_id, 0);
                        }
                    })
                } else {
                    paysubmit = false;
                    app.toast({ title: res.msg });
                }
            }
        })
    },
    consumeDetail: function () {
        var url = '/pages/consumeDetail/consumeDetail';
        app.turnToPage(url);
    },
    sendNotice: function (formid, record_id, status) {
        app.sendRequest({
            url: "/takeout/vip_sendNotice",
            method: 'post',
            data: {
                status: status,
                openid: app.getSessionKey(),
                formid: formid,
                record_id: record_id
            },
            success: function (res) {
            }
        });
    }
})