var app = getApp();
var paysubmit = false;
Page({
    data: {
        flagbtn: false,
        seltype: -1,
        seltext: '',
        signurl: '',
        password: '',
        showpage1: false, 
        showpage2: false,
        showpage3: false,
        showpage4: false, 
        showpage5: false, 
        showselbox: false,
        childid: 0,
        realname: '',
        phone: '',
        storename: '',
        headname: '',
        shoplog: '',
        reason: '',
        clicknum: 0,
        showTip: false,
        tipText: '',
        storeaddr: '',
        city_storetype: [],
        classifylist: [],
        classIdx: -1,
        enter_money: 0,
        isstorepic: false,
        isbusinesspic: false,
        storepic: '',
        businesspic: '',
        latitude: 0,
        longitude: 0,
        merchant_noimg: app.globalData.siteBaseUrl + '/static/user/images/merchant_noimg.png',
        storebg: app.globalData.siteBaseUrl + '/static/user/images/storebg.jpg',
        failicon: app.globalData.siteBaseUrl + '/static/user/images/failicon.png',
        waiticon: app.globalData.siteBaseUrl + '/static/user/images/waiticon.png',
    },
    onLoad: function (e) {
        this.setData({
            color: e.themecolor || '#ED6942'
        })
        app.addIplog();
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
    },
    loadData: function () {
        var that = this;
        app.sendRequest({
            url: '/neworder/show_storetype',
            method: 'post',
            data: {
                openid: app.getSessionKey()
            },
            success: function (res) {
                var city_storetype = res.city_storetype || [];
                var foot_type = res.foot_type || [];
                var order_type = res.order_type || [];
                var mall_type = res.mall_type || [];
                var hotel_type = res.hotel_type || [];
                var classifylist = [];
                var need_pic = 1;
                var telphone = '';
                var need_charge = 1;
                var need_money = 0;
                that.setData({
                    city_storetype: city_storetype,
                    foot_type: foot_type,
                    order_type: order_type,
                    mall_type: mall_type,
                    hotel_type: hotel_type,
                })
                if (res.code == 1) {
                    var storeInfo = res.storeInfo;
                    var nidlist = [];
                    for (var i = 0; i < res.storetype.length; i++) {
                        classifylist.push(res.storetype[i].name);
                        nidlist.push(res.storetype[i].nid);
                    }
                    var idx = nidlist.indexOf(storeInfo['store_type']);
                    var store_type = classifylist[idx];
                    that.setData({
                        showpage1: true,
                        childid: storeInfo.child_id,
                        signurl: storeInfo.store_site,
                        password: storeInfo.password,
                        storename: storeInfo.storename,
                        realname: storeInfo.realname,
                        phone: storeInfo.phone,
                        shoplog: storeInfo.pic,
                        storeaddr: storeInfo['address'],
                        detailaddress: storeInfo['detailaddress'],
                        storepic: storeInfo['store_pic'],
                        store_type: store_type,
                        telphone: storeInfo['telphone'],
                        kfphone: storeInfo['kfphone'],
                        introduction: storeInfo['introduction'] || '',
                        banner_pic: storeInfo['banner_pic'] || '',
                        logopic: storeInfo['logo_pic'],
                        seltype: storeInfo['enter_type'],
                    });
                } else if (res.code == 3) {
                    var num = 0;
                    var showsel = false;
                    var seltype = -1;
                    if (res.enter_food == 1) {
                        num++;
                    }
                    if (res.enter_order == 1) {
                        num++;
                    }
                    if (res.enter_mall == 1) {
                        num++;
                    }
                    if (res.enter_city == 1) {
                        num++;
                    }
                    if (res.enter_hotel == 1) {
                        num++;
                    }
                    if (num >= 2) {
                        showsel = true;
                    } else {
                        if (res.enter_food == 1) {
                            seltype = 0;
                            for (var i = 0; i < foot_type.length; i++) {
                                classifylist.push(foot_type[i].name);
                            }
                            need_pic = res.foot_need_pic;
                            telphone = res.foot_telphone;
                            need_charge = res.foot_charge;
                            need_money = res.foot_money;
                        }
                        if (res.enter_order == 1) {
                            seltype = 1;
                            for (var i = 0; i < order_type.length; i++) {
                                classifylist.push(order_type[i].name);
                            }
                            need_pic = res.order_need_pic;
                            telphone = res.order_telphone;
                            need_charge = res.order_charge;
                            need_money = res.order_money;
                        }
                        if (res.enter_mall == 1) {
                            seltype = 2;
                            for (var i = 0; i < mall_type.length; i++) {
                                classifylist.push(mall_type[i].name);
                            }
                            need_pic = res.mall_need_pic;
                            telphone = res.mall_telphone;
                            need_charge = res.mall_charege;
                            need_money = res.mall_money;
                        }
                        if (res.enter_city == 1) {
                            seltype = 3;
                            for (var i = 0; i < city_storetype.length; i++) {
                                classifylist.push(city_storetype[i].name);
                            }
                            need_pic = res.city_need_pic;
                            telphone = res.telphone;
                            need_charge = res.city_charge;
                            need_money = res.enter_money;
                        }
                        if (res.enter_hotel == 1) {
                            seltype = 4;
                            for (var i = 0; i < hotel_type.length; i++) {
                                classifylist.push(hotel_type[i].name);
                            }
                            need_pic = res.hotel_need_pic;
                            telphone = res.hotel_telphone;
                            need_charge = res.hotel_charge;
                            need_money = res.hotel_money;
                        }
                    }
                    that.setData({
                        showpage2: true,
                        showpage5: showsel,
                        showselbox: showsel,
                        seltype: seltype,
                        selnum: num,
                        enter_food: res.enter_food,
                        enter_city: res.enter_city,
                        enter_order: res.enter_order,
                        enter_mall: res.enter_mall,
                        enter_hotel: res.enter_hotel,
                        enter_money: res.enter_money,
                        telphone: telphone,
                        classifylist: classifylist,
                        city_need_pic: res.city_need_pic,
                        foot_need_pic: res.foot_need_pic,
                        order_need_pic: res.order_need_pic,
                        mall_need_pic: res.mall_need_pic,
                        hotel_need_pic: res.hotel_need_pic,
                        foot_telphone: res.foot_telphone,
                        order_telphone: res.order_telphone,
                        mall_telphone: res.mall_telphone,
                        hotel_telphone: res.hotel_telphone,
                        city_telphone: res.telphone,
                        foot_charge: res.foot_charge,
                        order_charge: res.order_charge,
                        mall_charege: res.mall_charege,
                        city_charge: res.city_charge,
                        hotel_charge: res.hotel_charge,
                        foot_money: res.foot_money,
                        order_money: res.order_money,
                        mall_money: res.mall_money,
                        city_money: res.enter_money,
                        hotel_money: res.hotel_money,
                        need_pic: need_pic,
                        need_charge: need_charge,
                        need_money: need_money
                    })
                } else if (res.code == 4) {
                    that.setData({
                        showpage3: true,
                        showpage1: false,
                        showpage2: false,
                        showpage4: false,
                        showpage5: false,
                    })
                } else if (res.code == 5) {
                    var storeInfo = res.storeInfo;
                    var nidlist = [];
                    for (var i = 0; i < res.storetype.length; i++) {
                        classifylist.push(res.storetype[i].name);
                        nidlist.push(res.storetype[i].nid);
                    }
                    that.setData({
                        showpage4: true,
                        reason: storeInfo['reason'],
                        childid: storeInfo['child_id'],
                        realname: storeInfo['realname'],
                        phone: storeInfo['phone'],
                        storename: storeInfo['storename'],
                        headname: storeInfo['headname'],
                        seltype: storeInfo['enter_type'],
                        showpage1: false,
                        showpage2: false,
                        showpage3: false,
                        showpage5: false,
                        showselbox: false,
                        storeaddr: storeInfo['address'],
                        detailaddress: storeInfo['detailaddress'],
                        enter_money: storeInfo['enter_money'],
                        businesspic: storeInfo['licence_pic'],
                        storepic: storeInfo['store_pic'],
                        isstorepic: true,
                        isbusinesspic: true,
                        latitude: storeInfo['latitude'],
                        longitude: storeInfo['longitude'],
                        store_type: storeInfo['store_type'],
                        telphone: storeInfo['telphone'],
                        logopic: storeInfo['logo_pic'],
                        islogopic: true,
                        classifylist: classifylist,
                        classIdx: nidlist.indexOf(storeInfo['store_type']),
                        need_money: storeInfo['need_money'],
                        need_charge: storeInfo['need_charge'],
                        need_pic: storeInfo['need_pic']
                    });
                    if (storeInfo['enter_type'] == 0) {
                        that.setData({
                            foot_type: res.storetype,
                        })
                    } else if (storeInfo['enter_type'] == 1) {
                        that.setData({
                            order_type: res.storetype,
                        })
                    } else if (storeInfo['enter_type'] == 2) {
                        that.setData({
                            mall_type: res.storetype,
                        })
                    } else if (storeInfo['enter_type'] == 3) {
                        that.setData({
                            city_storetype: res.storetype,
                        })
                    } else if (storeInfo['enter_type'] == 4) {
                        that.setData({
                            hotel_type: res.storetype,
                        })
                    }
                }
            }
        })
    },
    selIndustry: function (e) {
        var num = app.getset(e).num;
        var classifylist = [];
        var typeArr = [];
        var need_pic = 1;
        var telphone = '';
        var need_money = 0;
        var need_charge = 1;
        if (num == 0) {
            var seltxt = '饮食';
            typeArr = this.data.foot_type;
            need_pic = this.data.foot_need_pic;
            telphone = this.data.foot_telphone;
            need_money = this.data.foot_money;
            need_charge = this.data.foot_charge;
        } else if (num == 1) {
            var seltxt = '预约';
            typeArr = this.data.order_type;
            need_pic = this.data.order_need_pic;
            telphone = this.data.order_telphone;
            need_money = this.data.order_money;
            need_charge = this.data.order_charge;
        } else if (num == 2) {
            var seltxt = '商城';
            typeArr = this.data.mall_type;
            need_pic = this.data.mall_need_pic;
            telphone = this.data.mall_telphone;
            need_money = this.data.mall_money;
            need_charge = this.data.mall_charege;
        } else if (num == 3) {
            var seltxt = '同城';
            typeArr = this.data.city_storetype;
            need_pic = this.data.city_need_pic;
            telphone = this.data.city_telphone;
            need_money = this.data.city_money;
            need_charge = this.data.city_charge;
        } else if (num == 4) {
            var seltxt = '酒店';
            typeArr = this.data.hotel_type;
            need_pic = this.data.hotel_need_pic;
            telphone = this.data.hotel_telphone;
            need_money = this.data.hotel_money;
            need_charge = this.data.hotel_charge;
        }
        for (var i = 0; i < typeArr.length; i++) {
            classifylist.push(typeArr[i].name);
        }
        this.setData({
            seltype: num,
            seltext: seltxt,
            showpage5: false,
            classIdx: -1,
            classifylist: classifylist,
            need_pic: need_pic,
            telphone: telphone,
            need_money: need_money,
            need_charge: need_charge
        })
    },
    showIndPage: function () {
        this.setData({
            showpage5: true
        })
    },
    reApply: function () {
        this.setData({
            showpage4: false,
            showpage2: true
        })
    },
    saveSellInfo: function (e) {
        var seltype = this.data.seltype;
        var formid = e.detail.formId;
        var tipText = '';
        var that = this;
        var val = e.detail.value;
        var storename = val.storename;
        if (!storename) {
            tipText = '请输入商家名称';
            app.openTip(tipText);
            return false;
        }
        if (this.data.classIdx == -1) {
            tipText = '请选择商家分类';
            app.openTip(tipText);
            return false;
        }
        var contacts = val.contacts;
        if (!contacts) {
            tipText = '请输入联系人';
            app.openTip(tipText);
            return false;
        }
        var telphone = val.telphone;
        if (!telphone) {
            tipText = '请输入联系电话';
            app.openTip(tipText);
            return false;
        }
        var telRule = /^1[1|2|3|4|5|6|7|8|9]\d{9}$/;
        if (!telRule.test(telphone)) {
            tipText = '手机号格式不正确！';
            app.openTip(tipText);
            return false;
        }
        var storeaddr = this.data.storeaddr;
        if (!storeaddr) {
            tipText = '请输入地址';
            app.openTip(tipText);
            return false;
        }
        var detailaddress = val.detailaddress;
        if (!detailaddress) {
            tipText = '请输入门牌号';
            app.openTip(tipText);
            return false;
        }
        var need_pic = this.data.need_pic;
        if (need_pic == 0) {
            if (!this.data.isstorepic) {
                tipText = '请上传门店/门头照片';
                app.openTip(tipText);
                return false;
            }
            if (!this.data.isbusinesspic) {
                tipText = '请上传工商营业执照';
                app.openTip(tipText);
                return false;
            }
        }
        var logopic = this.data.logopic;
        if (!this.data.islogopic) {
            tipText = '请上传商家logo';
            app.openTip(tipText);
            return false;
        }
        var flag = this.data.flagbtn;
        if (flag) {
            that.setData({
                flagbtn: true
            })
            return;
        }
        var licence_pic = this.data.businesspic || '';
        var store_pic = this.data.storepic || '';
        var latitude = this.data.latitude;
        var longitude = this.data.longitude;
        var openid = app.getSessionKey();
        var childid = this.data.childid;
        var url = '';
        if (seltype == 0) {
            url = '/takeout/add_store';
            var store_type = this.data.foot_type[this.data.classIdx].nid;
        } else if (seltype == 1) {
            url = '/neworder/add_store';
            var store_type = this.data.order_type[this.data.classIdx].nid;
        } else if (seltype == 2) {
            url = '/webapp/add_store';
            var store_type = this.data.mall_type[this.data.classIdx].nid;
        } else if (seltype == 3) {
            url = '/city/add_seller';
            var store_type = this.data.city_storetype[this.data.classIdx].nid;
        } else if (seltype == 4) {
            url = '/webhotel/add_seller';
            var store_type = this.data.hotel_type[this.data.classIdx].nid;
        }
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        app.sendRequest({
            url: url,
            method: 'post',
            data: {
                child_id: childid,
                storename: storename,
                store_type: store_type,
                name: contacts,
                phone: telphone,
                address: storeaddr,
                detailaddress: detailaddress,
                store_pic: store_pic,
                licence_pic: licence_pic,
                latitude: latitude,
                longitude: longitude,
                openid: openid,
                formid: formid,
                logopic: logopic,
                seltype: seltype
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
                            that.loadData();
                        },
                        fail: function () {
                            paysubmit = false;
                        }
                    })
                } else if (res.code == 100) {
                    paysubmit = false;
                    app.showModal({
                        content: res.msg
                    });
                    that.loadData();
                } else {
                    paysubmit = false;
                    app.showModal({
                        content: res.msg
                    })
                }
            }
        })
    },
    turnLeft: function () {
        var clicknum = this.data.clicknum;
        if (clicknum == 0) {
            return;
        }
        this.setData({
            clicknum: clicknum - 1
        })
    },
    turnRight: function () {
        var clicknum = this.data.clicknum;
        var selnum = this.data.selnum;
        if (clicknum >= selnum - 2) {
            return;
        }
        this.setData({
            clicknum: clicknum + 1
        })
    },
    bindClass: function (e) {
        var value = e.detail.value;
        this.setData({
            classIdx: value
        })
    },
    openMap: function (e) {
        var that = this;
        wx.chooseLocation({
            success: function (res) {
                that.setData({
                    storeaddr: res.address,
                    latitude: res.latitude,
                    longitude: res.longitude
                })
            }
        })
    },
    uploadFormImg: function (e) {
        var that = this;
        var num = app.getset(e).num;
        app.chooseImage(function (res) {
            if (num == 0) {
                that.setData({
                    isstorepic: true,
                    storepic: res
                })
            } else if (num == 1) {
                that.setData({
                    isbusinesspic: true,
                    businesspic: res
                })
            } else {
                that.setData({
                    islogopic: true,
                    logopic: res
                })
            }
        })
    },
    changeInfo: function (e) {
        var type = app.getset(e).type;
        var val = app.getset(e).val;
        var childid = this.data.childid;
        var seltype = this.data.seltype;
        var url = '/pages/changeInfo/changeInfo?type=' + type + '&val=' + val + '&childid=' + childid + '&seltype=' + seltype;
        app.turnToPage(url);
    },
    sellGood: function () {
        var childid = this.data.childid;
        var seltype = this.data.seltype;
        var url = '/pages/addgoodsTip/addgoodsTip?childid=' + childid + '&seltype=' + seltype;
        app.turnToPage(url);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    },
    closenewgift: function () {
        app.closenewgift();
    },
})