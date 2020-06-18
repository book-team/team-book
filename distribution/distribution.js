var app = getApp();
var disopenid;
Page({
    qrpath: '',
    data: {
        cashmoney: 0,
        showtip: false,
        tiptext: '佣金大于1元才可以提现',
        isclick: false,
        balance: 0,
        telphone: 0,
        sevenmoney: 0,
        thirtymoney: 0,
        todaymoney: 0,
        ordernums: 0,
        is_show_nums: 2,
        is_disuer: 0,
        grade: 1,
        todayMoney: 0,
        sevenMoney: 0,
        cashMoney: 0,
        groupNums: 0,
        showBackground: false,
        bgstyle: {},
        qrcodestyle: {},
        qrcodeimg: '',
        goodNums: 0,
        code: 1,
        zdyshowTip: false
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#f65454'
        })
        app.addIplog();
        app.checkLogin();
        disopenid = app.globalData.disopenid;
    },
    onShow: function () {
        app.setPageUserInfo();
        this.loadCash();
    },
    dataInitial: function () {
    },
    loadCash: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/disgoods/require_disgoods',
            method: 'post',
            data: {
                openid: openid,
                disopenid: disopenid
            },
            success: function (res) {
                that.setData({
                    code: res.code
                })
                var newdata = {};
                if (res.code == 1) {
                    newdata['balance'] = res.balance;
                    newdata['todaymoney'] = res.todayMoney;
                    newdata['sevenmoney'] = res.sevenMoney;
                    newdata['thirtymoney'] = res.thirtyMoney || 0;
                    newdata['cashmoney'] = res.cashMoneyAll;
                    newdata['ordernums'] = res.orderNums;
                    newdata['telphone'] = res.telphone;
                    newdata['is_show_nums'] = res.is_show_nums;
                    newdata['is_disuer'] = res.is_disuer;
                    newdata['grade'] = res.grade;
                    newdata['todayMoney'] = res.todayMoney;
                    newdata['sevenMoney'] = res.sevenMoney;
                    newdata['cashMoney'] = res.cashMoney;
                    newdata['groupNums'] = res.groupNums;
                    newdata['goodNums'] = res.goodNums;
                    that.qrpath = res.qrpath;
                    that.setData(newdata);
                } else if (res.code == 3) {
                    app.showModal({
                        content: res.msg,
                        confirm: function () {
                            app.turnBack();
                        }
                    })
                }
            }
        })
    },
    gotocash: function () {
        var balance = parseFloat(this.data.balance);
        var color = this.data.color;
        if (balance < 1) {
            if (this.data.isclick) {
                return
            }
            var that = this;
            that.setData({
                showtip: true,
                isclick: true
            });
            setTimeout(function () {
                that.setData({
                    showtip: false,
                    isclick: false
                });
            }, 1500);
            return;
        }
        var telphone = this.data.telphone;
        var url = '';
        if (telphone == 0) {
            url = '/dianshang/bindphone/bindphone?themecolor=' + color;
        } else {
            url = '/dianshang/cashpage/cashpage?themecolor=' + color;
        }
        app.turnToPage(url);
    },
    gotoIntroduce: function () {
        var url = '/dianshang/introduce/introduce';
        app.turnToPage(url);
    },
    cashlist: function () {
        var color = this.data.color;
        var url = '/dianshang/discashlist/discashlist?themecolor=' + color;
        app.turnToPage(url);
    },
    orderlist: function () {
        var color = this.data.color;
        var url = '/dianshang/disorder/disorder?themecolor=' + color;
        app.turnToPage(url);
    },
    myTeamList: function () {
        var url = '/dianshang/myTeam/myTeam';
        app.turnToPage(url);
    },
    sprecode: function () {
        var qrpath = this.qrpath;
        var qrpathArr = [];
        var timestr = new Date().getTime();
        if (qrpath == '') {
            if (JSON.stringify(this.data.userInfo) == '{}') {
                app.showModal({
                    content: '您还未授权',
                    showCancel: true,
                    cancelText: '取消',
                    confirmText: '确定',
                    confirm: function () {
                        app.backhome();
                    }
                })
            } else {
                var that = this;
                var openid = app.getSessionKey();
                var pic = this.data.userInfo.avatarUrl;
                var nickname = this.data.userInfo.nickName;
                app.sendRequest({
                    url: '/disgoods/forward_disgoods',
                    method: 'post',
                    data: {
                        openid: openid,
                        disopenid: disopenid,
                        pic: pic,
                        nickname: nickname
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            var posturl = res.posturl + '?t=' + timestr;
                            qrpathArr.push(posturl);
                            wx.previewImage({
                                urls: qrpathArr
                            })
                        }
                    }
                })
            }
        } else {
            qrpath = qrpath + '?t=' + timestr;
            qrpathArr.push(qrpath);
            wx.previewImage({
                urls: qrpathArr
            })
        }
    },
    goToExtension: function () {
        var url = '/dianshang/goodsextension/goodsextension';
        app.turnToPage(url);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    closenewgift: function () {
        app.closenewgift();
    }
})