var app = getApp()
Component({
    properties: {
        notice: {
            type: Object
        }
    },
    ready: function () {
        this.loadData();
    },
    data: {
        nowidx: 0,
        timer: null
    },
    methods: {
        loadData: function () {
            var that = this;
            app.sendRequest({
                url: '/newapp/noticelist',
                method: 'post',
                data: {
                    openid: app.getSessionKey()
                },
                success: function (res) {
                    that.setData({
                        content: res.notice
                    });
                    that.runNotice();
                }
            })
        },
        runNotice: function () {
            var that = this;
            var conlen = that.data.content.length;
            if (that.data.notice.playtype == 1 || conlen == 0) {
                return;
            }
            clearInterval(that.data.timer);
            var time = that.data.notice.interval * 1000;
            var timer = setInterval(function () {
                var nowidx = that.data.nowidx;
                nowidx++;
                if (nowidx >= conlen) {
                    nowidx = 0;
                }
                that.setData({
                    nowidx: nowidx
                })
            }, time);
            var height = 85;
            that.setData({
                timer: timer,
                height: parseFloat(height)
            })
        }
    }
})