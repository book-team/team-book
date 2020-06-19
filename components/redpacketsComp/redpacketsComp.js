var app = getApp();
Component({
    properties: {
        showRed: {
            type: Boolean
        },
        redid: {
            type: Number
        },
        redcode: {
            type: Number
        },
        userInfo: {
            type: Object
        },
    },
    data: {
        packet_box_img: app.globalData.siteBaseUrl + '/static/user/images/dismantlingred_img.png',
        close_img: app.globalData.siteBaseUrl + '/static/user/images/close_red.png'
    },
    ready: function () {
    },
    methods: {
        clickDismantl: function (e) {
            if (!this.data.userInfo.avatarUrl) {
                this.triggerEvent('openAuthor', '', '')
                return;
            }
            var redcode = this.data.redcode;
            if (redcode == 1) {
                this.closeRed();
                var redid = this.data.redid;
                var url = '/pages/redDispatch/redDispatch?redid=' + redid;
                app.turnToPage(url);
            } else if (redcode == 0) {
                app.toast({
                    title: '暂无红包分享活动'
                });
            } else {
                app.toast({
                    title: '领取达到限制限制条件'
                });
            }
        },
        closeRed: function (e) {
            this.setData({
                showRed: false
            })
        }
    }
})