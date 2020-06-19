const ald = require('utils/ald-stat.js');
var util = require('utils/util.js');
var appglobal = require('./appglobal.js');
var WxParse = require('components/wxParse/wxParse.js');
var appid = appglobal.appGdata();
var appTitle = appglobal.appTitle();
var appDescription = appglobal.appDescription();
var tabBarPagePathArr = appglobal.tabBarPagePath();
var homepageRouter = appglobal.homePageName();
var Allpages = appglobal.Allpages();
var siteUrl = appglobal.siteUrl();
var weburl = appglobal.weburl();
var that;
var innerAudioContext = wx.createInnerAudioContext();
var paysubmit = false;
var dzbjump = false;
App({
    onLaunch: function () {
        that = this;
        var userInfo;
        if (userInfo = wx.getStorageSync('userInfo')) {
            that.globalData.userInfo = userInfo;
        }
        wx.setStorage({
            key: "tablenum",
            data: ''
        });
    },
    getset: function (e) {
        return e.currentTarget.dataset;
    },
    sendRequest: function (param, customSiteUrl) {
        var data = param.data || {},
            header = param.header,
            requestUrl;
        data.app_id = this.getAppId();
        if (!this.globalData.notBindXcxAppId) {
            data.session_key = this.getSessionKey();
        }
        if (customSiteUrl) {
            requestUrl = customSiteUrl + param.url;
        } else {
            requestUrl = this.globalData.siteBaseUrl + param.url;
        }
        if (param.method) {
            if (param.method.toLowerCase() == 'post') {
                data = this.modifyPostParam(data);
                header = header || {
                    'content-type': 'application/x-www-form-urlencoded;'
                }
            }
            param.method = param.method.toUpperCase();
        }
        wx.request({
            url: requestUrl,
            data: data,
            method: param.method || 'GET',
            header: header || {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.statusCode && res.statusCode != 200) {
                    return;
                }
                if (res.data.status) {
                    if (res.data.status == 401) {
                        that.login();
                        return;
                    }
                    if (res.data.status != 0) {
                        that.hideToast();
                        that.showModal({
                            content: '' + res.data.data
                        });
                        return;
                    }
                }
                typeof param.success == 'function' && param.success(res.data);
            },
            fail: function (res) {
                if (res.errMsg == 'request:fail url not in domain list') {
                    that.showModal({
                        content: res.errMsg
                    });
                } else {
                    that.showModal({
                        content: '请求超时了'
                    });
                }
                typeof param.fail == 'function' && param.fail(res.data);
            },
            complete: function (res) {
                typeof param.complete == 'function' && param.complete(res.data);
            }
        });
    },
    turnToPage: function (url, isRedirect) {
        var pages = getCurrentPages();
        var tabBarPagePathArr = this.globalData.tabBarPagePathArr;
        var newurl = url.split('?')[0];
        if (tabBarPagePathArr.indexOf(newurl) != -1) {
            this.switchToTab(url);
        } else {
            if (!isRedirect && pages.length < 10) {
                wx.navigateTo({
                    url: url
                });
            } else {
                wx.redirectTo({
                    url: url
                });
            }
        }
    },
    switchToTab: function (url) {
        wx.switchTab({
            url: url
        });
    },
    turnBack: function () {
        wx.navigateBack();
    },
    setPageTitle: function (title) {
        wx.setNavigationBarTitle({
            title: title
        });
    },
    toast: function (param) {
        if (param.title.length > 7) {
            param.icon = 'none';
        }
        wx.showToast({
            title: param.title,
            icon: param.icon,
            duration: param.duration || 1000,
            mask: param.mask || false,
        });
    },
    hideToast: function () {
        wx.hideToast();
    },
    showModal: function (param) {
        wx.showModal({
            title: param.title || '提示',
            content: param.content,
            showCancel: param.showCancel || false,
            cancelText: param.cancelText || '取消',
            cancelColor: param.cancelColor || '#000000',
            confirmText: param.confirmText || '确定',
            confirmColor: param.confirmColor || '#3CC51F',
            success: function (res) {
                if (res.confirm) {
                    typeof param.confirm == 'function' && param.confirm(res);
                } else {
                    typeof param.cancel == 'function' && param.cancel(res);
                }
            },
            fail: function (res) {
                typeof param.fail == 'function' && param.fail(res);
            },
            complete: function (res) {
                typeof param.complete == 'function' && param.complete(res);
            }
        });
    },
    makePhoneCall: function (number, callback) {
        if (number.currentTarget) {
            var dataset = number.currentTarget.dataset;
            number = dataset.number;
        }
        wx.makePhoneCall({
            phoneNumber: number,
            success: callback
        });
    },
    getLocation: function (options) {
        wx.getLocation({
            type: 'wgs84',
            success: options.success,
            fail: options.fail
        });
    },
    chooseLocation: function (options) {
        wx.chooseLocation({
            success: function (res) {
                options.success(res);
            },
            cancel: options.cancel,
            fail: options.fail
        });
    },
    openLocation: function (options) {
        wx.openLocation(options);
    },
    login: function () {
        wx.login({
            success: function (res) {
                if (res.code) {
                    that.sendCode(res.code);
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            },
            fail: function (res) {
                console.log('login fail: ' + res.errMsg);
            }
        });
    },
    checkLogin: function () {
        if (!this.getSessionKey()) {
            this.sendSessionKey();
        } else {
            this.pageInitial();
        }
    },
    sendCode: function (code) {
        this.sendRequest({
            url: '/webapp/getCode',
            data: {
                code: code
            },
            success: function (res) {
                if (!res.data) {
                    that.showModal({
                        content: '亲~appid和appsecret不匹配，请重新打包代码进行审核，谢谢。'
                    })
                }
                that.setSessionKey(res.data);
                that.pageInitial();
            }
        })
    },
    sendSessionKey: function () {
        try {
            var key = wx.getStorageSync('session_key');
        } catch (e) {
        }
        if (!key) {
            this.login();
        } else {
            this.globalData.sessionKey = key;
            this.sendRequest({
                url: '/webapp/getCode',
                success: function (res) {
                    if (!res.is_login) {
                        that.login();
                        return;
                    }
                    that.pageInitial();
                },
                fail: function (res) {
                }
            });
        }
    },
    setSessionKey: function (session_key) {
        this.globalData.sessionKey = session_key;
        wx.setStorage({
            key: 'session_key',
            data: session_key
        })
    },
    getHomepageRouter: function () {
        return this.globalData.homepageRouter;
    },
    getAppId: function () {
        return this.globalData.appId;
    },
    getSessionKey: function () {
        return this.globalData.sessionKey;
    },
    getUserInfo: function () {
        return this.globalData.userInfo;
    },
    setUserInfoStorage: function (info) {
        for (var key in info) {
            this.globalData.userInfo[key] = info[key];
        }
        wx.setStorage({
            key: 'userInfo',
            data: this.globalData.userInfo
        })
    },
    setPageUserInfo: function () {
        var currentPage = this.getNowPage(),
            newdata = {};
        newdata['userInfo'] = this.getUserInfo();
        currentPage.setData(newdata);
    },
    getNowPage: function () {
        var pages = getCurrentPages();
        return pages[pages.length - 1];
    },
    tapInnerLinkHandler: function (event) {
        var param = event.currentTarget.dataset.eventParams;
        if (param) {
            param = JSON.parse(param);
            var url = param.inner_page_link;
            var actionPages = param.actionPages;
            if (url) {
                var allPages = this.globalData.Allpages;
                if (actionPages != 'myOrder' && actionPages != 'address' && actionPages != 'shopCart' && actionPages != 'distribution' && actionPages != 'checkpage' && actionPages != 'wifi_page' && actionPages != 'sellerJoin' && actionPages != 'city_order' && actionPages != 'iWantDis' && actionPages != 'coupon_center' && actionPages != 'card_center') {
                    var tabBarPagePathArr = this.globalData.tabBarPagePathArr;
                    if (tabBarPagePathArr.indexOf(url) != -1) {
                        this.switchToTab(url);
                    } else {
                        var is_redirect = param.is_redirect == 1 ? true : false;
                        this.turnToPage(url, is_redirect);
                    }
                } else {
                    if (allPages.indexOf(url.substring(1, url.length)) != -1 || actionPages == 'city_order') {
                        if (actionPages == 'sellerJoin') {
                            this.showJoin('');
                        } else if (actionPages == 'card_center') {
                            this.myMemcard();
                        } else {
                            var tabBarPagePathArr = this.globalData.tabBarPagePathArr;
                            if (tabBarPagePathArr.indexOf(url) != -1) {
                                this.switchToTab(url);
                            } else {
                                var is_redirect = param.is_redirect == 1 ? true : false;
                                this.turnToPage(url, is_redirect);
                            }
                        }
                    } else {
                        this.showModal({
                            content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
                        })
                    }
                }
            }
        }
    },
    tapPhoneCallHandler: function (event) {
        if (!isNaN(parseInt(event.currentTarget.dataset.phoneseg))) {
            var phone_num = event.currentTarget.dataset.phoneseg;
            this.makePhoneCall(phone_num);
        } else {
            if (event.currentTarget.dataset.eventParams) {
                var phone_num = JSON.parse(event.currentTarget.dataset.eventParams)['phonenum'];
                this.makePhoneCall(phone_num);
            }
        }
    },
    getAppTitle: function () {
        return this.globalData.appTitle;
    },
    getAppDescription: function () {
        return this.globalData.appDescription;
    },
    modifyPostParam: function (obj) {
        let query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.modifyPostParam(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.modifyPostParam(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    },
    dataInitial: function () {
        var pageInstance = that.getNowPage();
        that.sendRequest({
            url: '/webapp/timeOver',
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        [`expire.isExpire`]: false
                    });
                } else {
                    pageInstance.setData({
                        [`expire.isExpire`]: true
                    });
                }
            }
        });
        var articleList = pageInstance.articleList;
        if (articleList.length > 0) {
            for (let i = 0; i < articleList.length; i++) {
                let compid = articleList[i].name;
                let type = articleList[i].nid;
                let orderType = articleList[i].orderType;
                let shownum = articleList[i].shownum;
                this.loadArtData(compid, type, orderType, shownum);
            }
        }
        var commentlist = pageInstance.commentid;
        if (commentlist.length > 0) {
            for (var i = 0; i < commentlist.length; i++) {
                this.commentData(commentlist[i].name, commentlist[i].cid);
            }
        }
        var dymanicList = pageInstance.dymanicList;
        if (dymanicList.length > 0) {
            for (var i = 0; i < dymanicList.length; i++) {
                let compid = dymanicList[i].name;
                let nid = dymanicList[i].nid;
                this.dynamicListData(compid, nid);
            }
        }
        var countArr = pageInstance.countArr;
        for (var i = 0; i < countArr.length; i++) {
            let compid = countArr[i].compid;
            let countid = countArr[i].countId;
            let autocount = countArr[i].autocount;
            if (autocount) {
                autocount = 1;
            } else {
                autocount = 0;
            }
            let nickname = that.globalData.userInfo.nickName;
            let openid = that.globalData.sessionKey;
            let icon = pageInstance.data[compid].icon;
            icon = icon.split('-active')[0];
            that.sendRequest({
                url: '/webapp/initCounts',
                data: {
                    openid: openid,
                    nickname: nickname,
                    is_auto: autocount,
                    count_id: countid
                },
                method: 'post',
                success: function (res) {
                    var newdata = {};
                    if (res.code == 1) {
                        newdata[compid + '.total'] = res.total;
                        if (res.hascount == 1) {
                            newdata[compid + '.icon'] = icon + '-active';
                        }
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        var goodsArr = pageInstance.goodsArr;
        for (var i = 0; i < goodsArr.length; i++) {
            let compid = goodsArr[i].name;
            let type = goodsArr[i].nid;
            let orderType = goodsArr[i].orderType;
            let shownum = goodsArr[i].shownum;
            let bindObj = goodsArr[i].bindObj || 0;
            this.loadGoodsData(compid, type, orderType, shownum, bindObj, 1);
        }
        var forumArr = pageInstance.forumArr;
        for (var i = 0; i < forumArr.length; i++) {
            let compid = forumArr[i].name;
            let forumId = forumArr[i].forumId;
            that.sendRequest({
                url: '/webapp/Api/getForumAll',
                data: {
                    id: forumId
                },
                method: 'post',
                success: function (res) {
                    if (res.code == 200) {
                        pageInstance.setData({
                            [`${compid}.content`]: res.list
                        });
                    }
                }
            });
        }
        var topicArr = pageInstance.topicArr;
        for (var i = 0; i < topicArr.length; i++) {
            let compid = topicArr[i].name;
            let limit = topicArr[i].shownum;
            let id = topicArr[i].form;
            let orderType = topicArr[i].orderType;
            that.sendRequest({
                url: '/webapp/Api/getTopicAll',
                data: {
                    forumId: id, order: orderType, limit: limit
                },
                method: 'post',
                success: function (res) {
                    if (res.code == 200) {
                        pageInstance.setData({
                            [`${compid}.content`]: res.data.list
                        });
                    }
                }
            });
        }
        var cityArr = pageInstance.cityArr;
        if (cityArr.length > 0) {
            that.getLocation({
                success: function (res) {
                    var latitude = res.latitude;
                    var longitude = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: latitude,
                            lng: longitude
                        },
                        success: function (res) {
                            if (res.code == 1) {
                                for (var i = 0; i < cityArr.length; i++) {
                                    let compid = cityArr[i];
                                    var newdata = {};
                                    newdata[compid + '.hidden'] = false;
                                    newdata[compid + '.provinces'] = [];
                                    newdata[compid + '.provinces_ids'] = [];
                                    newdata[compid + '.province'] = '';
                                    newdata[compid + '.citys'] = [];
                                    newdata[compid + '.city_ids'] = [];
                                    newdata[compid + '.city'] = '';
                                    newdata[compid + '.districts'] = [];
                                    newdata[compid + '.district_ids'] = [];
                                    newdata[compid + '.district'] = '';
                                    newdata[compid + '.value'] = [0, 0, 0];
                                    newdata[compid + '.local'] = res.province + ' ' + res.city + ' ' + res.district;
                                    pageInstance.setData(newdata);
                                }
                            }
                        }
                    });
                },
                fail: function (res) {
                    for (var i = 0; i < cityArr.length; i++) {
                        let compid = cityArr[i];
                        var newdata = {};
                        newdata[compid + '.hidden'] = false;
                        newdata[compid + '.provinces'] = [];
                        newdata[compid + '.provinces_ids'] = [];
                        newdata[compid + '.province'] = '';
                        newdata[compid + '.citys'] = [];
                        newdata[compid + '.city_ids'] = [];
                        newdata[compid + '.city'] = '';
                        newdata[compid + '.districts'] = [];
                        newdata[compid + '.district_ids'] = [];
                        newdata[compid + '.district'] = '';
                        newdata[compid + '.value'] = [0, 0, 0];
                        newdata[compid + '.local'] = '福建省 厦门市 思明区';
                        pageInstance.setData(newdata);
                    }
                }
            });
            that.sendRequest({
                url: '/webapp/city_list',
                method: 'post',
                success: function (res) {
                    if (res.code == 1) {
                        for (var i = 0; i < cityArr.length; i++) {
                            let compid = cityArr[i];
                            var newdata = {};
                            newdata[compid + '.areaList'] = res.citylist;
                            pageInstance.setData(newdata);
                        }
                    }
                }
            })
        }
        var shopArr = pageInstance.shopArr;
        if (shopArr.length > 0) {
            var newdata = {};
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < shopArr.length; i++) {
                                var compid = shopArr[i].name;
                                newdata[compid + '.lat'] = lat;
                                newdata[compid + '.lng'] = lng;
                                newdata[compid + '.location_address'] = res.province + res.city + res.district + res.street;
                                pageInstance.setData(newdata);
                                that.shopInfo(shopArr[i].nid, compid);
                            }
                        }
                    })
                },
                fail: function (res) {
                    for (var i = 0; i < shopArr.length; i++) {
                        var compid = shopArr[i].name;
                        newdata[compid + '.lat'] = '';
                        newdata[compid + '.lng'] = '';
                        pageInstance.setData(newdata);
                        that.shopInfo(shopArr[i].nid, compid);
                    }
                }
            })
        }
        var groupGoodsArr = pageInstance.groupGoodsArr;
        for (var i = 0; i < groupGoodsArr.length; i++) {
            let compid = groupGoodsArr[i].name;
            let type = groupGoodsArr[i].nid;
            let orderType = groupGoodsArr[i].orderType;
            let shownum = groupGoodsArr[i].shownum;
            let bindObj = groupGoodsArr[i].bindObj || 0;
            let classtype = groupGoodsArr[i].classtype || 1;
            let labelid = groupGoodsArr[i].labelid || '';
            var selshop = groupGoodsArr[i].selshop;
            var child_id = -1;
            if (selshop == 0) {
                child_id = groupGoodsArr[i].childid;
            }
            this.loadGroupgoodData(compid, type, orderType, shownum, bindObj, 1, classtype, labelid, child_id);
        }
        var carouselArr = pageInstance.carouselArr;
        if (carouselArr.length > 0) {
            for (let i = 0; i < carouselArr.length; i++) {
                let compid = carouselArr[i].compid;
                let carouselObj = carouselArr[i].carouselObj;
                that.sendRequest({
                    url: '/webapp/carouselsInit',
                    data: {
                        carouselObj: carouselObj
                    },
                    method: 'post',
                    success: function (res) {
                        if (res.code == 1) {
                            pageInstance.setData({
                                [`${compid}.content`]: res.content
                            });
                        }
                    }
                });
            }
        }
        var goodsClaArr = pageInstance.goodsClaArr;
        for (var i = 0; i < goodsClaArr.length; i++) {
            let name = goodsClaArr[i].name;
            let bindObj = goodsClaArr[i].bindObj;
            this.loadGoodsCla(name, bindObj);
        }
        var listDetailArr = pageInstance.listDetailArr;
        for (var i = 0; i < listDetailArr.length; i++) {
            let compid = listDetailArr[i];
            let listid = pageInstance.data.listId;
            that.sendRequest({
                url: '/webapp/get_onedata',
                data: {
                    id: listid
                },
                method: 'post',
                success: function (res) {
                    if (res.code == 1) {
                        for (var t in res.listdata) {
                            var description = res.listdata[t];
                            var reg = /^[\d]+$/;
                            var isnum = reg.test(description);
                            if (typeof description == 'string' && !/^(http:||https:)\/\//g.test(description) && description != '' && !isnum) {
                                res.listdata[t] = WxParse.wxParse('default', 'html', description, pageInstance);
                                res.listdata[t][0].type = 'obj';
                            }
                        }
                        pageInstance.setData({
                            [`${compid}.formdata`]: res.listdata
                        });
                    }
                }
            });
        }
        var productArr = pageInstance.productArr;
        for (var i = 0; i < productArr.length; i++) {
            let compid = productArr[i].name;
            let nid = productArr[i].nid;
            let shownum = productArr[i].shownum;
            let orderType = productArr[i].orderType;
            this.loadProduct(compid, nid, orderType, shownum);
        }
        var takeoutShopArr = pageInstance.takeoutShopArr;
        if (takeoutShopArr.length > 0) {
            var newdata = {};
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < takeoutShopArr.length; i++) {
                                var compid = takeoutShopArr[i].name;
                                var shownum = takeoutShopArr[i].shownum;
                                newdata[compid + '.lat'] = lat;
                                newdata[compid + '.lng'] = lng;
                                newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                newdata[compid + '.loaded'] = true;
                                newdata[compid + '.loaddata'] = false;
                                newdata[compid + '.classidx'] = -1;
                                newdata[compid + '.storeType'] = [];
                                pageInstance.setData(newdata);
                                that.takshopInfo(compid, shownum);
                            }
                        }
                    })
                },
                fail: function (res) {
                    for (var i = 0; i < takeoutShopArr.length; i++) {
                        var compid = takeoutShopArr[i].name;
                        var shownum = takeoutShopArr[i].shownum;
                        newdata[compid + '.lat'] = '';
                        newdata[compid + '.lng'] = '';
                        newdata[compid + '.address'] = '';
                        newdata[compid + '.loaded'] = true;
                        newdata[compid + '.classidx'] = -1;
                        newdata[compid + '.storeType'] = [];
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        var distributeArr = pageInstance.distributeArr;
        for (var i = 0; i < distributeArr.length; i++) {
            let compid = distributeArr[i].name;
            pageInstance.setData({
                [`${compid}.typeIndex`]: '',
                [`${compid}.distname`]: '',
                [`${compid}.isactive`]: false,
                [`${compid}.goodlist`]: [],
                [`${compid}.number`]: 1
            })
            this.loadDistGoods(compid);
        }
        var newgoodsArr = pageInstance.newgoodsArr;
        for (var i = 0; i < newgoodsArr.length; i++) {
            let compid = newgoodsArr[i].name;
            pageInstance.setData({
                [`${compid}.goodtype`]: [],
                [`${compid}.goodlist`]: [],
                [`${compid}.loaded`]: false,
                [`${compid}.isloaded`]: false,
                [`${compid}.searchtxt`]: '',
                [`${compid}.status`]: 0,
                [`${compid}.issel`]: 0
            })
            this.loadNewGoodsList(compid);
        }
        var serviceArr = pageInstance.serviceArr;
        for (var i = 0; i < serviceArr.length; i++) {
            this.loadservice(serviceArr[i].name, serviceArr[i].nid);
        }
        var techArr = pageInstance.techArr;
        for (var i = 0; i < techArr.length; i++) {
            this.loadtech(techArr[i].name, techArr[i].nid);
        }
        var appointShopArr = pageInstance.appointShopArr;
        if (appointShopArr.length > 0) {
            var newdata = {};
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < appointShopArr.length; i++) {
                                var compid = appointShopArr[i].name;
                                newdata[compid + '.lat'] = lat;
                                newdata[compid + '.lng'] = lng;
                                newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                newdata[compid + '.loaded'] = true;
                                newdata[compid + '.classidx'] = -1;
                                newdata[compid + '.storeType'] = [];
                                pageInstance.setData(newdata);
                                that.appointshopInfo(compid);
                            }
                        }
                    })
                },
                fail: function (res) {
                    for (var i = 0; i < appointShopArr.length; i++) {
                        var compid = appointShopArr[i].name;
                        newdata[compid + '.lat'] = '';
                        newdata[compid + '.lng'] = '';
                        newdata[compid + '.address'] = '';
                        newdata[compid + '.loaded'] = true;
                        newdata[compid + '.classidx'] = -1;
                        newdata[compid + '.storeType'] = [];
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        var bargainArr = pageInstance.bargainArr;
        for (var i = 0; i < bargainArr.length; i++) {
            var compid = bargainArr[i].name;
            var nid = bargainArr[i].nid;
            this.loadbargain(compid, nid);
        }
        var subGoodsArr = pageInstance.subGoodsArr;
        for (var i = 0; i < subGoodsArr.length; i++) {
            var compid = subGoodsArr[i].name;
            this.loadSubGoods(compid);
        }
        var cityMerArr = pageInstance.cityMerArr;
        if (cityMerArr.length > 0) {
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    for (var i = 0; i < cityMerArr.length; i++) {
                        var compid = cityMerArr[i].name;
                        let newdata = {};
                        newdata[compid + '.lat'] = lat;
                        newdata[compid + '.lng'] = lng;
                        newdata[compid + '.classidx'] = -1;
                        pageInstance.setData(newdata);
                        that.loadcityMer(compid);
                    }
                },
                fail: function (res) {
                    for (var i = 0; i < cityMerArr.length; i++) {
                        var compid = cityMerArr[i].name;
                        let newdata = {};
                        newdata[compid + '.lat'] = 0;
                        newdata[compid + '.lng'] = 0;
                        newdata[compid + '.classidx'] = -1;
                        pageInstance.setData(newdata);
                        that.loadcityMer(compid);
                    }
                }
            })
        }
        var newdistributeArr = pageInstance.newdistributeArr;
        for (var i = 0; i < newdistributeArr.length; i++) {
            let compid = newdistributeArr[i].name;
            pageInstance.setData({
                [`${compid}.typeIndex`]: '',
                [`${compid}.distname`]: '',
                [`${compid}.isactive`]: false,
                [`${compid}.goodlist`]: [],
                [`${compid}.number`]: 1
            })
            this.loadNewDistGoods(compid);
        }
        var couponlistArr = pageInstance.couponlistArr;
        for (var i = 0; i < couponlistArr.length; i++) {
            let compid = couponlistArr[i].name;
            pageInstance.setData({
                [`${compid}.couponlist`]: [],
                [`${compid}.loaded`]: false,
                [`${compid}.nothing`]: false,
                [`${compid}.prenum`]: 0,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1
            })
            this.loadCouponList(compid);
        }
        var goodsShopArr = pageInstance.goodsShopArr;
        if (goodsShopArr.length > 0) {
            var newdata = {};
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < goodsShopArr.length; i++) {
                                var compid = goodsShopArr[i].name;
                                newdata[compid + '.lat'] = lat;
                                newdata[compid + '.lng'] = lng;
                                newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                newdata[compid + '.loaded'] = true;
                                newdata[compid + '.classidx'] = -1;
                                newdata[compid + '.storeType'] = [];
                                pageInstance.setData(newdata);
                                that.goodsshopInfo(compid);
                            }
                        }
                    })
                },
                fail: function (res) {
                    for (var i = 0; i < goodsShopArr.length; i++) {
                        var compid = goodsShopArr[i].name;
                        newdata[compid + '.lat'] = '';
                        newdata[compid + '.lng'] = '';
                        newdata[compid + '.address'] = '';
                        newdata[compid + '.loaded'] = true;
                        newdata[compid + '.classidx'] = -1;
                        newdata[compid + '.storeType'] = [];
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        var houseApartArr = pageInstance.houseApartArr;
        if (houseApartArr.length > 0) {
            for (var i = 0; i < houseApartArr.length; i++) {
                let compid = houseApartArr[i].name;
                pageInstance.setData({
                    [`${compid}.loaded`]: false,
                    [`${compid}.nothing`]: false,
                    [`${compid}.navlist`]: ['房型预订', '住客点评', '酒店详情'],
                    [`${compid}.navIdx`]: 0,
                    [`${compid}.inDate`]: '',
                    [`${compid}.outDate`]: '',
                    [`${compid}.night`]: 0,
                    [`${compid}.homeTypeinfo`]: [],
                    [`${compid}.allComment`]: 0,
                    [`${compid}.ave_score`]: 0,
                    [`${compid}.comment`]: [],
                    [`${compid}.hotel`]: '',
                    [`${compid}.now_time`]: '',
                    [`${compid}.enter_time`]: '',
                    [`${compid}.leave_start`]: '',
                    [`${compid}.leave_time`]: '',
                    [`${compid}.describe`]: '',
                    [`${compid}.enter`]: 1
                })
                this.loadHouseAprt(compid);
            }
        }
        var hotelListArr = pageInstance.hotelListArr;
        if (hotelListArr.length > 0) {
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < hotelListArr.length; i++) {
                                var compid = hotelListArr[i].name;
                                let newdata = {};
                                newdata[compid + '.lat'] = lat;
                                newdata[compid + '.lng'] = lng;
                                newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                pageInstance.setData(newdata);
                                that.loadHotelList(compid);
                            }
                        }
                    })
                },
            })
        }
        var hotelSoArr = pageInstance.hotelSoArr;
        if (hotelSoArr.length > 0) {
            this.sendRequest({
                url: '/webhotel/getSearchTime',
                method: 'post',
                data: {
                    enter: 1,
                },
                success: function (res) {
                    for (let i = 0; i < hotelSoArr.length; i++) {
                        let compid = hotelSoArr[i].name;
                        let newdata = {};
                        newdata[compid + '.now_time'] = res.now_time;
                        newdata[compid + '.enter_time'] = res.enter_time;
                        newdata[compid + '.leave_time'] = res.leave_time;
                        newdata[compid + '.enter_range'] = res.enter_range;
                        newdata[compid + '.leave_range'] = res.leave_range;
                        newdata[compid + '.night'] = res.night;
                        newdata[compid + '.leave_start'] = res.leave_starttime;
                        var enter_val = res.enter_time.split('-');
                        var inmonth = enter_val[1];
                        var inday = enter_val[2];
                        newdata[compid + '.inDate'] = inmonth + '月' + inday + '日';
                        var leave_val = res.leave_time.split('-');
                        var outmonth = leave_val[1];
                        var outday = leave_val[2];
                        newdata[compid + '.outDate'] = outmonth + '月' + outday + '日';
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        var videoArr = pageInstance.videoArr;
        if (videoArr.length > 0) {
            for (let i = 0; i < videoArr.length; i++) {
                let compid = videoArr[i].compid;
                let compdata = pageInstance.data[compid];
                if (videoArr[i].urltype != 2) {
                    pageInstance.setData({
                        [`${compid}.videourl`]: compdata.videosrc
                    });
                } else {
                    this.sendRequest({
                        url: '/webapp/getvideo',
                        data: {
                            nid: videoArr[i].urlnid
                        },
                        method: 'post',
                        success: function (res) {
                            if (res.code == 1) {
                                pageInstance.setData({
                                    [`${compid}.videourl`]: res.video.videourl,
                                    [`${compid}.poster`]: res.video.cover,
                                    [`${compid}.covertype`]: res.video.covertype,
                                });
                            }
                        }
                    })
                }
            }
        }
        var appJumpArr = pageInstance.appJumpArr;
        if (appJumpArr.length > 0) {
            for (let i = 0; i < appJumpArr.length; i++) {
                let compid = appJumpArr[i].name;
                let nid = appJumpArr[i].nid;
                if (nid) {
                    this.sendRequest({
                        url: '/webapp/relation',
                        method: 'post',
                        data: {
                            nid: nid,
                        },
                        success: function (res) {
                            let newdata = {};
                            newdata[compid + '.appid'] = res.info.appid;
                            newdata[compid + '.path'] = res.info.url;
                            pageInstance.setData(newdata);
                        }
                    })
                }
            }
        }
        var newAudioArr = pageInstance.newAudioArr;
        if (newAudioArr.length > 0) {
            for (let i = 0; i < newAudioArr.length; i++) {
                let compid = newAudioArr[i].name;
                let nid = newAudioArr[i].urlnid;
                pageInstance.setData({
                    [`${compid}.src`]: 111,
                    [`${compid}.loaded`]: false,
                })
                setTimeout(() => {
                    pageInstance.setData({
                        [`${compid}.loaded`]: true,
                    })
                }, 800)
                this.sendRequest({
                    url: '/webapp/getNoise',
                    method: 'post',
                    data: {
                        nid: nid
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            innerAudioContext.src = res.music.radio;
                            pageInstance.setData({
                                [`${compid}.src`]: res.music.radio,
                                [`${compid}.index`]: i,
                                [`${compid}.urlnid`]: nid,
                                [`${compid}.name`]: res.music.name,
                                [`${compid}.author`]: res.music.author,
                                [`${compid}.cover`]: res.music.cover,
                                [`${compid}.isMusic`]: false,
                                [`${compid}.isMusic2`]: true,
                                [`${compid}.startTime`]: '00:00',
                                [`${compid}.endTime`]: res.music.duration,
                                [`${compid}.proWidth`]: 0,
                            });
                        } else {
                            pageInstance.setData({
                                [`${compid}.name`]: '音频名称',
                                [`${compid}.author`]: '作者名称',
                                [`${compid}.isMusic`]: false,
                                [`${compid}.isMusic2`]: true,
                                [`${compid}.startTime`]: '00:00',
                                [`${compid}.endTime`]: '00:00',
                                [`${compid}.proWidth`]: 0,
                            });
                        }
                    }
                })
            }
        }
        var busicardArr = pageInstance.busicardArr;
        if (busicardArr.length > 0) {
            for (let i = 0; i < busicardArr.length; i++) {
                let compid = busicardArr[i].name;
                this.loadbusicard(compid);
            }
        }
    },
    pageInitial: function () {
        this.getNowPage().dataInitial();
    },
    addReadArticle: function (id) {
        this.sendRequest({
            url: '/webapp/addReadArticle',
            data: {
                id: id
            },
            method: 'post',
            success: function (res) { }
        })
    },
    inputChange: function (e) {
        let dataset = this.getset(e);
        let value = e.detail.value;
        let pageInstance = this.getNowPage();
        let datakey = dataset.datakey;
        let segment = dataset.segment;
        let compid = dataset.compid;
        let formcompid = dataset.formcompid;
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            });
            return;
        }
        var newdata = {};
        newdata[datakey] = value;
        newdata[compid + '.value'] = value;
        pageInstance.setData(newdata);
    },
    bindScoreChange: function (e) {
        let dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        let datakey = dataset.datakey;
        let value = dataset.score;
        let compid = dataset.compid;
        let formcompid = dataset.formcompid;
        let segment = dataset.segment;
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            });
            return;
        }
        var newdata = {};
        newdata[datakey] = value;
        newdata[compid + '.editScore'] = value;
        pageInstance.setData(newdata);
    },
    bindSelectChange: function (e) {
        let dataset = this.getset(e);
        let value = e.detail.value;
        let pageInstance = this.getNowPage();
        let datakey = dataset.datakey;
        let segment = dataset.segment;
        let selectnum = dataset.selectnum;
        let formcompid = dataset.formcompid;
        let compid = dataset.compid;
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            });
            return;
        }
        var newdata = {};
        if (typeof value == 'object') {
            var str = '';
            if (value.length > selectnum) {
                this.showModal({
                    content: '亲~只能勾选' + selectnum + '个，超出规定选项的我们将以最先勾选的选项为主。'
                });
            }
            for (var item in value) {
                if (item < selectnum) {
                    str = str + value[item] + ',';
                }
            }
            value = str;
        }
        newdata[datakey] = value;
        newdata[compid + '.value'] = value;
        pageInstance.setData(newdata);
    },
    uploadFormImg: function (e) {
        let dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        let compid = dataset.compid;
        let formcompid = dataset.formcompid;
        let datakey = dataset.datakey;
        let segment = dataset.segment;
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            })
            return;
        }
        this.chooseImage(function (res) {
            let img_src = res;
            let newdata = {};
            newdata[datakey] = img_src;
            newdata[compid + '.display_upload'] = false;
            newdata[compid + '.content'] = img_src;
            newdata[compid + '.value'] = img_src;
            newdata[compid + '.piccontent'] = img_src;
            pageInstance.setData(newdata);
        });
    },
    chooseImage: function (callback, count) {
        wx.chooseImage({
            count: count || 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePaths = res.tempFilePaths;
                that.toast({
                    title: '提交中...',
                    icon: 'loading',
                    duration: 10000
                });
                for (var i = 0; i < tempFilePaths.length; i++) {
                    wx.uploadFile({
                        url: that.globalData.siteBaseUrl + '/webapp/uploadImage',
                        filePath: tempFilePaths[i],
                        name: 'img_data',
                        success: function (res) {
                            var data = JSON.parse(res.data);
                            if (data.code == 1) {
                                var imageUrls = data.imgurl;
                                that.hideToast();
                                typeof callback == 'function' && callback(imageUrls);
                            } else {
                                that.showModal({
                                    content: data.msg
                                })
                            }
                        },
                        fail: function (res) {
                        }
                    })
                }
            }
        })
    },
    bindDateChange: function (e) {
        let dataset = this.getset(e);
        let value = e.detail.value;
        let pageInstance = this.getNowPage();
        let datakey = dataset.datakey;
        let compid = dataset.compid;
        let formcompid = dataset.formcompid;
        let segment = dataset.segment;
        let newdata = {};
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            });
            return;
        }
        let obj = pageInstance.data[formcompid]['form_data'];
        if (util.isPlainObject(obj)) {
            obj = pageInstance.data[formcompid]['form_data'] = {};
        }
        obj = obj[segment];
        if (!!obj) {
            let date = obj.substr(0, 10);
            let time = obj.substr(11);
            if (obj.length == 16) {
                newdata[datakey] = value + ' ' + time;
                newdata[compid + '.value'] = value + ' ' + time;
            } else if (obj.length == 10) {
                newdata[datakey] = value;
                newdata[compid + '.value'] = value;
            } else if (obj.length == 5) {
                newdata[datakey] = value + ' ' + obj;
                newdata[compid + '.value'] = value + ' ' + obj;
            } else if (obj.length == 0) {
                newdata[datakey] = value;
                newdata[compid + '.value'] = value;
            }
        } else {
            newdata[datakey] = value;
            newdata[compid + '.value'] = value;
        }
        newdata[compid + '.date'] = value;
        pageInstance.setData(newdata);
    },
    bindTimeChange: function (e) {
        let dataset = this.getset(e);
        let value = e.detail.value;
        let pageInstance = this.getNowPage();
        let datakey = dataset.datakey;
        let compid = dataset.compid;
        let formcompid = dataset.formcompid;
        let segment = dataset.segment;
        let newdata = {};
        compid = formcompid + compid.substr(4);
        if (!segment) {
            this.showModal({
                content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
            });
            return;
        }
        let obj = pageInstance.data[formcompid]['form_data'];
        if (util.isPlainObject(obj)) {
            obj = pageInstance.data[formcompid]['form_data'] = {};
        }
        obj = obj[segment];
        if (!!obj) {
            let date = obj.substr(0, 10);
            let time = obj.substr(11);
            if (obj.length == 16) {
                newdata[datakey] = date + ' ' + value;
                newdata[compid + '.value'] = date + ' ' + value;
            } else if (obj.length == 10) { 
                newdata[datakey] = obj + ' ' + value;
                newdata[compid + '.value'] = obj + ' ' + value;
            } else if (obj.length == 5) { 
                newdata[datakey] = value;
                newdata[compid + '.value'] = value;
            } else if (obj.length == 0) {
                newdata[datakey] = value;
                newdata[compid + '.value'] = value;
            }
        } else {
            newdata[datakey] = value;
            newdata[compid + '.value'] = value;
        }
        newdata[compid + '.time'] = value;
        pageInstance.setData(newdata);
    },
    submitForm: function (e) {
        if (!this.globalData.userInfo.avatarUrl) {
            this.openAuthor();
            return;
        }
        let dataset = this.getset(e);
        let formId = e.detail.formId;
        let pageInstance = this.getNowPage();
        let that = this;
        let compid = dataset.compid;
        let form = dataset.form;
        let form_data = pageInstance.data[compid].form_data;
        var content = pageInstance.data[compid].content;
        for (var i = 0; i < content.length; i++) {
            if (content[i].isneed == 2) {
                if (!content[i].value) {
                    if (content[i].type == 'singletext' || content[i].type == 'multitext') {
                        that.showModal({
                            content: '请输入内容',
                        })
                    } else if (content[i].type == 'laydate') {
                        that.showModal({
                            content: '请选择时间',
                        })
                    } else if (content[i].type == 'option') {
                        that.showModal({
                            content: '请选择选项',
                        })
                    } else {
                        that.showModal({
                            content: '请选择图片',
                        })
                    }
                    return;
                }
            }
        }
        form_data = JSON.stringify(form_data);

        if (!util.isPlainObject(form_data)) {
            if (pageInstance.data[compid].submitting) return;
            let newdata = {};
            newdata[compid + '.submitting'] = true;
            pageInstance.setData(newdata);
            if (paysubmit) {
                return;
            }
            paysubmit = true;
            that.sendRequest({
                url: '/webapp/saveformdata',
                data: {
                    form: form,
                    form_data: form_data,
                    nickname: that.globalData.userInfo['nickName'],
                    formid: formId
                },
                header: { 'content-type': 'application/x-www-form-urlencoded;' },
                method: 'POST',
                success: function (res) {
                    if (res.code == 1) {
                        that.showModal({
                            content: '信息提交成功',
                            confirm(){
                                paysubmit = false;
                                newdata[compid + '.submitting'] = false;
                                pageInstance.setData(newdata);
                            }
                        });
                    } else if (res.code == 3) {
                        that.showModal({
                            content: res.msg,
                            confirm(){
                                paysubmit = false;
                                newdata[compid + '.submitting'] = false;
                                pageInstance.setData(newdata);
                            }
                        })
                    } else if (res.code == 5) {
                        that.showModal({
                            content: '该小程序暂无设置支付',
                            confirm(){
                                paysubmit = false;
                                newdata[compid + '.submitting'] = false;
                                pageInstance.setData(newdata);
                            }
                        })
                    } else if (res.code == 200) {
                        wx.requestPayment({
                            timeStamp: res.payinfo.timeStamp,
                            nonceStr: res.payinfo.nonceStr,
                            package: res.payinfo.package,
                            signType: res.payinfo.signType,
                            paySign: res.payinfo.paySign,
                            success: function (data) {
                                that.showModal({
                                    content: '支付成功',
                                    confirm(){
                                        paysubmit = false;
                                        newdata[compid + '.submitting'] = false;
                                        pageInstance.setData(newdata);
                                    }
                                });
                            },
                            fail: function () {
                                paysubmit = false;
                            }
                        })
                    }
                },
                complete: function () {
                    let newdata = {};
                    newdata[compid + '.submitting'] = false;
                    pageInstance.setData(newdata);
                }
            })
        } else {
            that.showModal({
                content: '这个表单什么都没填写哦！'
            });
        }
    },
    saveBaseInfo: function (uInfo) {
        this.sendRequest({
            url: '/webapp/saveBaseInfo',
            data: {
                name: uInfo.name,
                phone: uInfo.phone,
                qq: uInfo.qq
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    wx.navigateBack();
                }
            }
        })
    },
    addIplog: function () {
        this.sendRequest({
            url: '/webapp/addIplog',
            data: {},
            method: 'POST',
            success: function (res) {
            }
        });
    },
    MapEdit: function (e) {
        let dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        let compid = dataset.compid;
        let showmap = dataset.showmap;
        let newdata = {};
        newdata[compid + '.showmap'] = !showmap;
        pageInstance.setData(newdata);
    },
    submitComment: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid || 1;
        var cname = dataset.cname || '自由评论';
        var cid = dataset.cid;
        let pageInstance = that.getNowPage();
        var value = pageInstance.data[compid].commentText;
        if (!value || !value.trim()) {
            that.showModal({
                content: '请输入评论内容'
            })
            return;
        }
        that.sendRequest({
            url: '/webapp/saveComment',
            data: {
                content: value,
                openid: that.globalData.sessionKey,
                avatar: that.globalData.userInfo.avatarUrl,
                nickname: that.globalData.userInfo.nickName,
                cid: cid,
                cname: cname
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    var cont = {
                        headurl: res.avatar,
                        username: res.nickname,
                        zan: 0,
                        addtime: res.addtime,
                        text: value,
                        content: [],
                        commentId: res.id,
                        replyshow: false,
                    };
                    var newdata = {};
                    var oldcomment = pageInstance.data[compid].commentlist || [];
                    newdata[compid + '.commentlist'] = oldcomment.concat([cont]);
                    newdata[compid + '.total'] = pageInstance.data[compid].total || 0 + 1;
                    newdata[compid + '.commentText'] = '';
                    pageInstance.setData(newdata);
                    that.toast({
                        title: res.msg,
                        duration: 2000
                    });
                }
            }
        })
    },
    commentZan: function (e) {
        var dataset = this.getset(e);
        let pageInstance = that.getNowPage();
        var cid = dataset.id;
        var datakey = dataset.datakey;
        that.sendRequest({
            url: '/webapp/saveZan',
            data: {
                openid: that.globalData.sessionKey,
                cid: cid
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    newdata[datakey + '.zan'] = res.nums;
                    pageInstance.setData(newdata);
                } else if (res.code == 3) {
                    that.showModal({
                        content: '你已经点赞过来！'
                    })
                }
            }
        });
    },
    clickReply: function (e) {
        var dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        var datakey = dataset.datakey;
        var text = dataset.text;
        var newdata = {};
        newdata[datakey + '.replyContent'] = text;
        pageInstance.setData(newdata);
    },
    submitReply: function (e) {
        var dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        var id = dataset.id;
        var compid = dataset.compid;
        var idx = dataset.idx;
        var comment_id = dataset.cid || 1;
        var cname = dataset.cname || '自由评论';
        var content = pageInstance.data[compid].commentlist[idx].replyContent;
        if (!content || !content.trim()) {
            this.showModal({
                content: '请输入评论内容'
            })
            return;
        }
        this.sendRequest({
            url: '/webapp/saveReplayToCommon',
            data: {
                cid: id,
                content: content,
                openid: that.globalData.sessionKey,
                avatar: that.globalData.userInfo.avatarUrl,
                nickname: that.globalData.userInfo.nickName,
                comment_id: comment_id,
                cname: cname
            },
            method: 'POST',
            success: function (res) {
                var cont = {
                    headurl: res.avatar,
                    username: res.nickname,
                    zan: 0,
                    addtime: res.addtime,
                    text: content,
                };
                var newdata = {};
                var oldcomment = pageInstance.data[compid].commentlist[idx].content || [];
                var replaynum = pageInstance.data[compid].commentlist[idx].replaynum || 0;
                newdata[compid + '.commentlist[' + idx + '].content'] = oldcomment.concat([cont]);
                newdata[compid + '.commentlist[' + idx + '].replaynum'] = replaynum + 1;
                newdata[compid + '.commentlist[' + idx + '].replyContent'] = '';
                pageInstance.setData(newdata);
                that.toast({
                    title: res.msg,
                    duration: 2000
                });
            }
        });
    },
    commentData: function (compid, cid) {
        let pageInstance = this.getNowPage();
        var page = pageInstance.data[compid].page;
        this.sendRequest({
            url: '/webapp/clickCommentList',
            data: {
                pageNum: page,
                cid: cid
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    for (var i = 0; i < res.commentlist.length; i++) {
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].headurl'] = res.commentlist[i].pic;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].username'] = res.commentlist[i].nickname;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].zan'] = res.commentlist[i].likes;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].addtime'] = res.commentlist[i].newtime;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].text'] = res.commentlist[i].content;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].content'] = [];
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].commentId'] = res.commentlist[i].id;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].replyshow'] = false;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].page'] = 1;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].needload'] = true;
                        newdata[compid + '.commentlist[' + (i + (page - 1) * 5) + '].replaynum'] = res.commentlist[i].nums;
                    }
                    newdata[compid + '.total'] = res.total;
                    newdata[compid + '.page'] = page + 1;
                    newdata[compid + '.remainNum'] = res.haveComment;
                    pageInstance.setData(newdata);
                }
            }
        })
    },
    showReply: function (e) {
        let dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        var idx = dataset.idx;
        var id = dataset.id;
        var compid = dataset.compid;
        var needload = dataset.needload;
        var newdata = {};
        if (!needload) {
            newdata[compid + '.commentlist[' + idx + '].replyshow'] = true;
            pageInstance.setData(newdata);
            return false;
        }
        var page = pageInstance.data[compid].commentlist[idx].page;
        this.sendRequest({
            url: '/webapp/clickReplayList',
            data: {
                cid: id,
                pageNum: page
            },
            method: "POST",
            success: function (res) {
                if (res.code == 1) {
                    for (var i = 0; i < res.replaylist.length; i++) {
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].text'] = res.replaylist[i].content;
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].headurl'] = res.replaylist[i].pic;
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].username'] = res.replaylist[i].nickname;
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].addtime'] = res.replaylist[i].newtime;
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].commentId'] = res.replaylist[i].id;
                        newdata[compid + '.commentlist[' + idx + '].content[' + (i + (page - 1) * 5) + '].zan'] = res.replaylist[i].likes;
                    }
                    newdata[compid + '.commentlist[' + idx + '].replyshow'] = true;
                    newdata[compid + '.commentlist[' + idx + '].needload'] = false;
                    newdata[compid + '.commentlist[' + idx + '].remianNum'] = res.have;
                    newdata[compid + '.commentlist[' + idx + '].page'] = page + 1;
                    pageInstance.setData(newdata);
                }
            }
        });
    },
    hideReply: function (e) {
        var dataset = this.getset(e);
        let pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var idx = dataset.idx;
        var newdata = {};
        newdata[compid + '.commentlist[' + idx + '].replyshow'] = false;
        pageInstance.setData(newdata);
    },
    dynamicListData: function (compid, nid) {
        let pageInstance = this.getNowPage();
        var curpage = pageInstance.data[compid].curpage || 1;
        var surplus = pageInstance.data[compid].surplus || 1;
        var content = pageInstance.data[compid].searchtext || '';
        var bindseg = pageInstance.data[compid].seachsegment || '';
        var selected = pageInstance.data[compid].selected || 0;
        var sortNid = pageInstance.data[compid].sortContent[selected].segment;
        var sortOrder = pageInstance.data[compid].sortContent[selected].mode;
        if (surplus <= 0) {
            return;
        }
        this.sendRequest({
            url: '/Webapp/getDataList',
            data: {
                pageNum: curpage,
                fnid: nid,
                content: content,
                name: bindseg,
                sortNid: sortNid,
                sortOrder: sortOrder
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    newdata[compid + '.surplus'] = res.more;
                    newdata[compid + '.curpage'] = curpage + 1;
                    var reg = /^\d+(\.\d+)?$/;
                    for (var i in res.datalist) {
                        for (var j in res.datalist[i].formdata) {
                            var description = res.datalist[i].formdata[j];
                            if (typeof description == 'string' && !/^(http:||https:)\/\//g.test(description) && !reg.test(description)) {
                                res.datalist[i].formdata[j] = WxParse.wxParse('default', 'html', description, pageInstance);
                                if (res.datalist[i].formdata[j].length > 0) {
                                    res.datalist[i].formdata[j][0].type = 'obj';
                                }
                            }
                        }
                    }
                    var oldlist = pageInstance.data[compid].formdata;
                    if (!oldlist) {
                        newdata[compid + '.formdata'] = res.datalist;
                    } else {
                        newdata[compid + '.formdata'] = oldlist.concat(res.datalist);
                    }
                    pageInstance.setData(newdata);
                }
            }
        });
    },
    tagLbSearch: function (text, compid) {
        let pageInstance = this.getNowPage();
        var newdata = {};
        newdata[compid + '.formdata'] = [];
        newdata[compid + '.searchtext'] = text;
        newdata[compid + '.inputText'] = text;
        newdata[compid + '.curpage'] = 1;
        newdata[compid + '.surplus'] = 1;
        newdata[compid + '.searchNothing'] = true;
        pageInstance.setData(newdata);
        pageInstance.prevPage = 0;
    },
    clickLbSearch: function (text, compid) {
        let pageInstance = this.getNowPage();
        var newdata = {};
        newdata[compid + '.formdata'] = [];
        newdata[compid + '.searchtext'] = text;
        newdata[compid + '.curpage'] = 1;
        newdata[compid + '.surplus'] = 1;
        newdata[compid + '.searchNothing'] = true;
        pageInstance.setData(newdata);
        pageInstance.prevPage = 0;
    },
    changeCount: function (dataset) {
        let pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var countid = dataset.countid;
        var total = dataset.total;
        var icon = dataset.icon;
        icon = icon.split('-active')[0];
        let nickname = this.globalData.userInfo.nickName;
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/webapp/clickCount',
            data: {
                countid: countid,
                nickname: nickname,
                openid: openid
            },
            method: 'POST',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    if (res.hascount == 1) {
                        total--;
                    } else {
                        total++;
                        icon = icon + '-active';
                    }
                    newdata[compid + '.total'] = total;
                    newdata[compid + '.icon'] = icon;
                    newdata[compid + '.isclick'] = false;
                    pageInstance.setData(newdata);
                }
            }
        });
    },
    sortListFunc: function (dataset) {
        let pageInstance = this.getNowPage();
        var idx = dataset.idx;
        var compid = dataset.compid;
        var selected = pageInstance.data[compid].selected;
        var newdata = {};
        if (idx == selected) {
            var mode = pageInstance.data[compid].sortContent[idx].mode;
            if (mode == 'asc') {
                mode = 'desc';
            } else {
                mode = 'asc';
            }
            newdata[compid + '.sortContent[' + idx + '].mode'] = mode;
        } else {
            newdata[compid + '.selected'] = idx;
        }
        newdata[compid + '.formdata'] = [];
        newdata[compid + '.curpage'] = 1;
        newdata[compid + '.surplus'] = 1;
        pageInstance.setData(newdata);
        pageInstance.prevPage = 0;
    },
    backhome: function () {
        var homepageRouter = this.getHomepageRouter();
        var tabBarPagePathArr = this.globalData.tabBarPagePathArr;
        var url = '/pages/' + homepageRouter + '/' + homepageRouter;
        if (tabBarPagePathArr.indexOf(url) != -1) {
            this.switchToTab(url);
        } else {
            this.reLaunchToTab(url);
        }
    },
    reLaunchToTab: function (url) {
        wx.reLaunch({
            url: url
        })
    },
    bindCityChange: function (e) {
        let val = e.detail.value;
        let id = this.getset(e).id;
        let pageInstance = this.getNowPage();
        let newdata = pageInstance.data;
        let cityList = newdata[id].areaList;
        if (!newdata[id].newlocal) {
            if (newdata[id].value[0] == val[0]) {
                newdata[id].province = pageInstance.data[id].provinces[val[0]] == '请选择' ? '' : pageInstance.data[id].provinces[val[0]];
                newdata[id].citys = newdata[id].province == '' ? ['请选择'] : this.getCityList(cityList[val[0] - 1].cities);
                newdata[id].city_ids = newdata[id].province == '' ? [null] : this.getCityList(cityList[val[0] - 1].cities, 1);
                newdata[id].city = newdata[id].province == '' ? '' : newdata[id].citys[val[1]];
                newdata[id].districts = newdata[id].city == '' ? ['请选择'] : this.getCityList(cityList[val[0] - 1].cities[val[1]].towns);
                newdata[id].district_ids = newdata[id].city == '' ? [null] : this.getCityList(cityList[val[0] - 1].cities[val[1]].towns, 1);
                newdata[id].region_id = newdata[id].district_ids[val[2]];
                newdata[id].city_id = newdata[id].city_ids[val[1]];
                newdata[id].district = newdata[id].city == '' ? '' : newdata[id].districts[val[2]];
                newdata[id].value = val;
            } else {
                newdata[id].province = pageInstance.data[id].provinces[val[0]] == '请选择' ? '' : pageInstance.data[id].provinces[val[0]];
                newdata[id].citys = newdata[id].province == '' ? ['请选择'] : this.getCityList(cityList[val[0] - 1].cities);
                newdata[id].city_ids = newdata[id].province == '' ? [null] : this.getCityList(cityList[val[0] - 1].cities, 1);
                newdata[id].city = newdata[id].province == '' ? '' : newdata[id].citys[0];
                newdata[id].districts = newdata[id].city == '' ? ['请选择'] : this.getCityList(cityList[val[0] - 1].cities[0].towns);
                newdata[id].district_ids = newdata[id].city == '' ? [null] : this.getCityList(cityList[val[0] - 1].cities[0].towns, 1);
                newdata[id].region_id = newdata[id].district_ids[val[2]];
                newdata[id].city_id = newdata[id].city_ids[val[1]];
                newdata[id].district = newdata[id].city == '' ? '' : newdata[id].districts[val[2]];
                newdata[id].value = val;
            }
            pageInstance.setData(newdata)
        }
    },
    getCityList: function (province, id) {
        let cityList = [],
            cityList_id = [];
        for (let i in province) {
            if (typeof (province[i]) == 'object') {
                cityList.push(province[i].name)
                cityList_id.push(province[i].id);
            } else {
                cityList[1] = province.name;
                cityList_id[1] = province.id;
            }
        }
        if (id) {
            return cityList_id;
        } else {
            return cityList;
        }
    },
    submitCity: function (e) {
        var dataset = this.getset(e);
        var id = dataset.id;
        var bindlist = dataset.glist;
        let pageInstance = this.getNowPage();
        let newdata = pageInstance.data;
        if (!newdata[id].district) {
            this.showModal({ content: '您未选择城市!' });
            newdata[id].province = '';
            newdata[id].city = '';
            newdata[id].district = '';
        } else {
            var nid = newdata[bindlist].listid;
            newdata[id].hidden = false;
            newdata[id].newlocal = newdata[id].province + ' ' + newdata[id].city + ' ' + newdata[id].district;
            newdata[id].value = [0, 0, 0];
            this.sendRequest({
                url: '/webapp/get_country_goods',
                method: 'post',
                data: {
                    country_id: newdata[id].region_id,
                    city_id: newdata[id].city_id,
                    nid: nid
                },
                success: function (res) {
                    if (res.code == 1) {
                        newdata[bindlist].content = res.goods;
                        newdata[bindlist].bindObj = 0;
                        pageInstance.setData(newdata);
                    } else {
                        newdata[bindlist].content = [];
                        newdata[bindlist].areanothing = true;
                        newdata[bindlist].bindObj = 0;
                        pageInstance.setData(newdata);
                    }
                }
            })
        }
        pageInstance.setData(newdata);
    },
    cancelCity: function (e) {
        let id = this.getset(e).id;
        let pageInstance = this.getNowPage();
        let newdata = pageInstance.data;
        newdata[id].hidden = false;
        newdata[id].province = '';
        newdata[id].city = '';
        newdata[id].district = '';
        pageInstance.setData(newdata);
    },
    selectLocal: function (e) {
        var id = this.getset(e).id;
        let pageInstance = this.getNowPage();
        let newdata = pageInstance.data;
        newdata[id].hidden = true;
        newdata[id].provinces = ['请选择']; newdata[id].citys = ['请选择']; newdata[id].districts = ['请选择']
        newdata[id].provinces_ids = [null]; newdata[id].city_ids = [null]; newdata[id].district_ids = [null];
        for (var i in newdata[id].areaList) {
            newdata[id].provinces.push(newdata[id].areaList[i].name);
            newdata[id].provinces_ids.push(newdata[id].areaList[i].region_id);
        }
        newdata[id].newlocal = '';
        pageInstance.setData(newdata);
    },
    pointSign: function () {
        let pageInstance = this.getNowPage();
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/webapp/appSign',
            data: {
                openid: openid
            },
            method: 'POST',
            success: function (res) {
                if (res.code == 1) {
                    var total = pageInstance.data.total;
                    total = total + res.signintegral;
                    pageInstance.setData({
                        sign: true,
                        signintegral: res.signintegral,
                        total: total,
                        integralpromit: '今日签到获得积分' + res.signintegral + '分,\n分享给好友可以获得更多积分',
                        promitTitle: '恭喜',
                        newpertip1: '今日签到',
                        newpertip2: '获得积分' + res.signintegral + '分',
                        newpertip3: '分享给好友可以获得更多积分',
                        newpertype: 1
                    });
                } else if (res.code == 2) {
                    pageInstance.setData({
                        sign: true,
                        integralpromit: '你今天已经签到过了,\n分享给每个好友赠送' + res.shareintegral + '积分,\n每日最多赠送' + res.sharenum + '次',
                        promitTitle: '无法签到',
                        newpertip1: '今天已经签到过了哦！',
                        newpertip2: '分享给每个好友赠送' + res.shareintegral + '积分',
                        newpertip3: '每日最多赠送' + res.sharenum + '次',
                        newpertype: 2
                    });
                } else {
                    this.toast({ title: '授权失败,无法签到' });
                }
            }
        })
    },
    signClose: function () {
        let pageInstance = this.getNowPage();
        pageInstance.setData({
            sign: false
        });
    },
    closeRule: function () {
        let pageInstance = this.getNowPage();
        pageInstance.setData({
            showNcardBg: false,
            showNcard: false
        });
    },
    myMemcard: function () {
        let pageInstance = this.getNowPage();
        this.sendRequest({
            url: '/newapp/appmemcard',
            method: 'post',
            data: {
                openid: that.getSessionKey()
            },
            success: function (res) {
                if (res.code == 2000) {
                    pageInstance.setData({
                        showNcardBg: true,
                        showNcard: true,
                        ncardmsg: '进阶版或高级版即可体验，请到后台升级。'
                    })
                } else if (res.code == 3) {
                    that.showModal({
                        title: ' ',
                        content: '您的个人信息未完善，请到 个人中心-个人信息 页面进行完善',
                        showCancel: true,
                        confirmText: '点我跳转',
                        confirm: function () {
                            var url = '/pages/userinfo/userinfo';
                            that.turnToPage(url);
                        }
                    })
                } else {
                    var url = '/pages/memberCard/memberCard';
                    var tabBarPagePathArr1 = that.globalData.tabBarPagePathArr;
                    if (tabBarPagePathArr1.indexOf(url) != -1) {
                        that.switchToTab(url);
                    } else {
                        that.turnToPage(url);
                    }
                }
            }
        });
    },
    tapFranchiseeLocation: function (event) {
        var dataset = event.currentTarget.dataset;
        var compid = dataset.compid;
        var nid = dataset.nid;
        var pageInstance = this.getNowPage();
        this.chooseLocation({
            success: function (res) {
                var newdata = {};
                newdata[compid + '.location_address'] = res.address;
                newdata[compid + '.lat'] = res.latitude;
                newdata[compid + '.lng'] = res.longitude;
                newdata[compid + '.pagenum'] = 1;
                newdata[compid + '.surplus'] = 1;
                newdata[compid + '.prevPage'] = 0;
                newdata[compid + '.content'] = [];
                pageInstance.setData(newdata);
                that.shopInfo(nid, compid);
            }
        });
    },
    shopInfo: function (nid, compid) {
        var pageInstance = this.getNowPage();
        var pagenum = pageInstance.data[compid].pagenum || 1;
        var surplus = pageInstance.data[compid].surplus;
        if (typeof surplus == 'undefined') {
            surplus = 1;
        }
        var searchContent = pageInstance.data[compid].searchContent || '';
        var lat = pageInstance.data[compid].lat || '';
        var lng = pageInstance.data[compid].lng || '';
        if (surplus <= 0) {
            return;
        }
        that.sendRequest({
            url: '/webapp/shoplist',
            data: {
                pagenum: pagenum,
                nid: nid,
                search: searchContent,
                lat: lat,
                lng: lng
            },
            method: 'post',
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    var oldlist = pageInstance.data[compid].content || [];
                    newdata[compid + '.content'] = oldlist.concat(res.shoplist);
                    newdata[compid + '.pagenum'] = pagenum + 1;
                    newdata[compid + '.surplus'] = res.haveNum;
                    newdata[compid + '.loaded'] = true;
                    pageInstance.setData(newdata);
                } else {
                    newdata[compid + '.loaded'] = true;
                    pageInstance.setData(newdata);
                }
            }
        })
    },
    showMenu: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var oidx = dataset.oidx;
        var data = pageInstance.data[compid];
        if (oidx == data.selected) {
            data.content[oidx].show = !data.content[oidx].show;
        } else {
            data.selected = oidx;
            for (var i = 0; i < data.content.length; i++) {
                data.content[i].show = false;
            }
            data.content[oidx].show = true;
        }
        data.showmenu = data.content[oidx].show;
        data.menucontent = data.content[oidx].tcontent;
        data.menuidx = oidx;
        data.twomenuidx = -1;
        pageInstance.setData({
            [`${compid}`]: data
        })
    },
    selectMenu: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var data = pageInstance.data[compid];
        var oidx = dataset.oidx;
        var tidx = dataset.tidx;
        data.content[oidx].selidx = tidx;
        data.twomenuidx = tidx;
        var handle = dataset.handle;
        pageInstance.setData({
            [`${compid}`]: data
        });
        if (handle == 'tapBack') {
            pageInstance.tapBack();
        } else if (handle == 'tapInnerLinkHandler') {
            pageInstance.tapInnerLinkHandler(e);
        } else if (handle == 'tapPhoneCallHandler') {
            pageInstance.tapPhoneCallHandler(e)
        } else if (handle == 'tapRefresh') {
            pageInstance.tapRefresh();
        } else if (handle == 'bindCommodity') {
            pageInstance.bindCommodity(e);
        } else if (handle == 'bindGoodList') {
            pageInstance.bindGoodList(e);
        } else if (handle == 'bindArticle') {
            pageInstance.bindArticle(e);
        } else if (handle == 'bindExpand') {
            pageInstance.bindExpand(e);
        } else if (handle == 'bindCoupon') {
            pageInstance.bindCoupon(e);
        } else if (handle == 'bindAppointment') {
            pageInstance.bindAppointment(e);
        } else if (handle == 'bindTostore') {
            pageInstance.bindTostore(e);
        } else if (handle == 'bindSonshop') {
            pageInstance.bindSonshop(e);
        } else if (handle == 'bindCommunity') {
            pageInstance.bindCommunity(e);
        } else if (handle == 'bindtakCoupon') {
            pageInstance.bindtakCoupon(e);
        } else if (handle == 'bindBespcoupon') {
            pageInstance.bindBespcoupon(e);
        } else if (handle == 'bindAllCoupon') {
            pageInstance.bindAllCoupon(e);
        } else if (handle == 'bindSeckGoods') {
            pageInstance.bindSeckGoods(e);
        } else if (handle == 'bindGroupgoods') {
            pageInstance.bindGroupgoods(e);
        } else if (handle == 'bindBargaingoods') {
            pageInstance.bindBargaingoods(e);
        } else if (handle == 'bindServer') {
            pageInstance.bindServer(e);
        } else if (handle == 'bindTech') {
            pageInstance.bindTech(e);
        } else if (handle == 'bindSubshop') {
            pageInstance.bindSubshop(e);
        } else if (handle == 'bindRedpacket') {
            pageInstance.bindRedpacket(e);
        } else if (handle == 'bindWeb') {
            pageInstance.bindWeb(e);
        } else if (handle == 'bindTurntable') {
            pageInstance.bindTurntable(e);
        } else if (handle == 'bindBusicard') {
            pageInstance.bindBusicard(e);
        }
    },
    loadtakeout: function (compid, childid) {
        var pageInstance = this.getNowPage();
        var openid = that.getSessionKey();
        var comdata = pageInstance['data'][compid];
        var searchname = comdata['searchname'] || '';
        that.sendRequest({
            url: '/newapp/storeIndex',
            data: {
                goodname: searchname,
                openid: openid,
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1 || res.code == 4) {
                    let newdata = {}
                    newdata[compid + '.allGoods'] = res.allGoods;
                    newdata[compid + '.goodstype'] = res.goodstype;
                    newdata[compid + '.cargoodsnum'] = res.cargoodsnum;
                    newdata[compid + '.activitynum'] = res.activitynum;
                    newdata[compid + '.nowreduce'] = res.activity.nowreduce;
                    newdata[compid + '.coupon'] = res.coupon;
                    newdata[compid + '.storeinfo'] = res.storeinfo;
                    newdata[compid + '.disprice'] = res.disprice;
                    newdata[compid + '.totalprice'] = res.totalprice;
                    newdata[compid + '.evaluate'] = res.storeinfo.evaluate;
                    newdata[compid + '.activityarr'] = res.activity.activity;
                    newdata[compid + '.pageshow'] = true;
                    newdata[compid + '.status'] = res.code;
                    newdata[compid + '.difference'] = (res.storeinfo.minprice - res.totalprice).toFixed(2);
                    let activity1 = '';
                    for (let i = 0; i < res.activity.activity.length; i++) {
                        if (i == res.activity.activity.length - 1) {
                            activity1 += '满' + res.activity.activity[i]['full'] + '减' + res.activity.activity[i]['reduce']
                        } else {
                            activity1 += '满' + res.activity.activity[i]['full'] + '减' + res.activity.activity[i]['reduce'] + '，'
                        }
                    }
                    if (res.storeinfo.takeout_open == 0) {
                        if (res.activity.activity.length > 0) {
                            activity1 += '，外送订单需满' + res.storeinfo.minprice + '起送';
                        } else {
                            activity1 += '外送订单需满' + res.storeinfo.minprice + '起送';
                        }
                    }
                    newdata[compid + '.activity1'] = activity1;
                    for (let i = res.activity.activity.length - 1; i >= 0; i--) {
                        if (parseFloat(res.totalprice) >= parseFloat(res.activity.activity[i].full)) {
                            newdata[compid + '.fullprice'] = res.activity.activity[i].full;
                            newdata[compid + '.reduceprice'] = res.activity.activity[i].reduce;
                            newdata[compid + '.showreduce'] = true;
                            break
                        } else {
                            newdata[compid + '.showreduce'] = false;
                        }
                    }
                    pageInstance.animation.bottom('-600rpx').step();
                    newdata[compid + '.cartanimate'] = pageInstance.animation.export();
                    newdata[compid + '.showcart'] = false;
                    newdata[compid + '.tabanimate'] = pageInstance.animation1.export();
                    newdata[compid + '.arr1'] = ["全部", "待评价", "退款"];
                    newdata[compid + '.arr2'] = ["全部", "待核销", "待评价", "退款"];
                    newdata[compid + '.arr3'] = ["全部", "待送达", "待评价", "已评价", "退款"];
                    var opennum = 0;
                    var bindObj = 0;
                    if (res.storeinfo.takeout_open == 0) {
                        opennum++;
                        bindObj = 0;
                    }
                    if (res.storeinfo.order_open == 0) {
                        opennum++;
                        bindObj = 3;
                    }
                    if (res.storeinfo.oneself_open == 0) {
                        opennum++;
                        bindObj = 2;
                    }
                    if (res.storeinfo.store_open == 0) {
                        opennum++;
                        bindObj = 1;
                    }
                    newdata[compid + '.opennum'] = opennum;
                    newdata[compid + '.bindObj'] = bindObj;
                    newdata[compid + '.bindStatus'] = -1;
                    newdata[compid + '.oprenum'] = 0;
                    newdata[compid + '.opagenum'] = 1;
                    newdata[compid + '.ohavenums'] = 1;
                    newdata[compid + '.orderList'] = [];
                    newdata[compid + '.taktype'] = -1;
                    pageInstance.setData(newdata);
                    if (!!childid) {
                        wx.setNavigationBarTitle({
                            title: res.storeinfo.storename
                        });
                    }
                } else {
                    if (childid) {
                        wx.setNavigationBarTitle({
                            title: res.shopname
                        })
                    }
                    var newdata = {};
                    newdata[compid + '.pageshow'] = true;
                    newdata[compid + '.status'] = res.code;
                    if (res.code == 1000 || res.code == 2000) {
                        wx.setNavigationBarTitle({
                            title: '待升级提示'
                        });
                    }
                    pageInstance.setData(newdata);
                }
            }
        })
    },
    showCart: function (e, childid) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        pageInstance.setData({
            [`${compid}.showcart`]: !comdata.showcart
        });
        if (comdata.showcart) {
            wx.request({
                url: that.globalData.siteBaseUrl + '/takeout/shopCars',
                data: {
                    openid: that.getSessionKey(),
                    app_id: that.globalData.appId,
                    child_id: childid
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded;'
                },
                method: 'post',
                success: function ({ data }) {
                    if (data.code == 1) {
                        pageInstance.setData({
                            [`${compid}.cartlist`]: data.goodlist
                        })
                    } else {
                        pageInstance.setData({
                            [`${compid}.cartlist`]: []
                        })
                    }
                }
            })
            pageInstance.animation.bottom('110rpx').step()
        } else {
            pageInstance.animation.bottom('-600rpx').step()
        }
        pageInstance.setData({
            [`${compid}.cartanimate`]: pageInstance.animation.export()
        })
    },
    choseCart: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.animation.bottom('-600rpx').step()
        pageInstance.setData({
            [`${compid}.showcart`]: false,
            [`${compid}.cartanimate`]: pageInstance.animation.export()
        })
    },
    changeTab: function (compid, num, childid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        pageInstance.setData({
            [`${compid}.takeoutab`]: num
        });
        if (comdata.evaluate == 0) {
            if (num == 0) {
                pageInstance.animation1.left('0rpx').step()
            } else if (num == 1) {
                if (!comdata.firstComment) {
                    this.loadComment(-1, compid, childid)
                    pageInstance.setData({
                        [`${compid}.firstComment`]: true
                    })
                }
                pageInstance.animation1.left('-100%').step()
            } else if (num == 2) {
                var newdata = {};
                newdata[compid + '.bindStatus'] = -1;
                newdata[compid + '.oprenum'] = 0;
                newdata[compid + '.opagenum'] = 1;
                newdata[compid + '.ohavenums'] = 1;
                newdata[compid + '.orderList'] = [];
                newdata[compid + '.taktype'] = -1;
                newdata[compid + '.nothing'] = false;
                pageInstance.setData(newdata);
                var bindobj = comdata.bindObj;
                var bindstatus = comdata.bindStatus;
                this.loadTakOrder(bindobj, bindstatus, compid);
                pageInstance.animation1.left('-200%').step()
            } else if (num == 3) {
                pageInstance.animation1.left('-300%').step()
            }
        } else {
            if (num == 0) {
                pageInstance.animation1.left('0rpx').step()
            } else if (num == 2) {
                pageInstance.animation1.left('-200%').step()
            } else if (num == 3) {
                pageInstance.animation1.left('-300%').step()
                var url = '/pages/takeoutCenter/takeoutCenter?childid=' + childid;
                this.turnToPage(url)
            }
        }
        pageInstance.setData({
            [`${compid}.tabanimate`]: pageInstance.animation1.export()
        })
    },
    loadComment: function (status, compid, childid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var pagenum = pageInstance.pagenum;
        if (pageInstance.havenums == 0) {
            return
        }
        this.sendRequest({
            url: '/takeout/commentList',
            data: {
                status: status,
                pageNum: pagenum,
                child_id: childid
            },
            method: 'post',
            success: function (res) {
                var newdata = {}
                if (res.code == 1) {
                    let oldlist = comdata.commentdata;
                    if (pageInstance.pagenum == 1) {
                        oldlist = [];
                    }
                    newdata[compid + '.commentdata'] = oldlist.concat(res.data);
                    pageInstance.havenums = res.havenums;
                    pageInstance.pagenum = pageInstance.pagenum + 1;
                    newdata[compid + '.goodnum'] = res.goodnum;
                    newdata[compid + '.middlenum'] = res.middlenum;
                    newdata[compid + '.badnum'] = res.badnum;
                    newdata[compid + '.allnum'] = res.allnum;
                    pageInstance.setData(newdata)
                }
                if (res.code == 2) {
                    newdata[compid + '.goodnum'] = res.goodnum;
                    newdata[compid + '.middlenum'] = res.middlenum;
                    newdata[compid + '.badnum'] = res.badnum;
                    newdata[compid + '.allnum'] = res.allnum;
                    newdata[compid + '.commentdata'] = [];
                    pageInstance.setData(newdata);
                }
            }
        })
    },
    changeComment: function (e, childid) {
        var status = this.getset(e).status;
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        if (comdata.commentStatus != status) {
            pageInstance.prenum = 0;
            pageInstance.pagenum = 1;
            pageInstance.havenums = 1
            this.loadComment(status, compid, childid)
        }
        pageInstance.setData({
            [`${compid}.commentStatus`]: status
        })
    },
    loadMoreEval: function (e, childid) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var prenum = pageInstance.prenum;
        var pagenum = pageInstance.pagenum;
        var havenums = pageInstance.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.prenum = pagenum;
            var commentStatus = comdata.commentStatus;
            if (typeof commentStatus == 'undefined') {
                commentStatus = -1
            }
            this.loadComment(commentStatus, compid, childid)
        }
    },
    clearCart: function (e, childid) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        that.showModal({
            content: '清空购物车？',
            showCancel: true,
            confirmText: '清空',
            confirm: function () {
                wx.request({
                    url: that.globalData.siteBaseUrl + '/takeout/delCars',
                    data: {
                        openid: that.getSessionKey(),
                        app_id: that.globalData.appId,
                        child_id: childid
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded;'
                    },
                    method: 'post',
                    success: function ({ data }) {
                        if (data.code == 1) {
                            var newdata = {}
                            let newallGoods = comdata.allGoods;
                            let newgoodstype = comdata.goodstype;
                            for (let i = 0; i < newallGoods.length; i++) {
                                for (let j = 0; j < newallGoods[i].length; j++) {
                                    newallGoods[i][j].carnums = 0
                                }
                            }
                            for (let i = 0; i < newgoodstype.length; i++) {
                                newgoodstype[i].carnidnums = 0
                            }
                            newdata[compid + '.cartlist'] = [];
                            newdata[compid + '.allGoods'] = newallGoods;
                            newdata[compid + '.goodstype'] = newgoodstype;
                            newdata[compid + '.cargoodsnum'] = 0;
                            newdata[compid + '.totalprice'] = 0;
                            newdata[compid + '.showreduce'] = false;
                            newdata[compid + '.difference'] = comdata.storeinfo.minprice;
                            pageInstance.setData(newdata);
                            that.choseCart(e)
                        }
                    }
                })
            }
        })
    },
    changeCart: function (e, childid) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        let goods = dataset.goods;
        let index = dataset.index;
        let type = dataset.type;
        let newcartlist = comdata.cartlist;
        let newallGoods = comdata.allGoods;
        let newgoodstype = comdata.goodstype;
        let nums = goods.nums;
        if (type == 'add') {
            nums++
        } else {
            nums--
        }
        wx.request({
            url: that.globalData.siteBaseUrl + '/takeout/changeCarnums',
            data: {
                nums: nums,
                shopcarid: goods.id,
                openid: that.getSessionKey(),
                app_id: that.globalData.appId,
                child_id: childid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded;'
            },
            method: 'post',
            success: function ({ data }) {
                if (data.code == 1) {
                    if (type == 'add') {
                        newcartlist[index].nums++
                    } else {
                        newcartlist[index].nums--
                        if (newcartlist[index].nums == 0) {
                            newcartlist.splice(index, 1)
                        }
                        if (newcartlist.length == 0) {
                            that.choseCart(e)
                        }
                    }
                    newallGoods = data.goodsArr;
                    newgoodstype = data.goodstype;
                    pageInstance.setData({
                        [`${compid}.cartlist`]: newcartlist,
                        [`${compid}.allGoods`]: newallGoods,
                        [`${compid}.goodstype`]: newgoodstype,
                        [`${compid}.cargoodsnum`]: data.cargoodsnum,
                        [`${compid}.totalprice`]: data.totalprice,
                        [`${compid}.difference`]: (comdata.storeinfo.minprice - data.totalprice).toFixed(2),
                    })
                    for (let i = comdata.activityarr.length - 1; i >= 0; i--) {
                        if (parseFloat(comdata.totalprice) >= parseFloat(comdata.activityarr[i].full)) {
                            pageInstance.setData({
                                [`${compid}.fullprice`]: comdata.activityarr[i].full,
                                [`${compid}.reduceprice`]: comdata.activityarr[i].reduce,
                                [`${compid}.showreduce`]: true
                            })
                            break
                        } else {
                            pageInstance.setData({
                                [`${compid}.showreduce`]: false
                            })
                        }
                    }
                } else {
                    that.toast({ title: data.msg });
                }
            }
        })
    },
    changeFoot: function (e, childid) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        let goods = dataset.goods;
        let type = dataset.type;
        let index = dataset.index;
        let newallGoods = comdata.allGoods;
        let newgoodstype = comdata.goodstype;
        let nums = newallGoods[comdata.chooseNav][index].carnums
        if (type == 'add') {
            nums++
        } else {
            nums--
        }
        wx.request({
            url: that.globalData.siteBaseUrl + '/takeout/addCars',
            data: {
                goodname: goods.goodname,
                good_id: goods.id,
                picpath: goods.picpath,
                price: goods.price,
                nums: nums,
                specstr: '',
                openid: that.getSessionKey(),
                app_id: that.globalData.appId,
                child_id: childid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded;'
            },
            method: 'post',
            success: function ({ data }) {
                if (data.code == 1) {
                    newallGoods = data.goodsArr;
                    newgoodstype = data.goodstype;
                    pageInstance.setData({
                        [`${compid}.allGoods`]: newallGoods,
                        [`${compid}.goodstype`]: newgoodstype,
                        [`${compid}.cargoodsnum`]: data.cargoodsnum,
                        [`${compid}.disprice`]: data.disprice,
                        [`${compid}.totalprice`]: data.totalprice,
                        [`${compid}.difference`]: (comdata.storeinfo.minprice - data.totalprice).toFixed(2)
                    })
                    for (let i = comdata.activityarr.length - 1; i >= 0; i--) {
                        if (parseFloat(comdata.totalprice) >= parseFloat(comdata.activityarr[i].full)) {
                            pageInstance.setData({
                                [`${compid}.fullprice`]: comdata.activityarr[i].full,
                                [`${compid}.reduceprice`]: comdata.activityarr[i].reduce,
                                [`${compid}.showreduce`]: true
                            })
                            break
                        } else {
                            pageInstance.setData({
                                [`${compid}.showreduce`]: false
                            })
                        }
                    }
                } else {
                    that.toast({ title: data.msg });
                }
            }
        })
    },
    trueMulti: function (e, childid) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        let goods = comdata.multigoods
        let newallGoods = comdata.allGoods;
        let newgoodstype = comdata.goodstype;
        wx.request({
            url: that.globalData.siteBaseUrl + '/takeout/addCars',
            data: {
                goodname: goods.goodname,
                good_id: goods.id,
                picpath: goods.picpath,
                price: comdata.multiprice,
                nums: 1,
                specstr: '规格：' + comdata.specstr,
                openid: that.getSessionKey(),
                app_id: that.globalData.appId,
                child_id: childid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded;'
            },
            method: 'post',
            success: function ({ data }) {
                if (data.code == 1) {
                    newallGoods = data.goodsArr;
                    newgoodstype = data.goodstype;
                    pageInstance.setData({
                        [`${compid}.allGoods`]: newallGoods,
                        [`${compid}.goodstype`]: newgoodstype,
                        [`${compid}.cargoodsnum`]: data.cargoodsnum,
                        [`${compid}.disprice`]: data.disprice,
                        [`${compid}.totalprice`]: data.totalprice,
                        [`${compid}.showmulti`]: false,
                        [`${compid}.showmulti2`]: false,
                        [`${compid}.difference`]: (comdata.storeinfo.minprice - data.totalprice).toFixed(2),
                        [`${compid}.specIndex`]: -1
                    })
                    for (let i = comdata.activityarr.length - 1; i >= 0; i--) {
                        if (parseFloat(comdata.totalprice) >= parseFloat(comdata.activityarr[i].full)) {
                            pageInstance.setData({
                                [`${compid}.fullprice`]: comdata.activityarr[i].full,
                                [`${compid}.reduceprice`]: comdata.activityarr[i].reduce,
                                [`${compid}.showreduce`]: true
                            })
                            break
                        } else {
                            pageInstance.setData({
                                [`${compid}.showreduce`]: false
                            })
                        }
                    }
                } else {
                    that.toast({ title: data.msg });
                }
            }
        })
    },
    showMulti: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        let goodspec = dataset.goodspec;
        let goodsname = dataset.goodsname;
        let inventoryprice = dataset.inventoryprice;
        let multigoods = dataset.goods;
        let index = dataset.index
        pageInstance.setData({
            [`${compid}.showmulti`]: true,
            [`${compid}.goodspec`]: goodspec,
            [`${compid}.goodsname`]: goodsname,
            [`${compid}.inventoryprice`]: inventoryprice,
            [`${compid}.multiprice`]: 0,
            [`${compid}.multigoods`]: multigoods,
            [`${compid}.multiIndex`]: index,
            [`${compid}.specstr`]: ''
        })
    },
    showMulti2: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        let goodspec = dataset.goodspec;
        let goodsname = dataset.goodsname;
        let inventoryprice = dataset.inventoryprice;
        let multigoods = dataset.goods;
        let index = dataset.index
        pageInstance.setData({
            [`${compid}.showmulti2`]: true,
            [`${compid}.goodspec`]: goodspec,
            [`${compid}.goodsname`]: goodsname,
            [`${compid}.inventoryprice`]: inventoryprice,
            [`${compid}.multiprice`]: 0,
            [`${compid}.multigoods`]: multigoods,
            [`${compid}.multiIndex`]: index,
            [`${compid}.specstr`]: ''
        })
    },
    chooseMulti: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var index = dataset.index;
        let inventoryprice = dataset.inventoryprice;
        pageInstance.setData({
            [`${compid}.specIndex`]: index,
            [`${compid}.multiprice`]: inventoryprice.price,
            [`${compid}.specstr`]: inventoryprice.spec_desc
        })
    },
    chooseMulti2: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var compdata = pageInstance['data'][compid];
        var goodspec = compdata.goodspec;
        var inventoryprice = compdata.inventoryprice;
        var idx = dataset.idx;
        var tidx = dataset.tidx;
        var goodspec_two = goodspec[idx].two;
        for (var i = 0; i < goodspec_two.length; i++) {
            if (tidx == i) {
                goodspec_two[i].issel = true;
            } else {
                goodspec_two[i].issel = false;
            }
        }
        goodspec[idx].two = goodspec_two;
        var specstr = '';
        for (var i = 0; i < goodspec.length; i++) {
            for (var j = 0; j < goodspec[i].two.length; j++) {
                if (goodspec[i].two[j].issel) {
                    specstr += goodspec[i].nameone + ':' + goodspec[i].two[j].nametwo + ' ';
                    break;
                }
            }
        }
        var price = 0;
        var hasprice = false;
        for (var i = 0; i < inventoryprice.length; i++) {
            if (inventoryprice[i].spec_desc == specstr) {
                price = inventoryprice[i].price;
                hasprice = true;
            }
        }
        if (!hasprice) {
            specstr = '';
        }
        pageInstance.setData({
            [`${compid}.goodspec`]: goodspec,
            [`${compid}.multiprice`]: price,
            [`${compid}.specstr`]: specstr
        })
    },
    goToOrderDetail: function (orderId) {
        var url = '/pages/takeoutorderinfo/takeoutorderinfo?order_id=' + orderId;
        this.turnToPage(url, 1);
    },
    seckillTime: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        this.sendRequest({
            url: '/seck/seck_timelist',
            method: 'post',
            data: {
            },
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        [`${compid}.secTime`]: res.confireArr,
                        [`${compid}.havenums`]: 1,
                        [`${compid}.pagenum`]: 1,
                        [`${compid}.prenum`]: 0,
                        [`${compid}.h1`]: 0,
                        [`${compid}.h2`]: 0,
                        [`${compid}.m1`]: 0,
                        [`${compid}.m2`]: 0,
                        [`${compid}.s1`]: 0,
                        [`${compid}.s2`]: 0,
                        [`${compid}.selIdx`]: 0,
                        [`${compid}.seckname`]: '',
                        [`${compid}.endtime`]: '',
                        [`${compid}.isactive`]: false,
                        [`${compid}.goodlist`]: []
                    })
                    var ishow = res.confireArr[0].is_show;
                    var endtime = res.confireArr[0].endtime;
                    if (ishow == 1) {
                        pageInstance.setData({
                            [`${compid}.endtime`]: endtime,
                            [`${compid}.isactive`]: true
                        })
                        pageInstance.timer = setInterval(that._GetRTime(compid), 1000);
                    }
                    that.loadseckGood(compid);
                }
                pageInstance.setData({
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true
                })
            }
        })
    },
    _GetRTime: function (compid) {
        return function () {
            that.GetRTime(compid);
        }
    },
    GetRTime: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var NowTime = new Date();
        var year = NowTime.getFullYear();
        var month = NowTime.getMonth() + 1;
        var day = NowTime.getDate();
        var etime = comdata.endtime;
        var timestr = year + '/' + month + '/' + day + ' ' + etime + ':00';
        var EndTime = new Date(timestr);
        var t = EndTime.getTime() - NowTime.getTime();
        var h = 0;
        var m = 0;
        var s = 0;
        var h1, h2, m1, m2, s1, s2;
        if (t >= 0) {
            h = Math.floor(t / 1000 / 60 / 60 % 24);
            m = Math.floor(t / 1000 / 60 % 60);
            s = Math.floor(t / 1000 % 60);
            if (h < 10) {
                h1 = 0;
                h2 = h;
            } else {
                h1 = Math.floor(h / 10);
                h2 = h % 10;
            }
            if (m < 10) {
                m1 = 0;
                m2 = m;
            } else {
                m1 = Math.floor(m / 10);
                m2 = m % 10;
            }
            if (s < 10) {
                s1 = 0;
                s2 = s;
            } else {
                s1 = Math.floor(s / 10);
                s2 = s % 10;
            }
            pageInstance.setData({
                [`${compid}.h1`]: h1,
                [`${compid}.h2`]: h2,
                [`${compid}.m1`]: m1,
                [`${compid}.m2`]: m2,
                [`${compid}.s1`]: s1,
                [`${compid}.s2`]: s2,
            });
        } else {
            clearInterval(pageInstance.timer);
        }
    },
    loadseckGood: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var order = comdata.order;
        var goodname = comdata.seckname;
        var nid = comdata.nid;
        var pagenum = comdata.pagenum;
        var idx = comdata.selIdx;
        var secTime = comdata.secTime;
        var timestr = secTime[idx].time;
        this.sendRequest({
            url: '/seck/search_seckname',
            method: 'post',
            data: {
                order: order,
                goodname: goodname,
                timestr: timestr,
                nid: nid,
                pageNum: pagenum
            },
            success: function (res) {
                var goodlist = [];
                if (res.code == 1) {
                    var oldList = comdata.goodlist;
                    goodlist = oldList.concat(res.good);
                }
                pagenum = pagenum + 1;
                pageInstance.setData({
                    [`${compid}.goodlist`]: goodlist,
                    [`${compid}.pagenum`]: pagenum,
                    [`${compid}.havenums`]: res.havenums
                })
            }
        })
    },
    selSecTime: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var idx = dataset.idx;
        var secTime = comdata.secTime;
        var ishow = secTime[idx].is_show;
        var time = secTime[idx].time;
        if (ishow == 1) {
            var isactive = true;
            pageInstance.timer = setInterval(that._GetRTime(compid), 1000);
        } else {
            var isactive = false;
            clearInterval(pageInstance.timer);
        }
        pageInstance.setData({
            [`${compid}.selIdx`]: idx,
            [`${compid}.isactive`]: isactive,
            [`${compid}.prenum`]: 0,
            [`${compid}.pagenum`]: 1,
            [`${compid}.havenums`]: 1,
            [`${compid}.seckname`]: '',
            [`${compid}.goodlist`]: []
        });
        this.loadseckGood(compid);
    },
    searchSeck: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.prenum`]: 0,
            [`${compid}.pagenum`]: 1,
            [`${compid}.havenums`]: 1,
            [`${compid}.goodlist`]: []
        });
        this.loadseckGood(compid);
    },
    loadmoreOrder: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var prenum = comdata.prenum;
        var pagenum = comdata.pagenum;
        var havenums = comdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadseckGood(compid);
        }
    },
    goToSeckDetail: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var comdata = pageInstance['data'][compid];
        var id = dataset.id;
        var sidx = comdata.selIdx;
        var secTime = comdata.secTime;
        var timestr = secTime[sidx].time;
        var url = "/dianshang/seckillDetail/seckillDetail?id=" + id + '&timestr=' + timestr;
        this.turnToPage(url);
    },
    searchGroupgoods: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var goodslist = pageInstance.data[compid];
        goodslist.content = [];
        wx.setStorage({
            key: 'goodsData',
            data: goodslist
        });
        var url = '/pintuan/searchGroupgoods/searchGroupgoods';
        this.turnToPage(url);
    },
    takeoutLoad: function (childid) {
        var pageInstance = this.getNowPage();
        var takeoutArr = pageInstance.takeoutArr;
        if (takeoutArr.length > 0) {
            for (var i = 0; i < takeoutArr.length; i++) {
                var compid = takeoutArr[i].name;
                var takeoutab = pageInstance.data[compid]['takeoutab'];
                if (takeoutab == 0) {
                    this.loadtakeout(compid, childid)
                }
                var animation = wx.createAnimation({
                    duration: 200,
                })
                pageInstance.animation = animation;
                var animation1 = wx.createAnimation({
                    duration: 200,
                })
                pageInstance.animation1 = animation1;
            }
        }
        var seckillArr = pageInstance.seckillArr;
        if (seckillArr.length > 0) {
            for (var i = 0; i < seckillArr.length; i++) {
                var compid = seckillArr[i].name;
                pageInstance.setData({
                    [`${compid}.specIndex`]: 0
                })
                this.seckillTime(compid);
            }
        }
        var newseckillArr = pageInstance.newseckillArr;
        if (newseckillArr.length > 0) {
            for (var i = 0; i < newseckillArr.length; i++) {
                var compid = newseckillArr[i].name;
                pageInstance.setData({
                    [`${compid}.typeIndex`]: '',
                    [`${compid}.havenums`]: 1,
                    [`${compid}.pagenum`]: 1,
                    [`${compid}.prenum`]: 0,
                    [`${compid}.seckname`]: '',
                    [`${compid}.isactive`]: false,
                    [`${compid}.goodlist`]: [],
                    [`${compid}.number`]: 1,
                    [`${compid}.h1Arr`]: [],
                    [`${compid}.h2Arr`]: [],
                    [`${compid}.m1Arr`]: [],
                    [`${compid}.m2Arr`]: [],
                    [`${compid}.s1Arr`]: [],
                    [`${compid}.s2Arr`]: [],
                    newtimer: 0
                })
                this.loadnewseckGood(compid);
            }
        }
    },
    addShareLog: function () {
        this.sendRequest({
            url: '/webapp/tjIntegral',
            data: {
                openid: this.getSessionKey()
            },
            method: 'POST',
            success: function (res) {
            }
        });
    },
    UserCenterPage: function (e) {
        var name = this.getset(e).name;
        var typeIndex = -1;
        if (name == '我的订单' || name == '全部订单') {
            typeIndex = this.getset(e).typeidx;
        }
        var url = '';
        if (name == '全部订单' || name == '我的订单') {
            url = '/pages/myOrder/myOrder?typeIndex=' + typeIndex;
        } else if (name == '收货地址') {
            url = '/pages/address/address';
        } else if (name == '个人信息') {
            url = '/pages/userinfo/userinfo';
        } else if (name == '购物车') {
            url = '/pages/shopCart/shopCart';
        } else if (name == '会员卡') {
            this.myMemcard();
        } else if (name == '积分商城') {
            url = '/pages/integralMall/integralMall';
        } else if (name == '我的拼团') {
            url = '/pintuan/myGrouporder/myGrouporder';
        } else if (name == '优惠券') {
            url = '/pages/myCoupon/myCoupon';
        } else if (name == '我要分销') {
            url = '/pages/distribution/distribution?disopenid=' + this.globalData.disopenid;
        } else if (name == '我的同城') {
            url = '/tongcheng/myCitybox/myCitybox?type=0'
        } else if (name == '预约中心') {
            url = '/yuyue/bespeakCenter/bespeakCenter';
        } else if (name == '店铺管理') {
            this.showJoin();
        }
        if (name != '会员卡' && name != '店铺管理') {
            this.turnToPage(url);
        }
    },
    suspensionBottom: function (router) {
        let url = '/pages/' + router + '/' + router;
        var pageInstance = this.getNowPage();
        let tab = this.globalData.tabBarPagePathArr;
        for (let i in pageInstance.data) {
            if (/rightSuspend/.test(i)) {
                let suspension = pageInstance.data[i],
                    newdata = {};
                if (tab.indexOf(url) != -1) {
                    newdata[i + '.bottom'] = (+suspension.bottom - 56) * 2.34;
                } else {
                    newdata[i + '.bottom'] = (+suspension.bottom) * 2.34;
                }
                pageInstance.setData(newdata);
            }
        }
    },
    commentChange: function (e) {
        var pageInstance = this.getNowPage();
        var value = e.detail.value;
        var compId = e.target.dataset.compid;
        var newdata = {};
        newdata[compId + '.commentText'] = value;
        pageInstance.setData(newdata);
    },
    replyChange: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = e.target.dataset;
        var value = e.detail.value;
        var datakey = dataset.datakey;
        var newdata = {};
        newdata[datakey + '.replyContent'] = value;
        pageInstance.setData(newdata);
    },
    pageScrollFunc: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = e.target.dataset;
        var compid = dataset.compid;
        var nid = dataset.nid;
        var curpage = dataset.curpage;
        if (pageInstance.prevPage != curpage) {
            pageInstance.prevPage = curpage;
            this.dynamicListData(compid, nid);
        }
    },
    searchArticle: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var dynamiclist = pageInstance.data[compid];
        dynamiclist.content = [];
        wx.setStorage({
            key: 'artData',
            data: dynamiclist
        });
        var url = '/wenzhang/searchArticle/searchArticle';
        this.turnToPage(url);
    },
    enterLbSearhText: function (e) {
        var pageInstance = this.getNowPage();
        var value = e.detail.value;
        var compid = e.target.dataset.compid;
        var newdata = {};
        newdata[compid + '.inputText'] = value;
        pageInstance.setData(newdata);
    },
    tagLbAppSearch: function (e) {
        var dataset = this.getset(e);
        let text = dataset.text;
        var compid = dataset.compid;
        var nid = dataset.nid;
        this.tagLbSearch(text, compid);
        this.dynamicListData(compid, nid);
    },
    clickLbAppSearch: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        let text = pageInstance.data[compid].inputText;
        this.clickLbSearch(text, compid);
        this.dynamicListData(compid, nid);
    },
    changeAppCount: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var autocount = dataset.autocount;
        if (!autocount) {
            var isclick = dataset.isclick;
            var compid = dataset.compid;
            if (!isclick) {
                pageInstance.setData({
                    [`${compid}.isclick`]: true
                });
                this.changeCount(dataset);
            }
        }
    },
    sortAppListFunc: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var nid = dataset.nid;
        this.sortListFunc(dataset);
        this.dynamicListData(compid, nid);
    },
    searchGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var bindObj = dataset.bindobj;
        var goodslist = pageInstance.data[compid];
        goodslist.content = [];
        wx.setStorage({
            key: 'goodsData',
            data: goodslist
        });
        var url = '/dianshang/searchGoods/searchGoods?bindObj=' + bindObj;
        this.turnToPage(url);
    },
    bindCommodity: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/goodsDetail/goodsDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id + '&bindObj=0';
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindGoodList: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var title = eventParams.title;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/goodsList/goodsList';
        if (allPages.indexOf(path.substring(1, path.length)) != -1) {
            var url = path + '?nid=' + id + '&title=' + title;
            this.turnToPage(url);
        } else {
            this.showModal({
                content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
            })
        }
    },
    bindArticle: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/wenzhang/articles/articles';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定文章，需程序使用“动态文章”组件，方可调用。'
                })
            }
        }
    },
    bindCoupon: function (e) {
        var eventParams = JSON.parse(this.getset(e).eventParams);
        var couponid = eventParams.couponid;
        that.sendRequest({
            url: '/webapp/getCoupon',
            method: 'post',
            data: {
                couponid: couponid,
                openid: that.getSessionKey()
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/pages/myCoupon/myCoupon';
                    that.turnToPage(url);
                } else {
                    that.showModal({
                        content: res.msg
                    });
                }
            }
        })
    },
    searchTopic: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var dynamiclist = pageInstance.data[compid];
        dynamiclist.content = [];
        wx.setStorage({
            key: 'artData',
            data: dynamiclist
        });
        var url = '/shequ/searchTopic/searchTopic';
        this.turnToPage(url);
    },
    loadMoreShop: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var nid = dataset.nid;
        var compid = dataset.compid;
        var pagenum = dataset.pagenum;
        var prevPage = pageInstance.data[compid].prevPage;
        if (prevPage != pagenum) {
            pageInstance.setData({
                [`${compid}.prevPage`]: pagenum
            })
            this.shopInfo(nid, compid);
        }
    },
    searchShop: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var shoplist = pageInstance.data[compid];
        shoplist.content = [];
        wx.setStorage({
            key: 'shopData',
            data: shoplist
        });
        var url = '/dianshang/searchShop/searchShop';
        this.turnToPage(url);
    },
    bindAppointment: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/goodsDetail/goodsDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id + '&bindObj=1';
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindTostore: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/goodsDetail/goodsDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id + '&bindObj=2';
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindSonshop: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/shopDetail/shopDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定电商、预约、到店、子店铺，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    setTabelNum: function (scene) {
        if (scene && scene != 'undefined') {
            var tablenum = scene.split(';')[0];
            wx.setStorage({
                key: "tablenum",
                data: tablenum
            })
        }
    },
    noMulti: function () {
        this.toast({
            title: '亲-请先选择规格，谢谢',
            con: 'success'
        })
    },
    loadGoodsCla: function (compid, type) {
        var pageInstance = this.getNowPage();
        this.sendRequest({
            url: '/webapp/mobile_goodtypes',
            method: 'post',
            data: {
                type: type,
            },
            success: function (res) {
                if (res.code == 1000) {
                    pageInstance.setData({
                        [`${compid}.vqdlevel`]: 1000
                    });
                    return;
                }
                pageInstance.setData({
                    [`${compid}.content`]: res.alltype
                })
            }
        })
    },
    selGoodsCla: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var idx = dataset.idx;
        pageInstance.setData({
            [`${compid}.selIdx`]: idx
        })
    },
    goToGoodsList: function (e) {
        var dataset = this.getset(e);
        var id = dataset.nid;
        var title = dataset.title;
        var bindobj = dataset.bindobj || 0;
        var url = '/dianshang/goodsList/goodsList?nid=' + id + '&title=' + title + '&bindObj=' + bindobj;
        this.turnToPage(url);
    },
    goToListDetail: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var lid = dataset.lid;
        var bindpage = pageInstance.data[compid].bindpage;
        var binddetail = pageInstance.data[compid].binddetail;
        if (bindpage && binddetail != 1) {
            var url = '/pages/' + bindpage + '/' + bindpage + '?lid=' + lid;
            this.turnToPage(url);
        }
    },
    setListId: function (lid) {
        if (lid) {
            var pageInstance = this.getNowPage();
            pageInstance.setData({
                listId: lid
            })
        }
    },
    bindCommunity: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/shequ/forumDetail/forumDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定社区版块，需程序使用“社区版块”组件，方可调用。'
                })
            }
        }
    },
    bindtakCoupon: function (e) {
        var eventParams = JSON.parse(this.getset(e).eventParams);
        var couponid = eventParams.takcouponid;
        that.sendRequest({
            url: '/takeout/getVoucher',
            method: 'post',
            data: {
                couponid: couponid,
                openid: that.getSessionKey()
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/waimai/takeoutCoupon/takeoutCoupon';
                    that.turnToPage(url);
                } else {
                    that.showModal({
                        content: res.msg
                    });
                }
            }
        })
    },
    searchProduct: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var productlist = pageInstance.data[compid];
        productlist.content = [];
        wx.setStorage({
            key: 'proData',
            data: productlist
        });
        var url = '/chanpin/searchProduct/searchProduct';
        this.turnToPage(url);
    },
    personalSetting: function () {
        var url = '/pages/userinfo/userinfo';
        var tabBarPagePathArr = this.globalData.tabBarPagePathArr;
        if (tabBarPagePathArr.indexOf(url) != -1) {
            this.switchToTab(url);
        } else {
            this.turnToPage(url);
        }
    },
    loadGoodsData: function (compid, type, orderType, shownum, bindObj, pagenum) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        that.sendRequest({
            url: '/webapp/new_all_goods',
            data: {
                nid: type,
                limit: shownum,
                order: orderType,
                bindObj: bindObj,
                pageNum: pagenum
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.good),
                        [`${compid}.bindObj`]: bindObj,
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                pageInstance.setData({
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true,
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                });
            }
        });
    },
    sel_goods_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var type = compdata.listid;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        var sel = dataset.sel;
        var ordertype = compdata.ordertype;
        if (sel == 3) {
            if (ordertype == 3) {
                ordertype = 4;
            } else {
                ordertype = 3;
            }
        } else {
            ordertype = sel;
        }
        pageInstance.setData({
            [`${compid}.ordertype`]: ordertype,
            [`${compid}.content`]: [],
            [`${compid}.prenum`]: 0,
            [`${compid}.havenums`]: 1,
            [`${compid}.nothing`]: false,
        });
        this.loadGoodsData(compid, type, ordertype, shownum, bindObj, 1);
    },
    takshopInfo: function (compid, shownum) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var lat = compdata.lat;
        var lng = compdata.lng;
        var pagenum = compdata.pagenum;
        var nid = compdata.classnid;
        this.sendRequest({
            url: '/takeout/food_mutistore_list',
            data: {
                limit: shownum,
                latitude: lat,
                longitude: lng,
                pageNum: pagenum,
                nid: nid
            },
            method: 'post',
            success: function (res) {
                var oldlist = compdata.content;
                var storeType = res.storeType;
                pageInstance.setData({
                    [`${compid}.content`]: oldlist.concat(res.sonstoreArr),
                    [`${compid}.nothing`]: true,
                    [`${compid}.pagenum`]: pagenum + 1,
                    [`${compid}.havenums`]: res.havenums,
                    [`${compid}.loaddata`]: true,
                    [`${compid}.storeType`]: storeType
                });
            }
        })
    },
    clicktakzan: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var sid = dataset.zid;
        var idx = dataset.idx;
        var is_zan = dataset.type;
        this.sendRequest({
            url: '/takeout/save_log',
            data: {
                sid: sid,
                is_zan: is_zan,
                openid: this.getSessionKey()
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        [`${compid}.content[${idx}].zan_nums`]: res.zan,
                        [`${compid}.content[${idx}].cai_nums`]: res.cai,
                    });
                }
                that.showModal({
                    content: '' + res.msg
                });
            }
        })
    },
    newloadmoreOrder: function (e) {
        var num = this.getset(e).num;
        if (num == 2) {
            return;
        }
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var prenum = comdata.prenum;
        var pagenum = comdata.pagenum;
        var havenums = comdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadnewseckGood(compid);
        }
    },
    loadnewseckGood: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var order = comdata.order;
        var goodname = comdata.seckname;
        var nid;
        var pagenum = comdata.pagenum;
        var shownum = comdata.shownum;
        var is_lable = comdata.classtype - 1;
        if (is_lable == 0) {
            nid = comdata.nid;
        } else {
            nid = comdata.labelid;
        }
        var selshop = comdata.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = comdata.childid;
        }
        this.sendRequest({
            url: '/seck/newsearch_seckname',
            method: 'post',
            data: {
                order: order,
                goodname: goodname,
                nid: nid,
                shownum: shownum,
                pageNum: pagenum,
                is_lable: is_lable,
                child_id: child_id
            },
            success: function (res) {
                var goodlist = [];
                if (res.code == 1) {
                    var oldList = comdata.goodlist;
                    goodlist = oldList.concat(res.good);
                }
                pagenum = pagenum + 1;
                pageInstance.setData({
                    [`${compid}.goodlist`]: goodlist,
                    [`${compid}.pagenum`]: pagenum,
                    [`${compid}.havenums`]: res.havenums,
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true,
                    [`${compid}.loaddata`]: true,
                    [`${compid}.nothing`]: true,
                })
                var newtimer = setInterval(function () {
                    that.newGetRTime(compid);
                }, 1000)
                pageInstance.setData({
                    [`${compid}.newtimer`]: newtimer
                })
            }
        })
    },
    newGetRTime: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var goods = comdata.goodlist;
        var h1Arr = comdata.h1Arr;
        var h2Arr = comdata.h2Arr;
        var m1Arr = comdata.m1Arr;
        var m2Arr = comdata.m2Arr;
        var s1Arr = comdata.s1Arr;
        var s2Arr = comdata.s2Arr;
        for (var i = 0; i < goods.length; i++) {
            var h1 = 0, h2 = 0, m1 = 0, m2 = 0, s1 = 0, s2 = 0;
            h1Arr.push(h1);
            h2Arr.push(h2);
            m1Arr.push(m1);
            m2Arr.push(m2);
            s1Arr.push(s1);
            s2Arr.push(s2);
            var endtime = goods[i].endtime;
            var NowTime = new Date();
            var EndTime = new Date(endtime);
            var t = EndTime.getTime() - NowTime.getTime();
            var h = 0;
            var m = 0;
            var s = 0;
            var h1, h2, m1, m2, s1, s2;
            if (t >= 0) {
                h = Math.floor(t / 1000 / 60 / 60);
                m = Math.floor(t / 1000 / 60 % 60);
                s = Math.floor(t / 1000 % 60);
                if (h < 10) {
                    h1 = 0;
                    h2 = h;
                } else {
                    h1 = Math.floor(h / 10);
                    h2 = h % 10;
                }
                if (m < 10) {
                    m1 = 0;
                    m2 = m;
                } else {
                    m1 = Math.floor(m / 10);
                    m2 = m % 10;
                }
                if (s < 10) {
                    s1 = 0;
                    s2 = s;
                } else {
                    s1 = Math.floor(s / 10);
                    s2 = s % 10;
                }
                var h1Arr = comdata.h1Arr;
                var h2Arr = comdata.h2Arr;
                var m1Arr = comdata.m1Arr;
                var m2Arr = comdata.m2Arr;
                var s1Arr = comdata.s1Arr;
                var s2Arr = comdata.s2Arr;
                h1Arr.splice(i, 1, h1);
                h2Arr.splice(i, 1, h2);
                m1Arr.splice(i, 1, m1);
                m2Arr.splice(i, 1, m2);
                s1Arr.splice(i, 1, s1);
                s2Arr.splice(i, 1, s2);
                pageInstance.setData({
                    [`${compid}.h1Arr`]: h1Arr,
                    [`${compid}.h2Arr`]: h2Arr,
                    [`${compid}.m1Arr`]: m1Arr,
                    [`${compid}.m2Arr`]: m2Arr,
                    [`${compid}.s1Arr`]: s1Arr,
                    [`${compid}.s2Arr`]: s2Arr
                })
            }
        }
    },
    newsearchSeck: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        wx.setStorage({
            key: 'seckData',
            data: comdata
        });
        var url = "/dianshang/searchSeck/searchSeck";
        this.turnToPage(url);
    },
    newgoToSeckDetail: function (e) {
        var dataset = this.getset(e);
        var id = dataset.id;
        var childid = dataset.childid;
        var url = "/dianshang/newseckillDetail/newseckillDetail?id=" + id + '&childid=' + childid;
        this.turnToPage(url);
    },
    sel_seck_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var sel = dataset.sel;
        var order = compdata.order;
        if (sel != order || sel == 3) {
            if (sel == 3) {
                if (order == 3) {
                    order = 4;
                } else {
                    order = 3;
                }
            } else {
                order = sel;
            }
            clearInterval(pageInstance.newtimer);
            pageInstance.setData({
                [`${compid}.goodlist`]: [],
                [`${compid}.h1Arr`]: [],
                [`${compid}.h2Arr`]: [],
                [`${compid}.m1Arr`]: [],
                [`${compid}.m2Arr`]: [],
                [`${compid}.s1Arr`]: [],
                [`${compid}.s2Arr`]: [],
                [`${compid}.order`]: order,
                [`${compid}.pagenum`]: 1,
                [`${compid}.prenum`]: 0,
                [`${compid}.havenums`]: 1,
                [`${compid}.nothing`]: false,
                [`${compid}.loaddata`]: false,
                newtimer: 0
            });
            this.loadnewseckGood(compid);
        }
    },
    regetAddress: function (e) {
        var pageInstance = this.getNowPage();
        var rres = e.detail;
        if (rres.authSetting['scope.userLocation']) {
            var takeoutShopArr = pageInstance.takeoutShopArr;
            var goodsShopArr = pageInstance.goodsShopArr;
            var theCityArr = pageInstance.theCityArr;
            var appointShopArr = pageInstance.theCityArr;
            if (takeoutShopArr.length > 0 || goodsShopArr.length > 0 || theCityArr.length > 0 || appointShopArr.length > 0) {
                var newdata = {};
                that.getLocation({
                    success: function (res) {
                        var lat = res.latitude;
                        var lng = res.longitude;
                        that.sendRequest({
                            url: '/webapp/getLocation',
                            method: 'post',
                            data: {
                                lat: lat,
                                lng: lng
                            },
                            success: function (res) {
                                for (var i = 0; i < takeoutShopArr.length; i++) {
                                    let compid = takeoutShopArr[i].name;
                                    let shownum = takeoutShopArr[i].shownum;
                                    newdata[compid + '.lat'] = lat;
                                    newdata[compid + '.lng'] = lng;
                                    newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                    newdata[compid + '.loaded'] = true;
                                    newdata[compid + '.loaddata'] = false;
                                    newdata[compid + '.classidx'] = -1;
                                    newdata[compid + '.storeType'] = [];
                                    pageInstance.setData(newdata);
                                    that.takshopInfo(compid, shownum);
                                }
                                for (var i = 0; i < goodsShopArr.length; i++) {
                                    var compid = goodsShopArr[i].name;
                                    newdata[compid + '.lat'] = lat;
                                    newdata[compid + '.lng'] = lng;
                                    newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                    newdata[compid + '.loaded'] = true;
                                    newdata[compid + '.classidx'] = -1;
                                    newdata[compid + '.storeType'] = [];
                                    pageInstance.setData(newdata);
                                    that.goodsshopInfo(compid);
                                }
                                for (var i = 0; i < theCityArr.length; i++) {
                                    let compid = theCityArr[i].name;
                                    let compdata = pageInstance.data[compid];
                                    let nid = theCityArr[i].nid;
                                    let shownum = theCityArr[i].shownum;
                                    let orderType = theCityArr[i].orderType;
                                    let city = compdata.city;
                                    newdata[compid + '.content'] = [];
                                    newdata[compid + '.havaData'] = false;
                                    newdata[compid + '.prenum'] = 0;
                                    newdata[compid + '.pageNum'] = 1;
                                    newdata[compid + '.havenums'] = 1;
                                    newdata[compid + '.isaddress'] = 1;
                                    newdata[compid + '.loaded'] = true;
                                    if (!city) {
                                        newdata[compid + '.lat'] = lat;
                                        newdata[compid + '.lng'] = lng;
                                        newdata[compid + '.city'] = res.city;
                                        newdata[compid + '.location_address'] = res.province + res.city + res.district + res.street;
                                    } else {
                                        newdata[compid + '.lat'] = '';
                                        newdata[compid + '.lng'] = '';
                                    }
                                    pageInstance.setData(newdata);
                                    that.cityInit(compid, nid, shownum, orderType);
                                }
                                for (var i = 0; i < appointShopArr.length; i++) {
                                    var compid = appointShopArr[i].name;
                                    newdata[compid + '.lat'] = lat;
                                    newdata[compid + '.lng'] = lng;
                                    newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                                    newdata[compid + '.loaded'] = true;
                                    newdata[compid + '.classidx'] = -1;
                                    newdata[compid + '.storeType'] = [];
                                    pageInstance.setData(newdata);
                                    that.appointshopInfo(compid);
                                }
                            }
                        })
                    },
                    fail: function (res) {
                        for (var i = 0; i < takeoutShopArr.length; i++) {
                            let compid = takeoutShopArr[i].name;
                            let shownum = takeoutShopArr[i].shownum;
                            newdata[compid + '.lat'] = '';
                            newdata[compid + '.lng'] = '';
                            newdata[compid + '.address'] = '';
                            newdata[compid + '.loaded'] = true;
                            pageInstance.setData(newdata);
                        }
                        for (var i = 0; i < goodsShopArr.length; i++) {
                            var compid = goodsShopArr[i].name;
                            newdata[compid + '.lat'] = '';
                            newdata[compid + '.lng'] = '';
                            newdata[compid + '.address'] = '';
                            newdata[compid + '.loaded'] = true;
                            newdata[compid + '.classidx'] = -1;
                            newdata[compid + '.storeType'] = [];
                            pageInstance.setData(newdata);
                        }
                        for (var i = 0; i < theCityArr.length; i++) {
                            let compid = theCityArr[i].name;
                            let nid = theCityArr[i].nid;
                            let shownum = theCityArr[i].shownum;
                            let orderType = theCityArr[i].orderType;
                            newdata[compid + '.content'] = [];
                            newdata[compid + '.havaData'] = false;
                            newdata[compid + '.lat'] = '';
                            newdata[compid + '.lng'] = '';
                            newdata[compid + '.city'] = res.city;
                            newdata[compid + '.prenum'] = 0;
                            newdata[compid + '.pageNum'] = 1;
                            newdata[compid + '.havenums'] = 1;
                            newdata[compid + '.isaddress'] = 0;
                            newdata[compid + '.loaded'] = true;
                            pageInstance.setData(newdata);
                            that.cityInit(compid, nid, shownum, orderType);
                        }
                        for (var i = 0; i < appointShopArr.length; i++) {
                            var compid = appointShopArr[i].name;
                            newdata[compid + '.lat'] = '';
                            newdata[compid + '.lng'] = '';
                            newdata[compid + '.address'] = '';
                            newdata[compid + '.loaded'] = true;
                            newdata[compid + '.classidx'] = -1;
                            newdata[compid + '.storeType'] = [];
                            pageInstance.setData(newdata);
                        }
                    }
                })
            }
        }
    },
    goToDistDetail: function (e) {
        var dataset = this.getset(e);
        var id = dataset.id;
        var num = dataset.num || 0;
        var childid = dataset.childid || 0;
        var url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + this.globalData.disgrade + '&num=' + num + '&childid=' + childid;
        this.turnToPage(url);
    },
    loadDistGoods: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var order = comdata.orderType;
        var goodname = comdata.distname;
        var nid = comdata.nid;
        var shownum = comdata.shownum;
        var pagenum = comdata.pagenum;
        this.sendRequest({
            url: '/disgoods/dis_goodlist',
            method: 'post',
            data: {
                order: order,
                goodname: goodname,
                nid: nid,
                limit: shownum,
                bindObj: 6,
                pageNum: pagenum
            },
            success: function (res) {
                var goodlist = [];
                if (res.code == 1) {
                    var oldList = comdata.goodlist;
                    goodlist = oldList.concat(res.good);
                    pagenum = pagenum + 1;
                    var havenums = res.havenums;
                } else {
                    var havenums = 0;
                }
                pageInstance.setData({
                    [`${compid}.goodlist`]: goodlist,
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true,
                    [`${compid}.pagenum`]: pagenum,
                    [`${compid}.havenums`]: havenums,
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                })
            }
        })
    },
    sel_dist_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var sel = dataset.sel;
        var order = compdata.orderType;
        if (sel != order || sel == 3) {
            if (sel == 3) {
                if (order == 3) {
                    order = 4;
                } else {
                    order = 3;
                }
            } else {
                order = sel;
            }
            pageInstance.setData({
                [`${compid}.typeIndex`]: '',
                [`${compid}.distname`]: '',
                [`${compid}.isactive`]: false,
                [`${compid}.goodlist`]: [],
                [`${compid}.number`]: 1,
                [`${compid}.orderType`]: order,
                [`${compid}.prenum`]: 0,
                [`${compid}.havenums`]: 1,
                [`${compid}.pagenum`]: 1,
                [`${compid}.nothing`]: false,
                [`${compid}.loaddata`]: false,
            });
            this.loadDistGoods(compid);
        }
    },
    searchDist: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        wx.setStorage({
            key: 'distData',
            data: comdata
        });
        var url = "/dianshang/searchDist/searchDist";
        this.turnToPage(url);
    },
    bindApp: function (event) {
        var param = event.currentTarget.dataset.eventParams;
        if (param) {
            param = JSON.parse(param);
            var appnid = param.appnid;
            this.sendRequest({
                url: '/webapp/relation',
                method: 'post',
                data: {
                    nid: appnid
                },
                success: function (res) {
                    if (res.code == 1) {
                        wx.navigateToMiniProgram({
                            appId: res.info.appid,
                            path: res.info.url,
                            success(rres) {
                            }
                        })
                    }
                }
            })
        }
    },
    setDisOpenid: function (scene) {
        if (scene && scene != 'undefined') {
            var disopenid = scene.split(';')[1];
            if (disopenid && disopenid != '0') {
                this.globalData.disopenid = disopenid;
                this.globalData.isScan = true;
            }
        }
        setTimeout(function () {
            var disgrade = that.globalData.disgrade;
            if (disgrade) {
                var pageInstance = that.getNowPage();
                pageInstance.setData({
                    disgrade: disgrade
                })
            }
        }, 500);
    },
    bindWeb: function (event) {
        var param = event.currentTarget.dataset.eventParams;
        if (param) {
            param = JSON.parse(param);
            var webnid = param.webnid;
            this.sendRequest({
                url: '/webapp/webpage',
                method: 'post',
                data: {
                    nid: webnid
                },
                success: function (res) {
                    if (res.code == 1) {
                        var linkurl = res.webinfo.url;
                        var url = '/pages/webpreview/webpreview?url=' + encodeURIComponent(linkurl);
                        that.turnToPage(url);
                    }
                }
            })
        }
    },
    bindMap: function (event) {
        var param = event.currentTarget.dataset.eventParams;
        if (param) {
            param = JSON.parse(param);
            var mapnid = param.mapnid;
            this.sendRequest({
                url: '/webapp/one_mapinfo',
                method: 'post',
                data: {
                    nid: mapnid
                },
                success: function (res) {
                    if (res.code == 1) {
                        var latitude = parseFloat(res.one_mapinfo.latitude);
                        var longitude = parseFloat(res.one_mapinfo.longitude);
                        var address = res.one_mapinfo.province + res.one_mapinfo.city + res.one_mapinfo.county + res.one_mapinfo.address;
                        wx.openLocation({
                            latitude: latitude,
                            longitude: longitude,
                            address: address
                        })
                    } else {
                        that.showModal({
                            content: res.msg
                        })
                    }
                }
            })
        }
    },
    loadGroupgoodData: function (compid, type, ordertype, shownum, bindObj, pagenum, classtype, labelid, child_id) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        that.sendRequest({
            url: '/webapp/allGroupgoods',
            data: {
                nid: type,
                limit: shownum,
                order: ordertype,
                pageNum: pagenum,
                classtype: classtype,
                labelid: labelid,
                child_id: child_id
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.good),
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                pageInstance.setData({
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true,
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                });
            }
        });
    },
    sel_groupgoods_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var type = compdata.listid;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        var sel = dataset.sel;
        var ordertype = compdata.ordertype;
        var labelid = compdata.labelid;
        var classtype = compdata.classtype;
        var selshop = compdata.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = compdata.childid;
        }
        if (sel == 3) {
            if (ordertype == 3) {
                ordertype = 4;
            } else {
                ordertype = 3;
            }
        } else {
            ordertype = sel;
        }
        pageInstance.setData({
            [`${compid}.ordertype`]: ordertype,
            [`${compid}.content`]: [],
            [`${compid}.prenum`]: 0,
            [`${compid}.havenums`]: 1,
            [`${compid}.nothing`]: false,
        });
        this.loadGroupgoodData(compid, type, ordertype, shownum, bindObj, 1, classtype, labelid, child_id);
    },
    takeoutShowPre: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var takeoutGoodIdx = dataset.idx;
        if (compdata.flag1 != null) {
            var flag1 = compdata.flag1
        }
        else {
            var flag1 = true;
        }
        pageInstance.setData({
            [`${compid}.idx`]: takeoutGoodIdx,
            [`${compid}.flag1`]: !flag1,
        });
    },
    bindDisgood: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/distDetail/distDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id + '&disgrade=' + this.globalData.disgrade;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定电商、预约、到店、子店铺、分销，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    changechecked: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var orderType = dataset.checked;
        var compdate = pageInstance.data[compid];
        var nid = dataset.nid;
        var shownum = dataset.shownum
        pageInstance.setData({
            [`${compid}.orderType`]: orderType,
            [`${compid}.content`]: [],
            [`${compid}.pageNum`]: 1,
            [`${compid}.havenums`]: 0,
        });
        this.cityInit(compid, nid, shownum, orderType);
    },
    infoDetail: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var styletype = dataset.styletype;
        var pageInstance = this.getNowPage();
        wx.setStorage({
            key: "style",
            data: {
                'contentStyle': pageInstance.data[compid].contentStyle,
                'headStyle': pageInstance.data[compid].headStyle,
                'name_box': pageInstance.data[compid].name_box,
                'nickStyle': pageInstance.data[compid].nickStyle,
            }
        })
        var lat = pageInstance.data[compid].lat;
        var lng = pageInstance.data[compid].lng;
        var url = "/tongcheng/cityInfoDetail/cityInfoDetail?cid=" + dataset.cid + '&lat=' + lat + '&lng=' + lng + '&styletype=' + styletype;
        this.turnToPage(url);
    },
    release: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var url = "/pages/city_release/city_release";
        this.turnToPage(url);
    },
    previewImage: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        wx.previewImage({
            current: dataset.img,
            urls: dataset.urls,
        })
    },
    cityInit: function (compid, nid, shownum, orderType) {
        var pageInstance = this.getNowPage();
        var pageNum = pageInstance.data[compid].pageNum || 1;
        var needlocation = 0;
        if (pageInstance.data[compid].showLocation) {
            needlocation = 1;
        }
        this.sendRequest({
            url: '/city/index',
            data: {
                ftype: orderType,
                pageNum: pageNum,
                city: pageInstance.data[compid].city,
                longitude: pageInstance.data[compid].lng,
                latitude: pageInstance.data[compid].lat,
                shownum: shownum,
                nid: nid,
                content: '',
                needlocation: needlocation
            },
            method: 'post',
            success: function (res) {
                if (res.code == 2) {
                    pageInstance.setData({
                        [`${compid}.havaData`]: true,
                        [`${compid}.havenums`]: 0,
                        [`${compid}.lat`]: res.lat,
                        [`${compid}.lng`]: res.lng
                    });
                    return;
                }
                var articles = pageInstance.data[compid].content;
                if (res.articles != null) {
                    articles = articles.concat(res.articles);
                }
                pageInstance.setData({
                    [`${compid}.content`]: articles,
                    [`${compid}.pageNum`]: pageNum + 1,
                    [`${compid}.havenums`]: res.havenums,
                    [`${compid}.hasnew`]: false,
                    [`${compid}.lat`]: res.lat,
                    [`${compid}.lng`]: res.lng
                });
                if (pageNum == 1) {
                    pageInstance.setData({
                        [`${compid}.newtime`]: res.newAddtime
                    });
                }
            }
        })
    },
    clickzan: function (e) {
        if (!this.globalData.userInfo.avatarUrl) {
            this.openAuthor();
            return;
        }
        var that = this;
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var cid = dataset.cid;
        var compid = dataset.compid;
        var idx = dataset.idx;
        this.sendRequest({
            url: '/city/goods',
            method: 'post',
            data: {
                aid: cid,
                openid: this.getSessionKey()
            },
            success: function (res) {
                that.toast({
                    title: res.msg
                });
                pageInstance.setData({
                    [`${compid}.content[${idx}].goodnums`]: res.goodnums
                })
            }
        })
    },
    reflashList: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var event = JSON.parse(dataset.eventParams);
        var idx = dataset.idx;
        var compid = dataset.compid;
        var listtype = event.listtype;
        var bindnid = event.bindnid;
        var bindIdentid = event.bindIdentid;
        var url = '';
        pageInstance.setData({
            [`${compid}.selected`]: idx
        });
        if (bindnid == '') {
            return;
        }
        var order = '';
        if (listtype == 1) {
            url = '/webapp/newGoodList';
        } else if (listtype == 2) {
            url = '/webapp/newSeckList';
        } else if (listtype == 3) {
            url = '/webapp/newGroupList';
        } else if (listtype == 4) {
            url = '/webapp/newDisList';
        } else if (listtype == 5) {
            url = '/webapp/newShopList';
        } else if (listtype == 6) {
            url = '/webapp/newProductList';
            for (let item in pageInstance.data) {
                if (pageInstance.data[item].identid == bindIdentid) {
                    order = pageInstance.data[item].orderType;
                    break;
                }
            }
        } else if (listtype == 7) {
            url = '/webapp/newTopList';
        } else if (listtype == 8) {
            url = '/newapp/nowdisList';
        }
        if (bindnid == 'all') {
            bindnid = '';
        }
        this.sendRequest({
            url: url,
            method: 'post',
            data: {
                nid: bindnid,
                order: order
            },
            success: function (res) {
                var newdata = {};
                for (let item in pageInstance.data) {
                    if (pageInstance.data[item].identid == bindIdentid) {
                        if (listtype == 1 || listtype == 3 || listtype == 5 || listtype == 7 || listtype == 6) {
                            newdata[item + '.content'] = res.list;
                            newdata[item + '.havenums'] = 0;
                        } else if (listtype == 2 || listtype == 4 || listtype == 8) {
                            newdata[item + '.goodlist'] = res.list;
                        }
                        pageInstance.setData(newdata)
                        break;
                    }
                }
            }
        })
    },
    loadNewGoodsList: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var nid = comdata.listid;
        var order = comdata.ordertype;
        var bindObj = comdata.bindObj;
        var goodnid = comdata.goodnid;
        var content = comdata.searchtxt;
        var issel = comdata.issel;
        this.sendRequest({
            url: '/webapp/search_goodListTwo',
            method: 'post',
            data: {
                nid: nid,
                order: order,
                goodstype: bindObj,
                content: content,
                goodnid: goodnid,
                issel: issel,
                openid: this.getSessionKey()
            },
            success: function (res) {
                var goodlist = [];
                var goodtype = [];
                if (res.code == 1 || res.code == 2) {
                    var oldList = comdata.goodlist;
                    goodtype = comdata.goodtype;
                    goodlist = oldList.concat(res.list);
                    if (issel == 0) {
                        goodtype = res.alltype;
                    }
                } else {
                    that.toast({
                        title: res.msg,
                        duration: 2000
                    });
                }
                pageInstance.setData({
                    [`${compid}.goodtype`]: goodtype,
                    [`${compid}.goodlist`]: goodlist,
                    [`${compid}.loaded`]: true,
                    [`${compid}.isloaded`]: true,
                    [`${compid}.status`]: res.code,
                    [`${compid}.cartallnum`]: res.carNums || 0,
                })
            }
        })
    },
    changeClassify: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var index = dataset.index;
        var nid = dataset.nid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        pageInstance.setData({
            [`${compid}.typeIdx`]: index,
            [`${compid}.goodlist`]: [],
            [`${compid}.isloaded`]: false,
            [`${compid}.goodnid`]: nid,
            [`${compid}.issel`]: 0
        })
        this.loadNewGoodsList(compid)
    },
    newsel_goods_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var sel = dataset.sel;
        var compdata = pageInstance['data'][compid];
        var ordertype = compdata.ordertype;
        if (sel == 2) {
            if (ordertype == 2) {
                ordertype = 3;
            } else {
                ordertype = 2;
            }
        } else {
            ordertype = sel;
        }
        pageInstance.setData({
            [`${compid}.goodlist`]: [],
            [`${compid}.isloaded`]: false,
            [`${compid}.ordertype`]: ordertype,
            [`${compid}.issel`]: 0
        });
        this.loadNewGoodsList(compid);
    },
    goToGoodsDetail: function (e) {
        var dataset = this.getset(e);
        var id = dataset.id;
        var bindObj = dataset.bindobj;
        var url = '';
        if (bindObj == 0) {
            url = '/dianshang/goodsDetail/goodsDetail?id=' + id + '&bindObj=' + bindObj;
        } else if (bindObj == 6 || bindObj == 7) {
            var num = 0;
            if (bindObj == 7) {
                num = 1;
            }
            url = '/dianshang/distDetail/distDetail?id=' + id + '&disgrade=' + this.globalData.disgrade + '&num=' + num;
        }
        this.turnToPage(url);
    },
    enterSearhText: function (e) {
        var value = e.detail.value;
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.searchtxt`]: value
        });
    },
    clickSearch: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        pageInstance.setData({
            [`${compid}.goodlist`]: [],
            [`${compid}.isloaded`]: false,
            [`${compid}.issel`]: 1
        })
        this.loadNewGoodsList(compid);
    },
    loadTakOrder: function (bindobj, bindstatus, compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var openid = this.getSessionKey();
        var pagenum = comdata.opagenum;
        var childid = comdata.childid || 0;
        this.sendRequest({
            url: '/takeout/myOrders',
            method: 'post',
            data: {
                openid: openid,
                status: bindstatus,
                pageNum: pagenum,
                type: bindobj,
                child_id: childid
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    newdata[compid + '.ohavenums'] = res.havenums;
                    newdata[compid + '.opagenum'] = comdata.opagenum + 1;
                    var oldList = comdata.orderList;
                    newdata[compid + '.orderList'] = oldList.concat(res.allorders);
                    newdata[compid + '.nothing'] = true;
                    pageInstance.setData(newdata);
                } else {
                    pageInstance.setData({
                        [`${compid}.nothing`]: true
                    });
                }
            }
        })
    },
    loadmoreTakOrder: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var oprenum = comdata.oprenum;
        var opagenum = comdata.opagenum;
        var ohavenums = comdata.ohavenums;
        if (oprenum != opagenum && ohavenums != 0) {
            pageInstance.setData({
                [`${compid}.oprenum`]: opagenum
            });
            var bindobj = comdata.bindObj;
            var bindstatus = comdata.bindStatus;
            this.loadTakOrder(bindobj, bindstatus, compid);
        }
    },
    showTakType: function (e) {
        var compid = this.getset(e).compid;
        var type = this.getset(e).type;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var taktype = comdata.taktype;
        if (type == taktype) {
            pageInstance.setData({
                [compid + '.taktype']: -1
            });
        } else {
            pageInstance.setData({
                [compid + '.taktype']: type
            });
        }
    },
    changeTakOrder: function (e) {
        var compid = this.getset(e).compid;
        var status = this.getset(e).status;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        pageInstance.setData({
            [compid + '.bindObj']: comdata.taktype,
            [compid + '.bindStatus']: status,
            [compid + '.oprenum']: 0,
            [compid + '.opagenum']: 1,
            [compid + '.ohavenums']: 1,
            [compid + '.orderList']: [],
            [compid + '.taktype']: -1,
            [compid + '.nothing']: false,
        });
        this.loadTakOrder(comdata.bindObj, status, compid);
    },
    goToTakDetail: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var orderid = dataset.orderid;
        var bindObj = dataset.type;
        var cid = dataset.cid;
        pageInstance.setData({
            [`${compid}.taktype`]: -1
        })
        var url = '/waimai/takeoutOrderDetail/takeoutOrderDetail?orderId=' + orderid + '&bindObj=' + bindObj + '&childid=' + cid;
        this.turnToPage(url);
    },
    goToTakRefund: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var compid = dataset.compid;
        var comdata = pageInstance['data'][compid];
        var orderList = comdata.orderList;
        var cid = dataset.cid;
        this.showModal({
            content: '确认退款？',
            showCancel: true,
            confirm: function () {
                that.sendRequest({
                    url: '/takeout/refund',
                    method: 'post',
                    data: {
                        order_id: orderid,
                        child_id: cid
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            orderList[index].refund = 1;
                            pageInstance.setData({
                                [`${compid}.orderList`]: orderList
                            });
                        } else {
                            that.showModal({
                                content: res.msg
                            })
                        }
                    }
                })
            }
        })
    },
    goToTakVerify: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var qrurl = dataset.qrurl;
        var wcode = dataset.wcode;
        var orderid = dataset.orderid;
        var compid = dataset.compid;
        var cid = dataset.cid;
        pageInstance.setData({
            [`${compid}.showQr`]: true,
            [`${compid}.qrUrl`]: qrurl
        })
        pageInstance.urltimer = setInterval(function () {
            that.sendRequest({
                url: '/crmmange/is_check_off',
                method: 'post',
                data: {
                    order_id: orderid,
                    writeoff_code: wcode
                },
                success: function (res) {
                    if (res.code == 1) {
                        clearInterval(pageInstance.urltimer);
                        that.hiddenTakQR(e);
                        that.changeTab(compid, 2, cid);
                    }
                }
            })
        }, 2000);
    },
    hiddenTakQR: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.showQr`]: false,
            [`${compid}.qrUrl`]: ''
        })
        clearInterval(pageInstance.urltimer);
    },
    loadservice: function (compid, nid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var pagenum = compdata.pagenum;
        var shownum = compdata.shownum;
        var orders = compdata.ordertype;
        this.sendRequest({
            url: '/neworder/serveList',
            method: 'post',
            data: {
                nid: nid,
                pageNum: pagenum,
                numPerPage: shownum,
                orders: orders
            },
            success: function (res) {
                var newdata = {};
                var oldlist = compdata.content;
                newdata[compid + '.loaded'] = true;
                if (res.code == 1) {
                    newdata[compid + '.content'] = oldlist.concat(res.serveList);
                    newdata[compid + '.havenums'] = res.haveNums;
                    newdata[compid + '.pagenum'] = ++pagenum;
                } else {
                    newdata[compid + '.havenums'] = 0;
                }
                pageInstance.setData(newdata);
            }
        })
    },
    loadmoreSer: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        if (!pageInstance.data[compid].loaded) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaded`]: false
        })
        this.loadservice(compid, nid);
    },
    scrollMoreSer: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var nid = dataset.nid;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadservice(compid, nid);
        }
    },
    searchService: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var servicelist = pageInstance.data[compid];
        servicelist.content = [];
        wx.setStorage({
            key: 'serviceData',
            data: servicelist
        });
        var url = '/yuyue/searchService/searchService';
        this.turnToPage(url);
    },
    loadtech: function (compid, nid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var pagenum = compdata.pagenum;
        var shownum = compdata.shownum;
        var orders = compdata.ordertype;
        this.sendRequest({
            url: '/neworder/technician_list',
            method: 'post',
            data: {
                nid: nid,
                pageNum: pagenum,
                numPerPage: shownum,
                orders: orders
            },
            success: function (res) {
                var newdata = {};
                var oldlist = compdata.content;
                newdata[compid + '.loaded'] = true;
                if (res.code == 1) {
                    newdata[compid + '.content'] = oldlist.concat(res.techList);
                    newdata[compid + '.havenums'] = res.haveNums;
                    newdata[compid + '.pagenum'] = ++pagenum;
                } else {
                    newdata[compid + '.havenums'] = 0;
                }
                pageInstance.setData(newdata);
            }
        })
    },
    loadmoreTech: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        if (!pageInstance.data[compid].loaded) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaded`]: false
        })
        this.loadtech(compid, nid);
    },
    searchTech: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var techlist = pageInstance.data[compid];
        techlist.content = [];
        wx.setStorage({
            key: 'techData',
            data: techlist
        });
        var url = '/yuyue/searchTech/searchTech';
        this.turnToPage(url);
    },
    bindBespcoupon: function (e) {
        var eventParams = JSON.parse(this.getset(e).eventParams);
        var couponid = eventParams.bespcouponid;
        that.sendRequest({
            url: '/neworder/get_coupon',
            method: 'post',
            data: {
                cid: couponid,
                openid: that.getSessionKey()
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/yuyue/bespCoupon/bespCoupon';
                    that.turnToPage(url);
                } else {
                    that.showModal({
                        content: res.msg,
                        confirm: function () {
                            var url = '/yuyue/bespCoupon/bespCoupon';
                            that.turnToPage(url);
                        }
                    });
                }
            }
        })
    },
    openTip: function (tipText) {
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            showTip: true,
            tipText: tipText
        })
        setTimeout(function () {
            pageInstance.setData({
                showTip: false,
                tipText: ''
            })
        }, 1500)
    },
    showJoin: function (themecolor) {
        let pageInstance = this.getNowPage();
        this.sendRequest({
            url: '/neworder/get_setinfo',
            method: 'post',
            data: {
            },
            success: function (res) {
                if (res.code == 1) {
                    var url = '/pages/sellerJoin/sellerJoin?themecolor=' + themecolor;
                    var tabBarPagePathArr1 = that.globalData.tabBarPagePathArr;
                    if (tabBarPagePathArr1.indexOf(url) != -1) {
                        that.switchToTab(url);
                    } else {
                        that.turnToPage(url);
                    }
                } else {
                    pageInstance.setData({
                        showNcardBg: true,
                        showNcard: true,
                        ncardmsg: res.msg
                    })
                }
            }
        });
    },
    appointshopInfo: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var lat = compdata.lat;
        var lng = compdata.lng;
        var numPerPage = compdata.shownum;
        var pageNum = compdata.pagenum;
        var nid = compdata.classnid;
        this.sendRequest({
            url: '/neworder/order_storelist',
            data: {
                lng: lng,
                lat: lat,
                numPerPage: numPerPage,
                storename: '',
                pageNum: pageNum,
                nid: nid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    pageNum++;
                    var oldlist = compdata.content;
                    var newlist = oldlist.concat(res.sonstoreArr);
                    pageInstance.setData({
                        [`${compid}.content`]: newlist,
                        [`${compid}.haveNums`]: res.haveNums,
                        [`${compid}.pagenum`]: pageNum
                    });
                } else {
                    pageInstance.setData({
                        [`${compid}.haveNums`]: 0
                    });
                }
                var storeType = res.store_type;
                pageInstance.setData({
                    [`${compid}.loaded`]: true,
                    [`${compid}.nothing`]: true,
                    [`${compid}.storeType`]: storeType
                });
            }
        })
    },
    searchApponitShop: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var appointshoplist = pageInstance.data[compid];
        wx.setStorage({
            key: 'apposhopData',
            data: appointshoplist
        });
        var url = '/yuyue/searchAppointshop/searchAppointshop';
        this.turnToPage(url);
    },
    goToAppoint: function (e) {
        var compid = this.getset(e).compid;
        var index = this.getset(e).index;
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var child_id = compdata.content[index].child_id;
        var url = '/yuyue/appointshopbox/appointshopbox?child_id=' + child_id;
        this.turnToPage(url);
    },
    loadmoreAppoint: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        if (!pageInstance.data[compid].loaded) {
            return;
        }
        var newdata = {};
        this.getLocation({
            success: function (res) {
                var lat = res.latitude;
                var lng = res.longitude;
                that.sendRequest({
                    url: '/webapp/getLocation',
                    method: 'post',
                    data: {
                        lat: lat,
                        lng: lng
                    },
                    success: function (res) {
                        newdata[compid + '.lat'] = lat;
                        newdata[compid + '.lng'] = lng;
                        newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                        newdata[compid + '.loaded'] = true;
                        pageInstance.setData(newdata);
                        that.appointshopInfo(compid);
                    }
                })
            },
            fail: function (res) {
                newdata[compid + '.lat'] = '';
                newdata[compid + '.lng'] = '';
                newdata[compid + '.address'] = '';
                newdata[compid + '.loaded'] = true;
                pageInstance.setData(newdata);
            }
        })
    },
    openAppointMap: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        wx.chooseLocation({
            success: function (res) {
                pageInstance.setData({
                    [`${compid}.address`]: res.name,
                    [`${compid}.lat`]: res.latitude,
                    [`${compid}.lng`]: res.longitude,
                    [`${compid}.classidx`]: -1,
                    [`${compid}.classnid`]: '',
                    [`${compid}.nothing`]: false,
                    [`${compid}.pagenum`]: 1,
                    [`${compid}.haveNums`]: 1,
                    [`${compid}.prenum`]: 0,
                    [`${compid}.content`]: []
                })
                that.appointshopInfo(compid);
            }
        })
    },
    NewUserCenterPage: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var name = dataset.name;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var themecolor = compdata.themeColor;
        var idx = dataset.idx;
        var url = '';
        if (name == '我的订单') {
            var tname = dataset.tname;
            var is_city = 0;
            if (tname == '秒杀中心') {
                url = '/dianshang/myseckOrder/myseckOrder';
            } else if (tname == '酒店预订') {
                url = '/jiudian/myhotelOrder/myhotelOrder';
            } else {
                if (tname == '微同城') {
                    is_city = 1;
                }
                url = '/pages/myOrder/myOrder?is_city=' + is_city;
            }
        } else if (name == '收货地址') {
            url = '/pages/address/address?themecolor=' + themecolor;
        } else if (name == '个人信息') {
            url = '/pages/userinfo/userinfo';
        } else if (name == '购物车' || name == '电商购物车') {
            url = '/pages/shopCart/shopCart?themecolor=' + themecolor;
        } else if (name == '会员卡') {
            this.myMemcard();
        } else if (name == '积分商城') {
            url = '/pages/integralMall/integralMall?themecolor=' + themecolor;
        } else if (name == '我的拼团') {
            url = '/pintuan/myGrouporder/myGrouporder';
        } else if (name == '优惠券') {
            url = '/pages/newCoupon/newCoupon';
        } else if (name == '我要分销') {
            url = '/pages/iWantDis/iWantDis?themecolor=' + themecolor;
        } else if (name == '我发布的') {
            url = '/tongcheng/myCitybox/myCitybox?type=0';
        } else if (name == '我的评论') {
            url = '/tongcheng/myCitybox/myCitybox?type=1';
        } else if (name == '回复我的') {
            url = '/tongcheng/myCitybox/myCitybox?type=2';
        } else if (name == '我的预约') {
            url = '/yuyue/bespeaklist/bespeaklist';
        } else if (name == '店铺管理') {
            this.showJoin(themecolor);
        } else if (name == '到店订单') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=1&childid=-1';
        } else if (name == '预约订单') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=3&childid=-1';
        } else if (name == '自取订单') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=2&childid=-1';
        } else if (name == '外送订单') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=0&childid=-1';
        } else if (name == '砍价列表' || name == '砍价记录') {
            url = '/kanjia/hagglelist/hagglelist';
        } else if (name == '砍价订单') {
            url = '/kanjia/haggleorder/haggleorder';
        } else if (name == '微商城' || name == '微餐饮' || name == '微同城' || name == '微预约' || name == '我的砍价' || name == '分销中心' || name == '拼团中心' || name == '秒杀中心' || name == '中奖记录' || name == '酒店预订') {
            var showSec = compdata.content[idx].showSec;
            pageInstance.setData({
                [`${compid}.content[${idx}].showSec`]: !showSec
            });
            return;
        } else if (name == '打赏管理') {
            url = '/tongcheng/rewardManage/rewardManage';
        } else if (name == '下级成员') {
            url = '/dianshang/lower_member/lower_member';
        } else if (name == '分销订单') {
            url = '/dianshang/newdisorder/newdisorder';
        } else if (name == '个人订单') {
            url = '/dianshang/mydisOrder/mydisOrder';
        } else if (name == '分销产品') {
            this.showDispro(0);
        } else if (name == '我的佣金') {
            this.showDispro(1);
        } else if (name == '消息列表') {
            url = '/pages/myMessage/myMessage';
        } else if (name == '团长佣金') {
            url = '/pintuan/groupDeposit/groupDeposit';
        } else if (name == '订单列表') {
            url = '/pintuan/myGrouporder/myGrouporder';
        } else if (name == '大转盘') {
            url = '/dazhuanpan/receive/receive';
        }
        if (name != '会员卡' && name != '店铺管理' && name != '分销产品' && name != '我的佣金') {
            this.turnToPage(url);
        }
    },
    bindAllCoupon: function (e) {
        if (!this.globalData.userInfo.avatarUrl) {
            this.openAuthor();
            return;
        }
        var eventParams = JSON.parse(this.getset(e).eventParams);
        var couponid = eventParams.allcouponid;
        that.sendRequest({
            url: '/newapp/get_coupon',
            method: 'post',
            data: {
                couponid: couponid,
                openid: that.getSessionKey()
            },
            success: function (res) {
                that.showModal({
                    content: res.msg
                });
            }
        })
    },
    bindSeckGoods: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/newseckillDetail/newseckillDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定秒杀商品，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindGroupgoods: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/pintuan/groupGoodsdetail/groupGoodsdetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定拼团商品，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindBargaingoods: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/kanjia/bargainDetail/bargainDetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定砍价商品，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    loadbargain: function (compid, nid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var pagenum = compdata.pagenum;
        var shownum = compdata.shownum;
        var childid = compdata.childid;
        this.sendRequest({
            url: '/appkj/index',
            method: 'post',
            data: {
                nid: nid,
                pageNum: pagenum,
                numPerPage: shownum,
                content: '',
                child_id: childid
            },
            success: function (res) {
                var newdata = {};
                var oldlist = compdata.content;
                newdata[compid + '.loaded'] = true;
                if (res.code == 1) {
                    newdata[compid + '.content'] = oldlist.concat(res.goodlist);
                    newdata[compid + '.havenums'] = res.haveNums;
                    newdata[compid + '.pagenum'] = ++pagenum;
                } else {
                    newdata[compid + '.havenums'] = 0;
                }
                pageInstance.setData(newdata);
            }
        })
    },
    loadmoreBargain: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        if (!pageInstance.data[compid].loaded) {
            return;
        }
        this.loadbargain(compid, nid);
    },
    searchBargain: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var bargainlist = pageInstance.data[compid];
        wx.setStorage({
            key: 'bargainData',
            data: bargainlist
        });
        var url = '/kanjia/searchBargain/searchBargain';
        this.turnToPage(url);
    },
    goToBargainDetail: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var comdata = pageInstance['data'][compid];
        var id = dataset.id;
        var url = "/kanjia/bargainDetail/bargainDetail?id=" + id;
        this.turnToPage(url);
    },
    scrollMoreGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var nid = dataset.nid;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        var orderType = compdata.ordertype;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadGoodsData(compid, nid, orderType, shownum, bindObj, pagenum);
        }
    },
    loadmoreGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var orderType = compdata.ordertype;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        var pagenum = compdata.pagenum;
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadGoodsData(compid, nid, orderType, shownum, bindObj, pagenum);
    },
    scrollMoreGroupGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var nid = dataset.nid;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        var orderType = compdata.ordertype;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        var classtype = compdata.classtype;
        var labelid = compdata.labelid;
        var selshop = compdata.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = compdata.childid;
        }
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadGroupgoodData(compid, nid, orderType, shownum, bindObj, pagenum, classtype, labelid, child_id);
        }
    },
    loadmoreGroupGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var orderType = compdata.ordertype;
        var shownum = compdata.shownum;
        var bindObj = compdata.bindObj;
        var pagenum = compdata.pagenum;
        var classtype = compdata.classtype;
        var labelid = compdata.labelid;
        var selshop = compdata.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = compdata.childid;
        }
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadGroupgoodData(compid, nid, orderType, shownum, bindObj, pagenum, classtype, labelid, child_id);
    },
    scrollMoreSeckGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadnewseckGood(compid);
        }
    },
    loadmoreSeckGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadnewseckGood(compid);
    },
    scrollMoreDisGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadDistGoods(compid);
        }
    },
    loadmoreDisGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadDistGoods(compid);
    },
    loadmoreTakShop: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var shownum = compdata.shownum;
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.takshopInfo(compid, shownum);
    },
    loadArtData: function (compid, type, orderType, shownum) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var pagenum = compdata.pagenum;
        this.sendRequest({
            url: '/webapp/artdata',
            data: {
                nid: type,
                limit: shownum,
                order: orderType,
                pageNum: pagenum
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.data),
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                pageInstance.setData({
                    [`${compid}.nodata`]: true,
                    [`${compid}.loaddata`]: true,
                });
            }
        });
    },
    loadmoreArt: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var shownum = compdata.shownum;
        var type = compdata.listid;
        var orderType = compdata.orderType;
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadArtData(compid, type, orderType, shownum);
    },
    loadProduct: function (compid, nid, orderType, shownum) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var pagenum = compdata.pagenum;
        this.sendRequest({
            url: '/webapp/as_goodslist',
            data: {
                order: orderType,
                limit: shownum,
                nid: nid,
                pageNum: pagenum
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.productList),
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                pageInstance.setData({
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                });
            }
        });
    },
    scrollMoreProduct: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var nid = compdata.listid;
        var orderType = compdata.orderType;
        var shownum = compdata.shownum;
        var prenum = compdata.prenum;
        var pagenum = compdata.pagenum;
        var havenums = compdata.havenums;
        if (prenum != pagenum && havenums != 0) {
            pageInstance.setData({
                [`${compid}.prenum`]: pagenum
            })
            this.loadProduct(compid, nid, orderType, shownum);
        }
    },
    loadmoreProduct: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var nid = compdata.listid;
        var orderType = compdata.orderType;
        var shownum = compdata.shownum;
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadProduct(compid, nid, orderType, shownum);
    },
    loadSubGoods: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var orderType = compdata.ordertype;
        var shownum = compdata.shownum;
        var pagenum = compdata.pagenum;
        this.sendRequest({
            url: '/newapp/mall_store_goods',
            data: {
                order: orderType,
                limit: shownum,
                pageNum: pagenum
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.goods),
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                pageInstance.setData({
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                    [`${compid}.loaded`]: true,
                });
            }
        });
    },
    sel_subgoods_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var sel = dataset.sel;
        var ordertype = compdata.ordertype;
        if (sel == 3) {
            if (ordertype == 3) {
                ordertype = 4;
            } else {
                ordertype = 3;
            }
        } else {
            ordertype = sel;
        }
        pageInstance.setData({
            [`${compid}.ordertype`]: ordertype,
            [`${compid}.content`]: [],
            [`${compid}.prenum`]: 0,
            [`${compid}.havenums`]: 1,
            [`${compid}.nothing`]: false,
            [`${compid}.pagenum`]: 1,
            [`${compid}.loaddata`]: false,
            [`${compid}.loaded`]: false,
        });
        this.loadSubGoods(compid);
    },
    loadmoreSubGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadSubGoods(compid);
    },
    searchSubGoods: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var goodslist = pageInstance.data[compid];
        goodslist.content = [];
        wx.setStorage({
            key: 'goodsData',
            data: goodslist
        });
        var url = '/dianshang/searchSubGoods/searchSubGoods';
        this.turnToPage(url);
    },
    bindServer: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/yuyue/servicedetail/servicedetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定服务，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    bindTech: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/yuyue/techniciandetail/techniciandetail';
        if (id) {
            if (allPages.indexOf(path.substring(1, path.length)) != -1) {
                var url = path + '?id=' + id;
                this.turnToPage(url);
            } else {
                this.showModal({
                    content: '亲-如需绑定技师，需程序满足一定条件，方可调用。'
                })
            }
        }
    },
    loadcityMer: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var shownum = compdata.shownum;
        var pagenum = compdata.pagenum;
        var bindtype = compdata.classnid;
        var lat = compdata.lat;
        var lng = compdata.lng;
        this.sendRequest({
            url: '/city/seller_list',
            data: {
                limit: shownum,
                pageNum: pagenum,
                bindtype: bindtype,
                lat: lat,
                lng: lng
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    var oldlist = compdata.content;
                    pageInstance.setData({
                        [`${compid}.content`]: oldlist.concat(res.shoplist),
                        [`${compid}.pagenum`]: pagenum + 1,
                        [`${compid}.havenums`]: res.havenums
                    });
                }
                var storeType = res.city_storetype;
                pageInstance.setData({
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                    [`${compid}.loaded`]: true,
                    [`${compid}.storeType`]: storeType
                });
            }
        });
    },
    loadmoreCityShop: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadcityMer(compid);
    },
    searchCityShop: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var citylist = pageInstance.data[compid];
        citylist.content = [];
        wx.setStorage({
            key: 'cityData',
            data: citylist
        });
        var url = '/tongcheng/searchCityShop/searchCityShop';
        this.turnToPage(url);
    },
    bindSubshop: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var storeType = eventParams.storeType;
        var url = '';
        if (storeType == 0) {
            url = '/dianshang/shopHome/shopHome?childid=' + id;
        } else if (storeType == 1) {
            url = '/waimai/takshops/takshops?childid=' + id;
        } else if (storeType == 2) {
            url = '/yuyue/appointshopbox/appointshopbox?child_id=' + id;
        } else if (storeType == 3) {
            url = '/tongcheng/storeDetail/storeDetail?child_id=' + id;
        }
        this.turnToPage(url);
    },
    takeoutMap: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var lat = dataset.lat;
        var lng = dataset.lng;
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        wx.openLocation({
            latitude: lat,
            longitude: lng
        })
    },
    choTakshopClass: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.index;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var classidx = compdata.classidx;
        var shownum = compdata.shownum;
        if (classidx != index) {
            pageInstance.setData({
                [`${compid}.classidx`]: index,
                [`${compid}.classnid`]: nid,
                [`${compid}.nothing`]: false,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1,
                [`${compid}.prenum`]: 0,
                [`${compid}.content`]: [],
            });
            this.takshopInfo(compid, shownum);
        }
    },
    choAppointshopClass: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.index;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var classidx = compdata.classidx;
        var shownum = compdata.shownum;
        if (classidx != index) {
            pageInstance.setData({
                [`${compid}.classidx`]: index,
                [`${compid}.classnid`]: nid,
                [`${compid}.nothing`]: false,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1,
                [`${compid}.prenum`]: 0,
                [`${compid}.content`]: [],
            });
            this.appointshopInfo(compid);
        }
    },
    bindList: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var listdata = compdata.listdata;
        var listidx = compdata.listidx;
        var listtype = compdata.listtype;
        var bindIdentid = compdata.bindIdentid;
        var inputstype = compdata.inputstype;
        var nowcomp = listdata[listidx].nowcomp;
        var proidx = listdata[listidx].proidx;
        var searchcompid = nowcomp + proidx;
        var nowdata = {};
        if (listidx != -1) {
            nowdata = pageInstance.data[searchcompid];
            nowdata.showLabel = false;
            nowdata.content = [];
        }
        var url = '';
        if (listtype == 0) {
            this.showModal({
                content: '请先选择绑定的列表'
            });
        } else if (listtype == 1) {
            wx.setStorage({
                key: 'artData',
                data: nowdata
            });
            url = '/wenzhang/searchArticle/searchArticle?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 2) {
            wx.setStorage({
                key: 'goodsData',
                data: nowdata
            });
            url = '/dianshang/searchGoods/searchGoods?bindObj=0&inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 3) {
            wx.setStorage({
                key: 'goodsData',
                data: nowdata
            });
            url = '/dianshang/searchSubGoods/searchSubGoods?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 4) {
            wx.setStorage({
                key: 'shopData',
                data: nowdata
            });
            url = '/dianshang/searchShop/searchShop?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 5) {
            wx.setStorage({
                key: 'goodsData',
                data: nowdata
            });
            url = '/pintuan/searchGroupgoods/searchGroupgoods?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 6) {
            wx.setStorage({
                key: 'seckData',
                data: nowdata
            });
            url = '/dianshang/searchSeck/searchSeck?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 7) {
            wx.setStorage({
                key: 'distData',
                data: nowdata
            });
            url = '/dianshang/searchDist/searchDist?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 8) {
            var lat = 0;
            var lng = 0;
            that.getLocation({
                success: function (res) {
                    lat = res.latitude;
                    lng = res.longitude;
                    url = '/waimai/searchTakshop/searchTakshop?searchTxt=' + nowdata.searchText + '&lng=' + lng + '&lat=' + lat + '&nid=' + nowdata.classnid + '&inputstype=' + inputstype;
                    that.turnToPage(url);
                }
            })
        } else if (listtype == 9) {
            wx.setStorage({
                key: 'artData',
                data: nowdata
            });
            url = '/shequ/searchTopic/searchTopic?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 10) {
            var lat = 0;
            var lng = 0;
            this.getLocation({
                success: function (res) {
                    lat = res.latitude;
                    lng = res.longitude;
                    nowdata.lat = lat;
                    nowdata.lng = lng;
                    wx.setStorage({
                        key: 'cityData',
                        data: nowdata
                    });
                    url = '/tongcheng/searchCityShop/searchCityShop?inputstype=' + inputstype;
                    that.turnToPage(url);
                }
            })
        } else if (listtype == 11) {
            wx.setStorage({
                key: 'serviceData',
                data: nowdata
            });
            url = '/yuyue/searchService/searchService?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 12) {
            wx.setStorage({
                key: 'techData',
                data: nowdata
            });
            url = '/yuyue/searchTech/searchTech?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 13) {
            wx.setStorage({
                key: 'apposhopData',
                data: nowdata
            });
            url = '/yuyue/searchAppointshop/searchAppointshop?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 14) {
            wx.setStorage({
                key: 'bargainData',
                data: nowdata
            });
            url = '/kanjia/searchBargain/searchBargain?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 15) {
            wx.setStorage({
                key: 'proData',
                data: nowdata
            });
            url = '/chanpin/searchProduct/searchProduct?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 16) {
            wx.setStorage({
                key: 'newdistData',
                data: nowdata
            });
            url = '/dianshang/searchNewDist/searchNewDist?inputstype=' + inputstype;
            that.turnToPage(url);
        } else if (listtype == 17) {
            var lat = 0;
            var lng = 0;
            this.getLocation({
                success: function (res) {
                    lat = res.latitude;
                    lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (rres) {
                            nowdata.lat = lat;
                            nowdata.lng = lng;
                            nowdata.city = rres.city;
                            wx.setStorage({
                                key: 'newcityData',
                                data: nowdata
                            });
                            var pagetit = pageInstance.pagetit;
                            url = '/tongcheng/searchThecity/searchThecity?inputstype=' + inputstype + '&title=' + pagetit;
                            that.turnToPage(url);
                        }
                    })
                }
            })
        } else if (listtype == 18) {
            wx.setStorage({
                key: 'goodshopData',
                data: nowdata
            });
            url = '/dianshang/searchGoodsshop/searchGoodsshop';
            that.turnToPage(url);
        }
    },
    loadNewDistGoods: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var order = comdata.orderType;
        var shownum = comdata.shownum;
        var nid;
        var label;
        var style = comdata.classtype;
        if (style == 1) {
            nid = comdata.listid;
        } else {
            label = comdata.labelid;
        }
        var pagenum = comdata.pagenum;
        var selshop = comdata.selshop;
        var child_id = -1;
        if (selshop == 0) {
            child_id = comdata.childid;
        }
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/disweb/disAllgoods',
            method: 'post',
            data: {
                openid: openid,
                order: order,
                nid: nid,
                limit: shownum,
                pageNum: pagenum,
                style: style,
                label: label,
                child_id: child_id
            },
            success: function (res) {
                var goodlist = [];
                if (res.code == 1) {
                    var oldList = comdata.goodlist;
                    goodlist = oldList.concat(res.good);
                    pagenum = pagenum + 1;
                    var havenums = res.havenums;
                } else {
                    var havenums = 0;
                }
                pageInstance.setData({
                    [`${compid}.goodlist`]: goodlist,
                    [`${compid}.status`]: res.code,
                    [`${compid}.loaded`]: true,
                    [`${compid}.pagenum`]: pagenum,
                    [`${compid}.havenums`]: havenums,
                    [`${compid}.nothing`]: true,
                    [`${compid}.loaddata`]: true,
                })
            }
        })
    },
    loadmoreNewDisGood: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        if (!compdata.loaddata) {
            return;
        }
        pageInstance.setData({
            [`${compid}.loaddata`]: false
        })
        this.loadNewDistGoods(compid);
    },
    sel_newdist_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var sel = dataset.sel;
        var order = compdata.orderType;
        if (sel != order || sel == 3) {
            if (sel == 3) {
                if (order == 3) {
                    order = 4;
                } else {
                    order = 3;
                }
            } else {
                order = sel;
            }
            pageInstance.setData({
                [`${compid}.typeIndex`]: '',
                [`${compid}.distname`]: '',
                [`${compid}.isactive`]: false,
                [`${compid}.goodlist`]: [],
                [`${compid}.number`]: 1,
                [`${compid}.orderType`]: order,
                [`${compid}.prenum`]: 0,
                [`${compid}.havenums`]: 1,
                [`${compid}.pagenum`]: 1,
                [`${compid}.nothing`]: false,
                [`${compid}.loaddata`]: false,
            });
            this.loadNewDistGoods(compid);
        }
    },
    searchNewDist: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        wx.setStorage({
            key: 'newdistData',
            data: comdata
        });
        var url = "/dianshang/searchNewDist/searchNewDist";
        this.turnToPage(url);
    },
    checkNotice: function () {
        let pageInstance = this.getNowPage();
        var openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/newapp/checkNotice',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        isset: res.isset
                    })
                }
            }
        })
    },
    bindNewDisgood: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        var allPages = this.globalData.Allpages;
        var path = '/dianshang/distDetail/distDetail';
        var url = path + '?id=' + id + '&disgrade=' + this.globalData.disgrade + '&num=1';
        if (id) {
            this.turnToPage(url);
        }
    },
    getuserinfo: function (e) {
        var detail = e.detail;
        var userInfo = detail.userInfo;
        let pageInstance = this.getNowPage();
        if (userInfo) {
            pageInstance.setData({
                userInfo: userInfo,
            });
            that.sendRequest({
                url: '/webapp/senduserInfo',
                method: 'post',
                data: {
                    nickname: userInfo['nickName'],
                    gender: userInfo['gender'],
                    city: userInfo['city'],
                    province: userInfo['province'],
                    avatarUrl: userInfo['avatarUrl'],
                    country: userInfo['country'],
                    disopenid: that.globalData.disopenid
                },
                success: function (res) {
                    if (res.code == 1) {
                        that.setUserInfoStorage(userInfo);
                        that.globalData.disgrade = res.dis_grade;
                        pageInstance.setData({
                            disgrade: res.dis_grade,
                            hasgift: res.hasgift || false,
                            coureduce: res.coureduce || '',
                            coufull: res.coufull || ''
                        })
                    }
                }
            })
        } else {
            // pageInstance.setData({
            //     chooseAuthor: false
            // });
        }
    },
    goToCancelOrder: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var orderid = dataset.orderid;
        var index = dataset.idx;
        var compid = dataset.compid;
        var comdata = pageInstance['data'][compid];
        var orderList = comdata.orderList;
        var cid = dataset.cid;
        var openid = this.globalData.sessionKey;
        this.showModal({
            content: '确认取消订单？',
            showCancel: true,
            confirm: function () {
                that.sendRequest({
                    url: '/newapp/cancelOrders',
                    method: 'post',
                    data: {
                        openid: openid,
                        order_id: orderid
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            orderList[index].status = 6;
                            pageInstance.setData({
                                [`${compid}.orderList`]: orderList
                            });
                        } else {
                            that.showModal({
                                content: res.msg
                            })
                        }
                    }
                })
            }
        })
    },
    showPaybox: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.idx;
        var orderid = dataset.orderid;
        var childid = dataset.childid;
        var realmoney = dataset.realmoney;
        var comdata = pageInstance['data'][compid];
        var animation2 = wx.createAnimation({
            duration: 200,
        })
        pageInstance.animation2 = animation2;
        pageInstance.animation2.bottom('0rpx').step();
        var payanimate = pageInstance.animation2.export();
        var showpay = true;
        pageInstance.setData({
            [`${compid}.selIdx`]: index,
            [`${compid}.payanimate`]: payanimate,
            [`${compid}.showpay`]: showpay,
            [`${compid}.orderid`]: orderid,
            [`${compid}.child_id`]: childid,
            [`${compid}.realmoney`]: realmoney,
        })
    },
    hidePaybox: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var comdata = pageInstance['data'][compid];
        var animation2 = wx.createAnimation({
            duration: 200,
        })
        pageInstance.animation2 = animation2;
        pageInstance.animation2.bottom('-300rpx').step();
        var orderList = comdata.orderList;
        var index = comdata.selIdx;
        var payanimate = pageInstance.animation2.export();
        var showpay = false;
        pageInstance.setData({
            [`${compid}.payanimate`]: payanimate,
            [`${compid}.showpay`]: showpay
        })
    },
    goToPay: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var openid = this.globalData.sessionKey;
        var cid = dataset.cid;
        var index = dataset.idx;
        var comdata = pageInstance['data'][compid];
        var orderid = comdata.orderid;
        var orderList = comdata.orderList;
        if (paysubmit) {
            return;
        }
        paysubmit = true;
        that.sendRequest({
            url: '/newapp/eatPay',
            method: 'post',
            data: {
                orderid: orderid,
                openid: that.getSessionKey()
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
                            that.sendNotice(res.payinfo.package, res.orderid, data.errmsg, 1, cid);
                            orderList[index].status = 7;
                            pageInstance.setData({
                                [`${compid}.orderList`]: orderList
                            });
                            that.hidePaybox(dataset);
                        },
                        fail: function () {
                            paysubmit = false;
                        }
                    })
                } else if (res.code == 100) {
                    paysubmit = false;
                    orderList[index].status = 7;
                    pageInstance.setData({
                        [`${compid}.orderList`]: orderList
                    });
                } else {
                    paysubmit = false;
                    that.showModal({
                        content: res.msg
                    })
                }
            }
        })
    },
    sendNotice: function (formid, orderid, errmsg, status, childid) {
        var openid = this.globalData.sessionKey;
        this.sendRequest({
            url: "/takeout/sendNotice",
            method: 'post',
            data: {
                status: status,
                openid: openid,
                formid: formid,
                order_id: orderid,
                errmsg: errmsg,
                child_id: childid
            },
            success: function (res) {
            }
        });
    },
    cleartime: function () {
        var pageInstance = this.getNowPage();
        var seckArr = pageInstance.newseckillArr;
        for (var i = 0; i < seckArr.length; i++) {
            let compid = seckArr[i].name;
            let newtimer = pageInstance['data'][compid].newtimer;
            clearInterval(newtimer)
        }
    },
    showDispro: function (num) {
        let pageInstance = this.getNowPage();
        var openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/webapp/isDisUser',
            method: 'post',
            data: {
                openid: openid
            },
            success: function (res) {
                if (res.id > 0) {
                    var url = '';
                    if (num == 0) {
                        url = '/dianshang/disProduct/disProduct';
                    } else if (num == 1) {
                        url = '/dianshang/myDeposit/myDeposit';
                    }
                    var tabBarPagePathArr1 = that.globalData.tabBarPagePathArr;
                    if (tabBarPagePathArr1.indexOf(url) != -1) {
                        that.switchToTab(url);
                    } else {
                        that.turnToPage(url);
                    }
                } else {
                    that.showModal({
                        content: '您目前还不是分销商哦'
                    })
                }
            }
        });
    },
    checkFirst: function () {
        var pageInstance = this.getNowPage();
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/newapp/isFirst',
            method: 'post',
            data: {
                openid: openid,
                child_id: 0
            },
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        showRed: true,
                        redid: res.activity_id,
                        redcode: res.redcode
                    })
                }
            }
        });
    },
    bindRedpacket: function () {
        let pageInstance = this.getNowPage();
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/newapp/loginRed',
            method: 'post',
            data: {
                openid: openid,
                child_id: 0
            },
            success: function (res) {
                if (res.code == 1) {
                    pageInstance.setData({
                        showRed: true,
                        redid: res.activity_id,
                        redcode: 1
                    })
                } else {
                    that.toast({
                        title: res.msg
                    });
                }
            }
        });
    },
    loadCouponList: function (compid) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var datatype = comdata.datatype - 1;
        var ordertype = comdata.orderType;
        var shownum = comdata.shownum;
        var pagenum = comdata.pagenum;
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/newapp/zuCoupList',
            method: 'post',
            data: {
                openid: openid,
                guding: datatype,
                num: shownum,
                paixu: ordertype,
                pageNum: pagenum
            },
            success: function (res) {
                var couponlist = [];
                var havenums = 0;
                if (res.code == 1) {
                    if (datatype == 1) {
                        pagenum = pagenum + 1;
                        havenums = res.havenums;
                    }
                    couponlist = comdata.couponlist.concat(res.list);
                }
                pageInstance.setData({
                    [`${compid}.couponlist`]: couponlist,
                    [`${compid}.loaded`]: true,
                    [`${compid}.pagenum`]: pagenum,
                    [`${compid}.haveNums`]: havenums,
                    [`${compid}.nothing`]: true
                })
            }
        })
    },
    loadMoreCoupon: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var datatype = comdata.datatype;
        if (datatype == 2) {
            var prenum = comdata.prenum;
            var pagenum = comdata.pagenum;
            var havenums = comdata.haveNums;
            if (prenum != pagenum && havenums != 0) {
                pageInstance.setData({
                    [`${compid}.prenum`]: pagenum
                })
                this.loadCouponList(compid);
            }
        }
    },
    getNewCoupon: function (e) {
        if (!this.globalData.userInfo.avatarUrl) {
            this.openAuthor();
            return;
        }
        var dataset = this.getset(e);
        var cid = dataset.cid;
        var pageInstance = this.getNowPage();
        var pagedata = pageInstance['data'];
        that.sendRequest({
            url: '/newapp/get_coupon',
            method: 'post',
            data: {
                couponid: cid,
                openid: that.getSessionKey()
            },
            success: function (res) {
                that.toast({
                    title: res.msg
                });
                for (var item in pagedata) {
                    var coupon = pagedata[item];
                    if (coupon.type == 'couponlist') {
                        var coupdata = coupon['couponlist'];
                        for (var i = 0; i < coupdata.length; i++) {
                            if (coupdata[i].id == cid) {
                                coupdata[i].gettype = res.gettype;
                                break;
                            }
                        }
                        pageInstance.setData({
                            [`${item}.couponlist`]: coupdata
                        })
                    }
                }
            }
        })
    },
    choCityClass: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.index;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var classidx = compdata.classidx;
        var shownum = compdata.shownum;
        if (classidx != index) {
            pageInstance.setData({
                [`${compid}.classidx`]: index,
                [`${compid}.classnid`]: nid,
                [`${compid}.nothing`]: false,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1,
                [`${compid}.prenum`]: 0,
                [`${compid}.content`]: []
            });
            this.loadcityMer(compid);
        }
    },
    goodsshopInfo: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var lat = compdata.lat;
        var lng = compdata.lng;
        var numPerPage = compdata.shownum;
        var pageNum = compdata.pagenum || 1;
        var nid = compdata.classnid;
        this.sendRequest({
            url: '/newapp/goodsStoreList',
            data: {
                lng: lng,
                lat: lat,
                numPerPage: numPerPage,
                storename: '',
                pageNum: pageNum,
                nid: nid
            },
            method: 'post',
            success: function (res) {
                if (res.code == 1) {
                    pageNum++;
                    var oldlist = compdata.content;
                    var newlist = oldlist.concat(res.sonstoreArr);
                    pageInstance.setData({
                        [`${compid}.content`]: newlist,
                        [`${compid}.haveNums`]: res.haveNums,
                        [`${compid}.pagenum`]: pageNum
                    });
                } else {
                    pageInstance.setData({
                        [`${compid}.haveNums`]: 0
                    });
                }
                var storeType = res.store_type;
                pageInstance.setData({
                    [`${compid}.loaded`]: true,
                    [`${compid}.nothing`]: true,
                    [`${compid}.storeType`]: storeType
                });
            }
        })
    },
    searchGoodsShop: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var goodsshoplist = pageInstance.data[compid];
        wx.setStorage({
            key: 'goodshopData',
            data: goodsshoplist
        });
        var url = '/dianshang/searchGoodsshop/searchGoodsshop';
        this.turnToPage(url);
    },
    goToShopHome: function (e) {
        var compid = this.getset(e).compid;
        var index = this.getset(e).index;
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var child_id = compdata.content[index].child_id;
        var url = '/dianshang/shopHome/shopHome?childid=' + child_id;
        this.turnToPage(url);
    },
    loadmoreGshops: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        if (!pageInstance.data[compid].loaded) {
            return;
        }
        var newdata = {};
        this.getLocation({
            success: function (res) {
                var lat = res.latitude;
                var lng = res.longitude;
                that.sendRequest({
                    url: '/webapp/getLocation',
                    method: 'post',
                    data: {
                        lat: lat,
                        lng: lng
                    },
                    success: function (res) {
                        newdata[compid + '.lat'] = lat;
                        newdata[compid + '.lng'] = lng;
                        newdata[compid + '.address'] = res.province + res.city + res.district + res.street;
                        newdata[compid + '.loaded'] = true;
                        pageInstance.setData(newdata);
                        that.goodsshopInfo(compid);
                    }
                })
            },
            fail: function (res) {
                newdata[compid + '.lat'] = '';
                newdata[compid + '.lng'] = '';
                newdata[compid + '.address'] = '';
                newdata[compid + '.loaded'] = true;
                pageInstance.setData(newdata);
            }
        })
    },
    choGoodsshopClass: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.index;
        var nid = dataset.nid;
        var compdata = pageInstance.data[compid];
        var classidx = compdata.classidx;
        var shownum = compdata.shownum;
        if (classidx != index) {
            pageInstance.setData({
                [`${compid}.classidx`]: index,
                [`${compid}.classnid`]: nid,
                [`${compid}.nothing`]: false,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1,
                [`${compid}.prenum`]: 0,
                [`${compid}.content`]: [],
            });
            this.goodsshopInfo(compid);
        }
    },
    textCopy: function (e) {
        var dataset = this.getset(e);
        var text = dataset.text;
        wx.setClipboardData({
            data: text,
        })
    },
    searchThecity: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var cityData = pageInstance.data[compid];
        var title = pageInstance.pagetit;
        wx.setStorage({
            key: 'newcityData',
            data: cityData
        });
        var url = '/tongcheng/searchThecity/searchThecity?title=' + title;
        this.turnToPage(url);
    },
    searchCitylocation: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var cityData = pageInstance.data[compid];
        wx.setStorage({
            key: 'newcityData',
            data: cityData
        });
        var url = '/tongcheng/searchLocation/searchLocation?compid=' + compid;
        this.turnToPage(url);
    },
    theCityLoad: function () {
        var pageInstance = this.getNowPage();
        var theCityArr = pageInstance.theCityArr;
        if (theCityArr.length > 0) {
            var newdata = {};
            that.getLocation({
                success: function (res) {
                    var lat = res.latitude;
                    var lng = res.longitude;
                    that.sendRequest({
                        url: '/webapp/getLocation',
                        method: 'post',
                        data: {
                            lat: lat,
                            lng: lng
                        },
                        success: function (res) {
                            for (var i = 0; i < theCityArr.length; i++) {
                                let compid = theCityArr[i].name;
                                let compdata = pageInstance.data[compid];
                                let nid = theCityArr[i].nid;
                                let shownum = theCityArr[i].shownum;
                                let orderType = theCityArr[i].orderType;
                                let city = compdata.city;
                                newdata[compid + '.content'] = [];
                                newdata[compid + '.havaData'] = false;
                                newdata[compid + '.prenum'] = 0;
                                newdata[compid + '.pageNum'] = 1;
                                newdata[compid + '.havenums'] = 1;
                                newdata[compid + '.isaddress'] = 1;
                                newdata[compid + '.loaded'] = true;
                                if (!city) {
                                    newdata[compid + '.lat'] = lat;
                                    newdata[compid + '.lng'] = lng;
                                    newdata[compid + '.city'] = res.city;
                                    newdata[compid + '.location_address'] = res.province + res.city + res.district + res.street;
                                } else {
                                    newdata[compid + '.lat'] = '';
                                    newdata[compid + '.lng'] = '';
                                }
                                pageInstance.setData(newdata);
                                that.cityInit(compid, nid, shownum, orderType);
                            }
                        }
                    })
                },
                fail: function (res) {
                    for (var i = 0; i < theCityArr.length; i++) {
                        let compid = theCityArr[i].name;
                        let nid = theCityArr[i].nid;
                        let shownum = theCityArr[i].shownum;
                        let orderType = theCityArr[i].orderType;
                        newdata[compid + '.content'] = [];
                        newdata[compid + '.havaData'] = false;
                        newdata[compid + '.lat'] = '';
                        newdata[compid + '.lng'] = '';
                        newdata[compid + '.city'] = res.city;
                        newdata[compid + '.prenum'] = 0;
                        newdata[compid + '.pageNum'] = 1;
                        newdata[compid + '.havenums'] = 1;
                        newdata[compid + '.isaddress'] = 0;
                        newdata[compid + '.loaded'] = true;
                        pageInstance.setData(newdata);
                        that.cityInit(compid, nid, shownum, orderType);
                    }
                }
            })
        }
    },
    getDislevel: function () {
        var pageInstance = this.getNowPage();
        this.sendRequest({
            url: '/disweb/getDisLevel',
            data: {
            },
            method: 'post',
            success: function (res) {
                that.globalData.dislevel = res.dis_level;
                pageInstance.setData({
                    dislevel: res.dis_level
                })
            }
        })
    },
    loadHouseAprt: function (compid) {
        var pageInstance = this.getNowPage();
        var sWidth;
        wx.getSystemInfo({
            success: function (res) {
                sWidth = res.windowWidth - 20;
            }
        })
        var compdata = pageInstance.data[compid];
        var child_id = compdata.childid;
        var enter_time = compdata.enter_time;
        var leave_time = compdata.leave_time;
        var enter = compdata.enter;
        let openid = this.globalData.sessionKey;
        this.sendRequest({
            url: '/webhotel/index',
            method: 'post',
            data: {
                openid: openid,
                child_id: child_id,
                enter_time: enter_time,
                leave_time: leave_time,
                enter: enter
            },
            success: function (res) {
                var newdata = {};
                newdata[compid + '.loaded'] = true;
                if (res.code == 1) {
                    var description = res.hotel.long_description;
                    var describe = WxParse.wxParse('default', 'html', description, pageInstance);
                    newdata[compid + '.nothing'] = true;
                    var enter_time = res.enter_time;
                    var enter_range = res.enter_range;
                    var leave_time = res.leave_time;
                    var leave_range = res.leave_range;
                    newdata[compid + '.now_time'] = res.now_time;
                    newdata[compid + '.enter_time'] = enter_time;
                    newdata[compid + '.enter_range'] = enter_range;
                    newdata[compid + '.leave_time'] = leave_time;
                    newdata[compid + '.leave_start'] = res.leave_starttime;
                    newdata[compid + '.leave_range'] = leave_range;
                    newdata[compid + '.night'] = res.night;
                    newdata[compid + '.homeTypeinfo'] = res.homeTypeinfo;
                    newdata[compid + '.ave_score'] = res.ave_score;
                    newdata[compid + '.allComment'] = res.all;
                    newdata[compid + '.comment'] = res.comment;
                    newdata[compid + '.hotel'] = res.hotel;
                    newdata[compid + '.describe'] = describe;
                    var enter_val = enter_time.split('-');
                    var inmonth = enter_val[1];
                    var inday = enter_val[2];
                    newdata[compid + '.inDate'] = inmonth + '月' + inday + '日';
                    var leave_val = leave_time.split('-');
                    var outmonth = leave_val[1];
                    var outday = leave_val[2];
                    newdata[compid + '.outDate'] = outmonth + '月' + outday + '日';
                } else {
                    that.showModal({
                        content: '请先设置酒店信息'
                    });
                }
                pageInstance.setData(newdata);
            }
        })
    },
    loadHotelList: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var nid = compdata.nid;
        var lat = compdata.lat;
        var lng = compdata.lng;
        var numPerPage = compdata.shownum;
        var pageNum = compdata.pagenum || 1;
        var storename = compdata.storename || '';
        var zong = compdata.zong;
        var orderstr = compdata.orderstr;
        var ordertype = compdata.ordertype;
        this.sendRequest({
            url: '/webhotel/hotel_storelist',
            method: 'post',
            data: {
                lng: lng,
                lat: lat,
                storename: storename,
                pageNum: pageNum,
                numPerPage: numPerPage,
                zong: zong,
                orderstr: orderstr,
                ordertype: ordertype,
                nid: nid
            },
            success: function (res) {
                if (res.code == 1) {
                    var newdata = {};
                    var oldlist = compdata.content;
                    var hotellist = oldlist.concat(res.sonstoreArr);
                    newdata[compid + '.pagenum'] = pageNum + 1;
                    newdata[compid + '.haveNums'] = res.haveNums;
                    newdata[compid + '.nothing'] = true;
                    newdata[compid + '.loaded'] = true;
                    newdata[compid + '.store_type'] = res.store_type;
                    newdata[compid + '.content'] = hotellist;
                    pageInstance.setData(newdata);
                } else {
                    pageInstance.setData({
                        [`${compid}.haveNums`]: 0,
                        [`${compid}.nothing`]: true,
                        [`${compid}.loaded`]: true,
                    });
                }
            }
        })
    },
    sel_hotel_type: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var type = dataset.type;
        var compdata = pageInstance.data[compid];
        var ordertype = compdata.ordertype;
        var orderstr = compdata.orderstr;
        if (ordertype != type || type != 0) {
            var newdata = {};
            if (ordertype == type) {
                if (orderstr == 1) {
                    newdata[compid + '.orderstr'] = 2;
                } else {
                    newdata[compid + '.orderstr'] = 1;
                }
            } else {
                newdata[compid + '.orderstr'] = 1;
            }
            newdata[compid + '.ordertype'] = type;
            newdata[compid + '.pagenum'] = 1;
            newdata[compid + '.haveNums'] = 1;
            newdata[compid + '.content'] = [];
            newdata[compid + '.nothing'] = false;
            newdata[compid + '.loaded'] = false;
            pageInstance.setData(newdata);
            this.loadHotelList(compid)
        }
    },
    openHotelMap: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        wx.chooseLocation({
            success: function (res) {
                pageInstance.setData({
                    [`${compid}.address`]: res.name,
                    [`${compid}.lat`]: res.latitude,
                    [`${compid}.lng`]: res.longitude,
                    [`${compid}.pagenum`]: 1,
                    [`${compid}.haveNums`]: 1,
                    [`${compid}.content`]: [],
                    [`${compid}.nothing`]: false,
                    [`${compid}.loaded`]: false,
                })
                that.loadHotelList(compid);
            }
        })
    },
    enterHotelName: function (e) {
        var compid = this.getset(e).compid;
        let val = e.detail.value;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.storename`]: val
        })
    },
    searchHotel: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.pagenum`]: 1,
            [`${compid}.haveNums`]: 1,
            [`${compid}.content`]: [],
            [`${compid}.nothing`]: false,
            [`${compid}.loaded`]: false,
        })
        this.loadHotelList(compid);
    },
    sel_showCla: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.showCla`]: !pageInstance.data[compid].showCla
        })
    },
    hotelTap: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var nid = dataset.nid;
        pageInstance.setData({
            [`${compid}.selnid`]: nid,
        });
    },
    sure_hotel_nid: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var type = dataset.type;
        var compdata = pageInstance.data[compid];
        if (type == 1) {
            pageInstance.setData({
                [`${compid}.selnid`]: compdata.nid,
            });
            this.sel_showCla(exists(id));
        } else {
            pageInstance.setData({
                [`${compid}.nid`]: compdata.selnid,
                [`${compid}.pagenum`]: 1,
                [`${compid}.haveNums`]: 1,
                [`${compid}.content`]: [],
                [`${compid}.nothing`]: false,
                [`${compid}.loaded`]: false,
            });
            this.sel_showCla(e);
            this.loadHotelList(compid);
        }
    },
    loadmoreHotel: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.loaded`]: false,
        });
        this.loadHotelList(compid);
    },
    gotoHotel: function (e) {
        var dataset = this.getset(e);
        var childid = dataset.childid;
        var url = '/jiudian/hotelIndex/hotelIndex?child_id=' + childid;
        this.turnToPage(url);
    },
    chooseHouseNav: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var index = dataset.index;
        var compdata = pageInstance.data[compid];
        var navIdx = compdata.navIdx;
        if (index != navIdx) {
            pageInstance.setData({
                [`${compid}.navIdx`]: index
            })
        }
    },
    bindHoutelPicker: function (e) {
        var dataset = this.getset(e);
        var value = e.detail.value;
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var type = dataset.type;
        var enter = dataset.enter;
        var from = dataset.from;
        var compdata = pageInstance.data[compid];
        var val = value.split('-');
        var month = val[1];
        var day = val[2];
        var date = month + '月' + day + '日';
        if (type == 'in') {
            pageInstance.setData({
                [`${compid}.enter`]: enter,
                [`${compid}.inDate`]: date,
                [`${compid}.enter_time`]: value
            })
        } else if (type == 'out') {
            pageInstance.setData({
                [`${compid}.enter`]: enter,
                [`${compid}.outDate`]: date,
                [`${compid}.leave_time`]: value
            })
        }
        if (from !== 'search') {
            this.loadHouseAprt(compid);
        } else {
            this.getsearchDate(compid, enter);
        }
    },
    goToRoomDetail: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var compid = dataset.compid;
        var houseid = dataset.houseid;
        var comdata = pageInstance['data'][compid];
        var child_id = comdata.childid;
        var enter_time = comdata.enter_time;
        var leave_time = comdata.leave_time;
        var url = '/jiudian/houseDetail/houseDetail?houseid=' + houseid + '&enter_time=' + enter_time + '&leave_time=' + leave_time + '&child_id=' + child_id;
        this.turnToPage(url);
    },
    getsearchDate: function (compid, enter) {
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var enter_time = comdata.enter_time;
        var leave_time = comdata.leave_time;
        this.sendRequest({
            url: '/webhotel/getSearchTime',
            method: 'post',
            data: {
                enter: enter,
                enter_time: enter_time,
                leave_time: leave_time
            },
            success: function (res) {
                let newdata = {};
                newdata[compid + '.now_time'] = res.now_time;
                newdata[compid + '.enter_time'] = res.enter_time;
                newdata[compid + '.leave_time'] = res.leave_time;
                newdata[compid + '.enter_range'] = res.enter_range;
                newdata[compid + '.leave_range'] = res.leave_range;
                newdata[compid + '.night'] = res.night;
                newdata[compid + '.leave_start'] = res.leave_starttime;
                var enter_val = res.enter_time.split('-');
                var inmonth = enter_val[1];
                var inday = enter_val[2];
                newdata[compid + '.inDate'] = inmonth + '月' + inday + '日';
                var leave_val = res.leave_time.split('-');
                var outmonth = leave_val[1];
                var outday = leave_val[2];
                newdata[compid + '.outDate'] = outmonth + '月' + outday + '日';
                pageInstance.setData(newdata);
            }
        })
    },
    gotoHotelSearch: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        var comdata = pageInstance['data'][compid];
        var enter_time = comdata.enter_time;
        var leave_time = comdata.leave_time;
        var zong = comdata.zong;
        var listid = comdata.listid;
        var type = dataset.type;
        var storename = '';
        if (type == 2) {
            storename = comdata.storename || '';
        }
        var url = '/jiudian/hotellist/hotellist?storename=' + storename + '&zong=' + zong + '&listid=' + listid + '&enter_time=' + enter_time + '&leave_time=' + leave_time;
        this.turnToPage(url);
    },
    bindTurntable: function () {
        if (dzbjump) {
            return;
        }
        dzbjump = true;
        var openid = this.getSessionKey();
        this.sendRequest({
            url: '/webreward/index',
            method: 'post',
            data: {
                openid: openid,
            },
            success: function (res) {
                setTimeout(function () {
                    dzbjump = false;
                }, 500);
                if (res.code == 1) {
                    var url = '/dazhuanpan/turntable/turntable';
                    that.turnToPage(url);
                } else {
                    that.toast({ title: res.msg });
                }
            }
        })
    },
    senIntegral: function () {
        var pageInstance = that.getNowPage();
        var newpersonArr = pageInstance.newpersonArr;
        if (newpersonArr.length > 0) {
            that.sendRequest({
                url: '/webapp/myIntegral',
                method: 'post',
                data: {
                    openid: that.getSessionKey()
                },
                success: function (res) {
                    pageInstance.setData({
                        total: res.integral
                    });
                }
            });
        }
    },
    aderror: function (e) {
        var dataset = this.getset(e);
        var compid = dataset.compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.iserror`]: true
        })
    },
    gotoAddGoods: function (e) {
        var dataset = this.getset(e);;
        var id = dataset.id;
        var compid = dataset.compid;
        var goodname = dataset.goodname;
        var picpath = dataset.picpath;
        var bindObj = dataset.bindobj;
        var typearr = [];
        var typestr = '';
        var chooseprice = 0;
        var spec_id = 0;
        var pageInstance = this.getNowPage();
        this.sendRequest({
            url: '/webapp/get_goods_desc',
            method: 'post',
            data: {
                goodsid: id,
                goodstype: bindObj,
            },
            success: function (res) {
                var goodspec = res.goodspec;
                var inventoryprice = res.inventoryprice;
                for (let i = 0; i < goodspec.length; i++) {
                    for (let j = 0; j < goodspec[i]['two'].length; j++) {
                        if (j == 0) {
                            goodspec[i]['two'][j].ischoose = true;
                            let nameone = goodspec[i].nameone;
                            let nametwo = goodspec[i]['two'][j].nametwo;
                            let name = nameone + ":" + nametwo;
                            typearr.push(name)
                            typestr += name + ' '
                        } else {
                            goodspec[i]['two'][j].ischoose = false;
                        }
                    }
                }
                for (let i = 0; i < inventoryprice.length; i++) {
                    if (inventoryprice[i].spec_desc.includes(typestr)) {
                        chooseprice = inventoryprice[i].price;
                        spec_id = inventoryprice[i].spec_id;
                    }
                }
                pageInstance.setData({
                    [`${compid}.showPageGoods`]: true,
                    [`${compid}.goodspec`]: goodspec,
                    [`${compid}.inventoryprice`]: inventoryprice,
                    [`${compid}.typearr`]: typearr,
                    [`${compid}.typestr`]: typestr,
                    [`${compid}.chooseprice`]: chooseprice,
                    [`${compid}.spec_id`]: spec_id,
                    [`${compid}.goodname`]: goodname,
                    [`${compid}.goodid`]: id,
                    [`${compid}.picpath`]: picpath,
                    [`${compid}.goodsnum`]: 1,
                })
            }
        })
    },
    gotoCart: function (e) {
        var url = '/pages/shopCart/shopCart';
        this.turnToPage(url);
    },
    close_page_goods: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);;
        var compid = dataset.compid;
        pageInstance.setData({
            [`${compid}.showPageGoods`]: false
        })
    },
    chooseType: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);;
        var compid = dataset.compid;
        var index = dataset.index;
        var tindex = dataset.tindex;
        var nameone = dataset.nameone;
        var nametwo = dataset.nametwo;
        var compdata = pageInstance.data[compid];
        var goodspec = compdata.goodspec;
        var inventoryprice = compdata.inventoryprice;
        var typearr = [];
        var typestr = '';
        var chooseprice = 0;
        var spec_id = 0;
        for (let i = 0; i < goodspec.length; i++) {
            if (i == index) {
                for (let j = 0; j < goodspec[i]['two'].length; j++) {
                    if (j == tindex) {
                        goodspec[i]['two'][j].ischoose = true
                    } else {
                        goodspec[i]['two'][j].ischoose = false
                    }
                }
            }
            for (let j = 0; j < goodspec[i]['two'].length; j++) {
                if (goodspec[i]['two'][j].ischoose) {
                    let nameone = goodspec[i].nameone;
                    let nametwo = goodspec[i]['two'][j].nametwo;
                    let name = nameone + ":" + nametwo;
                    typearr.push(name)
                    typestr += name + ' '
                }
            }
        }
        for (let i = 0; i < inventoryprice.length; i++) {
            if (inventoryprice[i].spec_desc.includes(typestr)) {
                chooseprice = inventoryprice[i].price;
                spec_id = inventoryprice[i].spec_id;
            }
        }
        pageInstance.setData({
            [`${compid}.goodspec`]: goodspec,
            [`${compid}.typearr`]: typearr,
            [`${compid}.typestr`]: typestr,
            [`${compid}.chooseprice`]: chooseprice,
            [`${compid}.spec_id`]: spec_id,
        })
    },
    changeCartnum: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);;
        var compid = dataset.compid;
        var type = dataset.type;
        var compdata = pageInstance.data[compid];
        var goodsnum = compdata.goodsnum;
        if (type == 0) {
            if (goodsnum > 1) {
                goodsnum -= 1;
            }
        } else {
            goodsnum += 1;
        }
        pageInstance.setData({
            [`${compid}.goodsnum`]: goodsnum
        })
    },
    sureAddCart: function (e) {
        var that = this;
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);;
        var compid = dataset.compid;
        var bindObj = dataset.bindobj;
        var compdata = pageInstance.data[compid];
        var spec_id = compdata.spec_id;
        var id = compdata.goodid;
        if (spec_id != 0) {
            var openid = that.getSessionKey();
            var specstr = compdata.typestr;
            var picpath = compdata.picpath;
            var goodname = compdata.goodname;
            var price = compdata.chooseprice;
            var nums = compdata.goodsnum;
            var url = "/newapp/list2JoinCars";
            that.sendRequest({
                url: url,
                method: 'post',
                data: {
                    good_id: id,
                    specstr: specstr,
                    picpath: picpath,
                    openid: openid,
                    goodname: goodname,
                    price: price,
                    nums: nums,
                    spec_id: spec_id,
                    bindObj: bindObj
                },
                success: function (res) {
                    pageInstance.setData({
                        [`${compid}.cartallnum`]: res.carNums || 0,
                    })
                    if (res.code == 1) {
                        pageInstance.setData({
                            [`${compid}.showPageGoods`]: false,
                        })
                        that.toast({ title: '添加成功' });
                    } else if (res.code == 3) {
                        that.toast({ title: '库存不足' });
                    } else if (res.code == 4) {
                        that.toast({ title: '亲~该商品在购物车的数量已超过库存，无法再添加商品了，谢谢。' });
                    } else if (res.code == 5) {
                        that.toast({ title: res.msg });
                    } else {
                        that.toast({ title: '添加失败' });
                    }
                }
            })
        } else {
            that.toast({ title: '请先选择规格' });
        }
    },
    entergoodsnum: function (e) {
        var pageInstance = this.getNowPage();
        var dataset = this.getset(e);;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var val = e.detail.value;
        if (val < 1) {
            val = 1;
        }
        pageInstance.setData({
            [`${compid}.goodsnum`]: val
        })
    },
    bindExpand: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var path = eventParams.path;
        wx.previewImage({
            urls: [path]
        });
    },
    turnToShopeDetail: function (e) {
        var id = this.getset(e).id;
        var url = '/dianshang/shopDetail/shopDetail?id=' + id;
        this.turnToPage(url);
    },
    inputGoods: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            [`${compid}.searchname`]: e.detail.value
        })
    },
    closeMulti: function (e) {
        var pageInstance = this.getNowPage();
        var compid = this.getset(e).compid;
        pageInstance.setData({
            [`${compid}.showmulti`]: false,
            [`${compid}.showmulti2`]: false,
            [`${compid}.specIndex`]: -1
        })
    },
    changeNav: function (e) {
        var pageInstance = this.getNowPage();
        var compid = this.getset(e).compid;
        var num = this.getset(e).num;
        pageInstance.setData({
            [`${compid}.chooseNav`]: num
        })
    },
    receiveCoupon: function (e, childid, pageRouter, num) {
        let id = this.getset(e).id;
        var url = '/pages/receiveCou/receiveCou?id=' + id + '&pagename=' + pageRouter + '&childid=' + childid + '&num=' + num;
        this.turnToPage(url);
    },
    goTakoutToEvaluate: function (e, childid) {
        var orderid = this.getset(e).orderid;
        var url = '/waimai/takeoutevaluate/takeoutevaluate?orderid=' + orderid + '&childid=' + childid;
        this.turnToPage(url);
    },
    goSettlement: function (childid) {
        if (!this.globalData.userInfo.avatarUrl) {
            this.openAuthor();
            return;
        }
        var url = '/waimai/takeoutbalance/takeoutbalance?childid=' + childid;
        this.turnToPage(url);
    },
    goToArt: function (e) {
        var id = this.getset(e).id;
        var url = '/wenzhang/articles/articles?id=' + id;
        this.turnToPage(url);
    },
    enterSeckNmae: function (e) {
        var pageInstance = this.getNowPage();
        var val = e.detail.value;
        var compid = this.getset(e).compid;
        pageInstance.setData({
            [`${compid}.seckname`]: val,
        })
    },
    goToProduct: function (e) {
        var id = this.getset(e).id;
        var styletype = this.getset(e).styletype;
        var url = '/chanpin/productDetails/productDetails?id=' + id + '&styletype=' + styletype;
        this.turnToPage(url);
    },
    goToTakShop: function (e) {
        var cid = this.getset(e).childid;
        var url = '/waimai/takshops/takshops?childid=' + cid;
        this.turnToPage(url);
    },
    makePhone: function (e) {
        var dataset = this.getset(e);
        wx.makePhoneCall({
            phoneNumber: dataset.tel,
        });
    },
    takshopSearch: function (e) {
        var compid = this.getset(e).compid;
        var pageInstance = this.getNowPage();
        var takshop = pageInstance.data[compid];
        takshop.content = [];
        wx.setStorage({
            key: 'takshopData',
            data: takshop
        });
        var dataset = this.getset(e);
        var url = '/waimai/searchTakshop/searchTakshop?searchTxt=' + dataset.stxt + '&lng=' + dataset.lng + '&lat=' + dataset.lat + '&nid=' + dataset.nid;
        this.turnToPage(url);
    },
    myCoupon: function () {
        var url = '/pages/newCoupon/newCoupon?childid=0&coutype=1';
        this.turnToPage(url);
    },
    myMember: function () {
        var url = '/waimai/vipCard/vipCard?childid=0';
        this.turnToPage(url);
    },
    techDetail: function (e) {
        var id = this.getset(e).id;
        var url = '/yuyue/techniciandetail/techniciandetail?id=' + id;
        this.turnToPage(url);
    },
    goToCityShop: function (e) {
        var id = this.getset(e).id;
        var child_id = this.getset(e).childid;
        var url = '/tongcheng/storeDetail/storeDetail?id=' + id + '&child_id=' + child_id;
        this.turnToPage(url);
    },
    clickAuthor: function () {
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            chooseAuthor: true
        })
    },
    NewPersonCenter: function (e) {
        var dataset = this.getset(e);
        var pageInstance = this.getNowPage();
        var nid = dataset.nid;
        var compid = dataset.compid;
        var compdata = pageInstance.data[compid];
        var themecolor = compdata.themeColor;
        var idx = dataset.idx;
        var url = '';
        if (nid == 'common' || nid == 'elecity' || nid == 'pintuan' || nid == 'fenxiao' || nid == 'miaosha' || nid == 'takeout' || nid == 'tongcheng' || nid == 'jiudian' || nid == 'yuyue' || nid == 'kanjia' || nid == 'prize') {
            var showSec = compdata.content[idx].showSec;
            pageInstance.setData({
                [`${compid}.content[${idx}].showSec`]: !showSec
            });
            return;
        } else if (nid == 'preinfo') {
            url = '/pages/userinfo/userinfo';
        } else if (nid == 'deladdress') {
            url = '/pages/address/address?themecolor=' + themecolor;
        } else if (nid == 'integcity') {
            url = '/pages/integralMall/integralMall?themecolor=' + themecolor;
        } else if (nid == 'coupon') {
            url = '/pages/newCoupon/newCoupon';
        } else if (nid == 'membercard') {
            this.myMemcard();
        } else if (nid == 'shopcart') {
            url = '/pages/shopCart/shopCart?themecolor=' + themecolor;
        } else if (nid == 'shopmanage') {
            this.showJoin(themecolor);
        } else if (nid == 'eleall') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=0';
        } else if (nid == 'elewaitpay') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=1';
        } else if (nid == 'elewaitsend') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=2';
        } else if (nid == 'elewaitget') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=3';
        } else if (nid == 'elewaiteval') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=4';
        } else if (nid == 'elewaittake') {
            url = '/pages/myOrder/myOrder?is_city=0&typeIndex=2&isself=1';
        } else if (nid == 'ptall') {
            url = '/pintuan/myGrouporder/myGrouporder?typeIndex=0';
        } else if (nid == 'ptwait') {
            url = '/pintuan/myGrouporder/myGrouporder?typeIndex=1';
        } else if (nid == 'ptbroke') {
            url = '/pintuan/groupDeposit/groupDeposit';
        } else if (nid == 'fxall') {
            url = '/dianshang/mydisOrder/mydisOrder';
        } else if (nid == 'fxbroke') {
            this.showDispro(1);
        } else if (nid == 'fxorder') {
            url = '/dianshang/newdisorder/newdisorder';
        } else if (nid == 'fxproduct') {
            this.showDispro(0);
        } else if (nid == 'fxnext') {
            url = '/dianshang/lower_member/lower_member';
        } else if (nid == 'fxwant') {
            url = '/pages/iWantDis/iWantDis?themecolor=' + themecolor;
        } else if (nid == 'msall') {
            url = '/dianshang/myseckOrder/myseckOrder?typeIndex=0';
        } else if (nid == 'mswaitpay') {
            url = '/dianshang/myseckOrder/myseckOrder?typeIndex=1';
        } else if (nid == 'mswaitget') {
            url = '/dianshang/myseckOrder/myseckOrder?typeIndex=6';
        } else if (nid == 'takeoutdd') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=1&childid=-1';
        } else if (nid == 'takeoutyy') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=3&childid=-1';
        } else if (nid == 'takeoutws') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=0&childid=-1';
        } else if (nid == 'takeoutzq') {
            url = '/waimai/takeoutOrder/takeoutOrder?type=2&childid=-1';
        } else if (nid == 'tcall') {
            url = '/pages/myOrder/myOrder?is_city=1';
        } else if (nid == 'tcewlease') {
            url = '/tongcheng/myCitybox/myCitybox?type=0';
        } else if (nid == 'tceval') {
            url = '/tongcheng/myCitybox/myCitybox?type=1';
        } else if (nid == 'tcreplay') {
            url = '/tongcheng/myCitybox/myCitybox?type=2';
        } else if (nid == 'tcmanage') {
            url = '/tongcheng/rewardManage/rewardManage';
        } else if (nid == 'jdall') {
            url = '/jiudian/myhotelOrder/myhotelOrder?typeIndex=-1';
        } else if (nid == 'jdwaitpay') {
            url = '/jiudian/myhotelOrder/myhotelOrder?typeIndex=0';
        } else if (nid == 'jdwaitreserve') {
            url = '/jiudian/myhotelOrder/myhotelOrder?typeIndex=2';
        } else if (nid == 'yyall') {
            url = '/yuyue/bespeaklist/bespeaklist?nowsel=0';
        } else if (nid == 'yywaitpay') {
            url = '/yuyue/bespeaklist/bespeaklist?nowsel=2';
        } else if (nid == 'yywaiting') {
            url = '/yuyue/bespeaklist/bespeaklist?nowsel=1';
        } else if (nid == 'kjall') {
            url = '/kanjia/hagglelist/hagglelist?selidx=0';
        } else if (nid == 'kjing') {
            url = '/kanjia/hagglelist/hagglelist?selidx=1';
        } else if (nid == 'kjorder') {
            url = '/kanjia/haggleorder/haggleorder';
        } else if (nid == 'dazhuanpan') {
            url = '/dazhuanpan/receive/receive';
        }
        if (nid != 'membercard' && nid != 'shopmanage' && nid != 'fxbroke' && nid != 'fxproduct') {
            this.turnToPage(url);
        }
    },
    newPerMessage: function () {
        var url = '/pages/myMessage/myMessage';
        this.turnToPage(url);
    },
    playAudios: function (e) {
        var pageInstance = this.getNowPage();
        var newAudioArr = pageInstance.newAudioArr;
        var dataset = this.getset(e);
        var idx = dataset.idx;
        var urlnid = dataset.urlnid;
        var index = dataset.index;
        var src = dataset.src;
        if (src == 111) {
            return;
        }
        if (src == src) {
            innerAudioContext.destroy();
            innerAudioContext = wx.createInnerAudioContext();
        }
        innerAudioContext.src = src;
        for (var i = 0; i < newAudioArr.length; i++) {
            if (index == i) {
                var compid = newAudioArr[i].name;
            } else {
                var compids = newAudioArr[i].name;
                pageInstance.setData({
                    [`${compids}.isMusic`]: false,
                    [`${compids}.isMusic2`]: true,
                })
            }
        }
        if (idx == 1) {
            pageInstance.setData({
                [`${compid}.isMusic`]: true,
                [`${compid}.isMusic2`]: false,
            })
            innerAudioContext.play();
        } else {
            pageInstance.setData({
                [`${compid}.isMusic`]: false,
                [`${compid}.isMusic2`]: true,
            })
            innerAudioContext.pause();
        }
        innerAudioContext.onPlay(function () {
        })
        innerAudioContext.onTimeUpdate(function () {
            var totaltime = innerAudioContext.duration; 
            var curtime = innerAudioContext.currentTime;
            pageInstance.setData({
                [`${compid}.startTime`]: that.transTime(curtime),
                [`${compid}.endTime`]: that.transTime(totaltime),
                [`${compid}.proWidth`]: (100 / totaltime) * curtime,
            })
        })
        innerAudioContext.onEnded(function () {
            pageInstance.setData({
                [`${compid}.isMusic`]: false,
                [`${compid}.isMusic2`]: true,
                [`${compid}.proWidth`]: 0,
                [`${compid}.startTime`]: "00:00"
            })
        })
    },
    transTime: function (value) {
        var time = "";
        var h = parseInt(value / 3600);
        value %= 3600;
        var m = parseInt(value / 60);
        var s = parseInt(value % 60);
        if (h > 0) {
            time = this.formatTime(h + ":" + m + ":" + s);
        } else {
            time = this.formatTime(m + ":" + s);
        }
        return time;
    },
    formatTime: function (value) {
        var time = "";
        var s = value.split(':');
        var i = 0;
        for (; i < s.length - 1; i++) {
            time += s[i].length == 1 ? ("0" + s[i]) : s[i];
            time += ":";
        }
        time += s[i].length == 1 ? ("0" + s[i]) : s[i];
        return time;
    },
    loadbusicard: function (compid) {
        var pageInstance = this.getNowPage();
        var compdata = pageInstance.data[compid];
        var shownum = compdata.shownum || 1;
        var pagenum = compdata.pagenum || 1;
        var oldlist = compdata.content;
        this.sendRequest({
            url: '/webapp/business_card_list',
            method: 'post',
            data: {
                numPerPage: shownum,
                pageNum: pagenum
            },
            success: function (res) {
                var newdata = {};
                if (res.code == 1) {
                    newdata[compid + '.pagenum'] = pagenum + 1;
                    newdata[compid + '.havenums'] = res.havenums;
                    newdata[compid + '.content'] = oldlist.concat(res.cardList);
                } else {
                    newdata[compid + '.havenums'] = 0;
                }
                pageInstance.setData(newdata);
            }
        })
    },
    loadmoreBusscard: function (e) {
        var compid = this.getset(e).compid;
        this.loadbusicard(compid)
    },
    goToCardDetail: function (e) {
        var id = this.getset(e).id;
        var url = '/otherpage/busicardDetail/busicardDetail?id=' + id;
        this.turnToPage(url);
    },
    bindBusicard: function (e) {
        var eventParams = this.getset(e).eventParams;
        eventParams = JSON.parse(eventParams);
        var id = eventParams.bindid;
        if (!id) {
            return;
        }
        var url = '/otherpage/busicardDetail/busicardDetail?id=' + id;
        this.turnToPage(url);
    },
    callPhoce: function (e) {
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
    closenewgift: function () {
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            hasgift: false
        });
    },
    setAddTip: function () {
        var pageInstance = this.getNowPage();
        var addXcxTip = pageInstance.addXcxTip;
        var showAddTip = false;
        var closeAddTip = wx.getStorageSync('closeAddTip') || 0;
        if (addXcxTip == 1 && closeAddTip == 0) {
            showAddTip = true;
        }
        pageInstance.setData({
            showAddTip: showAddTip
        })
    },
    closeAddTip: function () {
        var pageInstance = this.getNowPage();
        wx.setStorage({
            key: 'closeAddTip',
            data: 1
        });
        pageInstance.setData({
            showAddTip: false
        })
    },
    refuseAuthor: function () {
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            isopenAuthor: false
        })
    },
    openAuthor: function () {
        var pageInstance = this.getNowPage();
        pageInstance.setData({
            isopenAuthor: true,
            chooseAuthor: false
        })
    },
    globalData: {
        appId: appid,
        tabBarPagePathArr: tabBarPagePathArr,
        userInfo: {},
        sessionKey: '',
        notBindXcxAppId: false,
        siteBaseUrl: siteUrl,
        appTitle: appTitle,
        appDescription: appDescription,
        homepageRouter: homepageRouter,
        Allpages: Allpages,
        disgrade: 0,
        disopenid: '',
        isShare: false,
        isScan: false,
        weburl: weburl,
        dislevel: 0
    },
})