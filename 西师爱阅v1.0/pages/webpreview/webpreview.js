var url;
Page({
    data: {
    },
    onLoad: function (e) {
        url = decodeURIComponent(e.url);
        this.setData({
            url: url
        })
    },
})