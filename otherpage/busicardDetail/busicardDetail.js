var app = getApp();
var id;
var innerAudioContext = wx.createInnerAudioContext();
var img1 = { path: '', width: 0, height: 0 };
var img2 = { path: '', width: 0, height: 0 };
var img3 = { path: '', width: 0, height: 0 };
var img4 = { path: '', width: 0, height: 0 };
var img5 = { path: '', width: 0, height: 0 };
var img6 = { path: '', width: 0, height: 0 };
var share_title = '';
var share_img = '';
Page({
    data: {
        audioplay: false,
        showmore: false,
        playrate: 0,
        duration: '00:00',
        iszan: false,
        sharepic: '',
        loading_pic: app.globalData.siteBaseUrl + '/static/user/images/loading.gif',
        wxicon_pic: app.globalData.siteBaseUrl + '/static/user/images/wechat_icon.png',
        firendcir_pic: app.globalData.siteBaseUrl + '/static/user/images/friends_circle.png',
        loadSharePic: false,
    },
    onLoad: function (e) {
        app.addIplog();
        app.checkLogin();
        id = e.id;
        this.loadData();
    },
    onShow: function () {
        app.setPageUserInfo();
        if (this.data.card) {
            this.setAudio();
        }
    },
    downloadPic: function () {
        var card = this.data.card;
        var date = new Date();
        var time = date.getTime();
        var wxaqrcode = this.data.wxaqrcode + '?t=' + time;
        var qrbg = this.data.qrbg;
        var card_renqi = this.data.card_renqi;
        var card_email = this.data.card_email;
        var card_phone = this.data.card_phone;
        wx.downloadFile({
            url: card.head_img,
            success: function (res) {
                img1.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img1.width = rres.width;
                        img1.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: card_phone,
            success: function (res) {
                img2.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img2.width = rres.width;
                        img2.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: card_email,
            success: function (res) {
                img3.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img3.width = rres.width;
                        img3.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: card_renqi,
            success: function (res) {
                img4.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img4.width = rres.width;
                        img4.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: wxaqrcode,
            success: function (res) {
                img5.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img5.width = rres.width;
                        img5.height = rres.height;
                    }
                })
            }
        })
        wx.downloadFile({
            url: qrbg,
            success: function (res) {
                img6.path = res.tempFilePath
                wx.getImageInfo({
                    src: res.tempFilePath,
                    success: function (rres) {
                        img6.width = rres.width;
                        img6.height = rres.height;
                    }
                })
            }
        })
    },
    dataInitial: function () {
    },
    onHide: function () {
        this.removeAudio();
    },
    onUnload: function () {
        this.removeAudio();
    },
    onShareAppMessage: function () {
        return {
            title: share_title,
            imageUrl: share_img,
            path: '/otherpage/busicardDetail/busicardDetail?id=' + id,
            success: function (res) {
            }
        }
    },
    loadData: function () {
        var that = this;
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/webapp/business_card_detail',
            method: 'post',
            data: {
                openid: openid,
                id: id
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        card: res.card,
                        loaded: true,
                        wxaqrcode: res.wxaqrcode,
                        qrbg: res.qrbg,
                        card_renqi: res.card_renqi,
                        card_email: res.card_email,
                        card_phone: res.card_phone
                    });
                    share_title = res.card.share_title;
                    share_img = res.card.share_img;
                    that.setAudio();
                    that.addViewUser();
                    that.downloadPic();
                }
                if (res.code == 1000 || res.code == 2000) {
                    that.setData({
                        pageshow: true,
                        vqdlevel: res.code
                    })
                    wx.setNavigationBarTitle({
                        title: '待升级提示'
                    });
                }
            }
        })
    },
    addViewUser: function () {
        var openid = app.getSessionKey();
        var userinfo = this.data.userInfo;
        if (!userinfo.avatarUrl) {
            return;
        }
        app.sendRequest({
            url: '/webapp/save_card_user',
            method: 'post',
            data: {
                card_id: id,
                openid: openid,
                nickname: userinfo.nickName,
                avtar: userinfo.avatarUrl
            }
        })
    },
    setAudio: function () {
        var that = this;
        innerAudioContext.obeyMuteSwitch = false;
        innerAudioContext.src = this.data.card.voice;
        innerAudioContext.onPlay(() => {
            var totaltime = innerAudioContext.duration;
            totaltime = app.transTime(totaltime);
            that.setData({
                duration: totaltime,
                audioplay: true
            })
        })
        innerAudioContext.onTimeUpdate(() => {
            var curtime = innerAudioContext.currentTime;
            var totaltime = innerAudioContext.duration;
            that.setData({
                duration: app.transTime(totaltime),
                playrate: curtime / totaltime * 100
            })
        })
        innerAudioContext.onEnded(() => {
            that.setData({
                audioplay: false,
                playrate: 0
            })
        })
    },
    removeAudio: function () {
        innerAudioContext.destroy();
        innerAudioContext = wx.createInnerAudioContext();
        this.setData({
            audioplay: false,
            playrate: 0
        })
    },
    callphone: function (e) {
        app.makePhone(e)
    },
    copydata: function (e) {
        var name = app.getset(e).name;
        var val = app.getset(e).val;
        wx.setClipboardData({
            data: val,
            success(res) {
                app.toast({ title: '复制' + name + '成功' });
            }
        })
    },
    openmap: function (e) {
        var lat = app.getset(e).lat;
        var lng = app.getset(e).lng;
        var latitude = parseFloat(lat);
        var longitude = parseFloat(lng);
        var address = app.getset(e).address;
        wx.openLocation({
            latitude: latitude,
            longitude: longitude,
            address: address
        })
    },
    moreinfo: function () {
        this.setData({
            showmore: true
        })
    },
    playmus: function () {
        var audioplay = this.data.audioplay;
        if (innerAudioContext.paused) {
            innerAudioContext.play();
        } else {
            innerAudioContext.pause();
        }
        this.setData({
            audioplay: !audioplay
        })
    },
    clickzan: function () {
        var that = this;
        var is_praise = this.data.card.is_praise;
        var card_praise = this.data.card.card_praise
        var newpraise = 1;
        if (is_praise == 1) {
            newpraise = 0;
            card_praise = card_praise - 1;
        } else {
            card_praise = card_praise + 1;
        }
        var openid = app.getSessionKey();
        app.sendRequest({
            url: '/webapp/card_price',
            method: 'post',
            data: {
                id: id,
                openid: openid,
                is_praise: newpraise
            },
            success: function (res) {
                if (res.code == 1) {
                    that.setData({
                        [`card.is_praise`]: newpraise,
                        [`card.card_praise`]: card_praise
                    });
                    app.toast({ title: res.msg });
                }
            }
        })
    },
    savephone: function () {
        var card = this.data.card;
        wx.addPhoneContact({
            firstName: card.name,
            mobilePhoneNumber: card.phone,
            weChatNumber: card.nickname,
            organization: card.address + card.detailaddress,
            title: card.jobs,
            email: card.email,
            success: function (res) {
                app.toast({ title: '保存成功' });
            },
            fail: function (res) {
                app.toast({ title: '保存失败' });
            },
        })
    },
    sharecard: function () {
        var sharepic = this.data.sharepic;
        if (sharepic) {
            this.setData({
                showshare: true,
                showShare1: false,
                loadSharePic: false
            })
        } else {
            var that = this;
            var card = this.data.card;
            var ctx = wx.createCanvasContext('myCanvas');
            var name = card.name;
            var jobs = card.jobs;
            var company = card.company;
            var phone = card.phone;
            var email = card.email;
            var renqi = '人气 ' + card.page_view;
            ctx.setFillStyle('#ffffff');
            ctx.fillRect(0, 0, 640, 830);
            ctx.drawImage(img6.path, 0, 0, img6.width, img6.height, 165, 400, 310, 310);
            ctx.setFontSize(36);
            ctx.setTextBaseline('top');
            ctx.setFillStyle('#353535');
            ctx.setTextAlign('left');
            ctx.fillText(name, 35, 45);
            var namew = ctx.measureText(name).width;
            ctx.setLineWidth(3);
            ctx.setStrokeStyle('#888');
            ctx.moveTo(namew + 65, 58);
            ctx.lineTo(namew + 65, 88);
            ctx.closePath();
            ctx.stroke();
            ctx.setFontSize(28);
            ctx.setFillStyle('#888888');
            ctx.setTextAlign('left');
            ctx.fillText(jobs, namew + 98, 53);
            ctx.setFontSize(28);
            ctx.setFillStyle('#888888');
            ctx.setTextAlign('left');
            ctx.fillText(company, 35, 115);
            ctx.setStrokeStyle('#f1f1f1');
            ctx.setLineWidth(1);
            ctx.moveTo(0, 198);
            ctx.lineTo(640, 198);
            ctx.closePath();
            ctx.stroke();
            ctx.moveTo(0, 360);
            ctx.lineTo(640, 360);
            ctx.closePath();
            ctx.stroke();
            ctx.drawImage(img2.path, 0, 0, img2.width, img2.height, 40, 230, 30, 34);
            ctx.setFontSize(28);
            ctx.setFillStyle('#353535');
            ctx.setTextAlign('left');
            ctx.fillText(phone, 87, 229);
            ctx.drawImage(img3.path, 0, 0, img3.width, img3.height, 38, 299, 34, 27);
            ctx.setFontSize(28);
            ctx.setFillStyle('#353535');
            ctx.setTextAlign('left');
            ctx.fillText(email, 87, 295);
            ctx.drawImage(img4.path, 0, 0, img4.width, img4.height, 442, 263, 27, 35);
            ctx.setFontSize(28);
            ctx.setFillStyle('#888888');
            ctx.setTextAlign('left');
            ctx.fillText(renqi, 476, 260);
            ctx.save();
            ctx.moveTo(535, 98);
            ctx.arc(535, 98, 70, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img1.path, 0, 0, img1.width, img1.height, 465, 28, 140, 140);
            ctx.restore();
            ctx.save();
            ctx.arc(320, 555, 140, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img5.path, 0, 0, img5.width, img5.height, 180, 415, 280, 280);
            ctx.restore();
            ctx.setFontSize(26);
            ctx.setFillStyle('#888888');
            ctx.setTextAlign('center');
            ctx.fillText('长按识别二维码  收下名片', 320, 745);
            ctx.draw();
            setTimeout(function () {
                wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 640,
                    height: 830,
                    destWidth: 640,
                    destHeight: 830,
                    canvasId: 'myCanvas',
                    success: function (res) {
                        that.setData({
                            sharepic: res.tempFilePath,
                            showshare: true,
                            showShare1: false,
                            loadSharePic: false
                        })
                    },
                    fail: function (res) {
                    }
                })
            }, 500);
        }
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    savepic: function () {
        var that = this;
        var tempFilePath = this.data.sharepic;
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
    closeShare: function () {
        this.setData({
            showshare: false
        })
    },
    closeTip: function () {
        this.setData({
            showTip: false
        })
    },
    openSet: function (res) {
        this.closeTip();
    },
    empty: function () {
    },
    closeShare1: function (e) {
        if (this.data.loadSharePic) {
            return;
        }
        this.setData({
            showShare1: false,
        })
    },
    openFriends: function () {
        var loadSharePic = this.data.loadSharePic;
        if (loadSharePic) {
            return;
        }
        this.setData({
            loadSharePic: true,
        });
        this.sharecard();
    },
    openShare: function () {
        this.setData({
            showShare1: true,
            loadSharePic: false,
        })
    },
    closenewgift: function () {
        app.closenewgift();
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
})