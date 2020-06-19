var app = getApp();
var goodsImg = { path: '', width: 0, height: 0 };
var qrImg = { path: '', width: 0, height: 0 };
var goodqrImg = { path: '', width: 0, height: 0 };
var storeImg = { path: '', width: 0, height: 0 };
var postImg = { path: '', width: 0, height: 0 };
Component({
    properties: {
        goodstype: {
            type: String
        },
        showShare: {
            type: Boolean
        },
        compic: {
            type: String
        },
        carpic: {
            type: String
        },
        qrcodeurl: {
            type: String
        },
        goodqrcode: {
            type: String
        },
        storelogo: {
            type: String
        },
        postpic: {
            type: String
        },
        goodname: {
            type: String
        },
        goodsprice: {
            type: String
        },
        storename: {
            type: String
        },
        postset: {
            type: Object
        },
        childid: {
            type: Number
        },
        goodid: {
            type: Number
        },
        disgrade: {
            type: Number
        },
        groupnums: {
            type: Number
        },
        groupid: {
            type: Number
        }
    },
    data: {
        showFriends: false,
        showBg: false,
        loadSharePic: false,
        showShareType: false,
        shareType: 0,
        showTip: false,
        loading_pic: app.globalData.siteBaseUrl + '/static/user/images/loading.gif',
        wxicon_pic: app.globalData.siteBaseUrl + '/static/user/images/wechat_icon.png',
        firendcir_pic: app.globalData.siteBaseUrl + '/static/user/images/friends_circle.png',
    },
    ready: function () {
        var that = this;
        var carpic = this.data.carpic;
        var qrcodeurl = this.data.qrcodeurl;
        var goodqrcode = this.data.goodqrcode;
        var storelogo = this.data.storelogo;
        var postpic = this.data.postpic;
        var date = new Date();
        var time = date.getTime();
        wx.downloadFile({
            url: carpic,
            success: function (res) {
                goodsImg.path = res.tempFilePath;
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        goodsImg.width = rres.width;
                        goodsImg.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: qrcodeurl + '?t=' + time,
            success: function (res) {
                qrImg.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        qrImg.width = rres.width;
                        qrImg.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: storelogo,
            success: function (res) {
                storeImg.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        storeImg.width = rres.width;
                        storeImg.height = rres.height;
                    }
                })
            }
        })
        if (postpic) {
            wx.downloadFile({
                url: postpic,
                success: function (res) {
                    postImg.path = res.tempFilePath
                    wx.getImageInfo({
                        src: res.tempFilePath,
                        success: function (rres) {
                            postImg.width = rres.width;
                            postImg.height = rres.height;
                        }
                    })
                }
            })
        }
        if (goodqrcode) {
            wx.downloadFile({
                url: goodqrcode + '?t=' + time,
                success: function (res) {
                    goodqrImg.path = res.tempFilePath
                    wx.getImageInfo({
                        src: res.tempFilePath,
                        success: function (rres) {
                            goodqrImg.width = rres.width;
                            goodqrImg.height = rres.height;
                        }
                    })
                }
            })
        }
    },
    methods: {
        onShareAppMessage: function () {
            var openid = app.getSessionKey();
            var goodstype = this.data.goodstype;
            var goodid = this.data.goodid;
            var childid = this.data.childid;
            var path;
            if (goodstype == 'dist') {
                var dopenid;
                if (this.data.disgrade == 1 || this.data.disgrade == 2) {
                    dopenid = openid;
                } else {
                    dopenid = '';
                }
                path = '/dianshang/distDetail/distDetail?id=' + goodid + '&disopenid=' + dopenid + '&childid=' + childid + '&num=1';
            } else if (goodstype == 'group') {
                var groupid = this.data.groupid;
                path = '/pintuan/groupGoodsdetail/groupGoodsdetail?id=' + goodid + '&childid=' + childid + '&groupid=' + groupid;
            } else if (goodstype == 'seck') {
                path = '/dianshang/newseckillDetail/newseckillDetail?id=' + goodid + '&childid=' + childid;
            } else if (goodstype == 'goods') {
                path = '/dianshang/goodsDetail/goodsDetail?id=' + id + '&childid=' + childid;
            } else if (goodstype == 'store') {
                path = '/tongcheng/storeDetail/storeDetail?id=' + id + '&childid=' + childid;
            }
            if (goodstype == 'group' || goodstype == 'seck' || goodstype == 'goods' || goodstype == 'store') {
                app.sendRequest({
                    url: '/webapp/tjIntegral',
                    data: {
                        openid: openid
                    },
                    method: 'POST',
                    success: function (res) {
                    }
                });
            }
            return {
                title: app.getAppTitle(),
                desc: app.getAppDescription(),
                path: path,
            }
        },
        emptyEvent: function () {
        },
        closeShare: function (e) {
            if (this.data.loadSharePic) {
                return;
            }
            this.setData({
                showShare: false,
                showFriends: false,
                showShareType: false,
                showBg: false
            })
        },
        openType: function (e) {
            this.setData({
                showShareType: true
            })
        },
        openFriends: function (e) {
            var that = this;
            var loadSharePic = this.data.loadSharePic;
            if (loadSharePic) {
                return;
            }
            var shareType = app.getset(e).share || 1;
            if (shareType != this.data.shareType) {
                this.setData({
                    compic: ''
                })
            }
            this.setData({
                loadSharePic: true,
                shareType: shareType
            });
            this.synthesisOpt();
        },
        shareFriends: function () {
            var that = this;
            var tempFilePath = this.data.compic;
            if (!tempFilePath) {
                return;
            }
            wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success(res) {
                    app.toast({ title: '保存成功' });
                    that.closeShare();
                },
                fail: function (res) {
                    if (res.errMsg == 'saveImageToPhotosAlbum:fail auth deny' || res.errMsg == 'saveImageToPhotosAlbum:fail auth denied' || res.errMsg == 'saveImageToPhotosAlbum:fail authorize no response') {
                        that.setData({
                            showTip: true
                        })
                    }
                }
            })
        },
        savePic: function () {
            var that = this;
            var tempFilePath = this.data.compic;
            if (!tempFilePath) {
                return;
            }
            wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success(res) {
                    app.toast({ title: '保存成功' });
                    that.closeFriends();
                },
                fail: function (res) {
                    if (res.errMsg == 'saveImageToPhotosAlbum:fail auth deny' || res.errMsg == 'saveImageToPhotosAlbum:fail auth denied' || res.errMsg == 'saveImageToPhotosAlbum:fail authorize no response') {
                        that.setData({
                            showTip: true
                        })
                    }
                }
            })
        },
        closeFriends: function (e) {
            this.setData({
                showFriends: false
            })
        },
        synthesisOpt: function () {
            if (this.data.compic) {
                this.setData({
                    showShare: false,
                    showBg: true,
                    showFriends: true,
                    loadSharePic: false
                })
            } else {
                var shareType = this.data.shareType;
                if (shareType == 0) {
                    var goodsName = this.data.goodname;
                    var goodsPrice = '￥' + this.data.goodsprice;
                    var goodstype = this.data.goodstype;
                    if (goodstype == 'group') {
                        var groupNums = this.data.groupnums + '人团';
                        var groupNum_left = goodsPrice.length * 9 * (750 / 320) + 46;
                    }
                    var storeName = this.data.storename;
                    if (goodsName.length > 26) {
                        goodsName = goodsName.slice(0, 25) + '...';
                    }
                    if (storeName.length > 7) {
                        storeName = storeName.slice(0, 7) + '...';
                    }
                    var ctx = wx.createCanvasContext('myCanvas');
                    ctx.setFillStyle('#ffffff');
                    ctx.fillRect(0, 0, 640, 1008);
                    ctx.drawImage(goodsImg.path, 0, 0, goodsImg.width, goodsImg.height, 0, 0, 640, 640);
                    ctx.save();
                    ctx.setFontSize(28);
                    ctx.setFillStyle('#151515');
                    ctx.setTextAlign('left');
                    ctx.fillText(goodsName, 13, 690);
                    ctx.save();
                    ctx.setFontSize(30);
                    ctx.setFillStyle('#F62425');
                    ctx.setTextAlign('left');
                    ctx.fillText(goodsPrice, 13, 745);
                    if (goodstype == 'group') {
                        ctx.setFontSize(24);
                        ctx.setFillStyle('#A3A3A3');
                        ctx.setTextAlign('left');
                        ctx.fillText(groupNums, groupNum_left, 745);
                    }
                    ctx.setLineWidth(3);
                    ctx.setStrokeStyle('#F0F0F0');
                    ctx.moveTo(0, 780);
                    ctx.lineTo(640, 780);
                    ctx.stroke();
                    ctx.save();
                    ctx.drawImage(storeImg.path, 0, 0, storeImg.width, storeImg.height, 30, 830, 125, 125);
                    if (goodstype == 'group' || goodstype == 'seck' || goodstype == 'goods' || goodstype == 'store' || goodstype == "dist") {
                        ctx.drawImage(goodqrImg.path, 0, 0, goodqrImg.width, goodqrImg.height, 420, 800, 180, 180);
                    } else {
                        ctx.drawImage(qrImg.path, 0, 0, qrImg.width, qrImg.height, 420, 800, 180, 180);
                    }
                    ctx.save();
                    ctx.setFontSize(30);
                    ctx.setFillStyle('#000000');
                    ctx.setTextAlign('left');
                    ctx.fillText(storeName, 175, 875);
                    ctx.setFontSize(24);
                    ctx.setFillStyle('#888888');
                    ctx.setTextAlign('left');
                    ctx.fillText('长按识别二维码', 175, 920);
                    ctx.save();
                    ctx.draw();
                } else {
                    var storeName = this.data.storename;
                    var postset = this.data.postset;
                    var logo_width = postset.logo_width;
                    var logo_height = postset.logo_height;
                    var logo_left = postset.logo_left;
                    var logo_top = postset.logo_top;
                    var qrcode_width = postset.qrcode_width;
                    var qrcode_height = postset.qrcode_height;
                    var qrcode_left = postset.qrcode_left;
                    var qrcode_top = postset.qrcode_top;
                    var storename_color = postset.storename_color;
                    var storename_left = postset.storename_left;
                    var storename_top = postset.storename_top;
                    var ctx = wx.createCanvasContext('myCanvas');
                    ctx.drawImage(postImg.path, 0, 0, postImg.width, postImg.height, 0, 0, 640, 1008);
                    ctx.save();
                    ctx.arc(logo_left + logo_width / 2, logo_top + logo_width / 2, logo_width / 2, 0, 2 * Math.PI);
                    ctx.clip();
                    ctx.drawImage(storeImg.path, 0, 0, storeImg.width, storeImg.height, logo_left, logo_top, logo_width, logo_height);
                    ctx.restore();
                    ctx.setFontSize(30);
                    ctx.setFillStyle(storename_color);
                    ctx.setTextAlign('left');
                    ctx.fillText(storeName, storename_left, storename_top + 30);
                    ctx.save();
                    ctx.drawImage(qrImg.path, 0, 0, qrImg.width, qrImg.height, qrcode_left, qrcode_top, qrcode_width, qrcode_height);
                    ctx.save();
                    ctx.draw();
                }
                var that = this;
                setTimeout(function () {
                    wx.canvasToTempFilePath({
                        x: 0,
                        y: 0,
                        width: 640,
                        height: 1008,
                        destWidth: 640,
                        destHeight: 1008,
                        canvasId: 'myCanvas',
                        success: function (res) {
                            that.setData({
                                showShare: false,
                                showBg: true,
                                showFriends: true,
                                loadSharePic: false,
                                compic: res.tempFilePath
                            })
                        },
                        fail: function (res) {
                        }
                    })
                }, 500);
            }
        },
        closeTip: function () {
            this.setData({
                showTip: false
            })
        },
        openSet: function (res) {
            this.closeTip();
            var rres = res.detail;
            if (rres.authSetting['scope.writePhotosAlbum']) {
                this.savePic();
            }
        },
        shareTap: function () {
            var childid = this.data.childid;
            app.sendRequest({
                url: '/webapp/addShareNum',
                method: 'post',
                data: {
                    child_id: childid,
                },
                success: function (res) {
                }
            })
        },
    }
})