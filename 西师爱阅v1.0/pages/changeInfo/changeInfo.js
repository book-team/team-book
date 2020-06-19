var app = getApp();
Page({
    data: {
        childid: 0,
        oldval: ''
    },
    onLoad: function (e) {
        var type = e.type;
        var str = '';
        var plastr = '';
        var maxlen = -1;
        var seltype = e.seltype;
        if (type == 1) {
            str = '店铺名称';
            plastr = '请输入店铺名称';
            maxlen = 10;
        } else if (type == 2) {
            str = '门牌号';
            plastr = '请输入门牌号';
        } else if (type == 3) {
            str = '客服电话';
            plastr = '请输入客服电话';
        } else if (type == 4) {
            str = '店铺简介';
            plastr = '请输入店铺简介';
        } else if (type == 5) {
            str = '联系人';
            plastr = '请输入联系人';
        } else if (type == 6) {
            str = '修改密码';
            plastr = '请输入密码';
        }
        this.setData({
            childid: e.childid,
            oldval: e.val,
            type: type,
            plastr: plastr,
            maxlen: maxlen,
            seltype: seltype
        })
        app.setPageTitle(str);
        app.addIplog();
    },
    changepwd: function (e) {
        var that = this;
        var newval = e.detail.value.newval;
        var plastr = this.data.plastr;
        var type = this.data.type;
        if (!newval) {
            app.toast({ title: plastr });
            return;
        }
        var ctype = '';
        var storename = '';
        var detailaddress = '';
        var telphone = '';
        var store_introduction = '';
        var realname = '';
        var password = '';
        if (type == 1) {
            ctype = 'storename';
            storename = newval;
        } else if (type == 2) {
            ctype = 'detailaddress';
            detailaddress = newval;
        } else if (type == 3) {
            ctype = 'kfphone';
            telphone = newval;
        } else if (type == 4) {
            ctype = 'introduction';
            store_introduction = newval;
        } else if (type == 5) {
            ctype = 'realname';
            realname = newval;
        } else if (type == 6) {
            ctype = 'password';
            password = newval;
        }
        var seltype = this.data.seltype;
        app.sendRequest({
            url: '/city/save_store',
            method: 'post',
            data: {
                child_id: that.data.childid,
                storename: storename,
                detailaddress: detailaddress,
                telphone: telphone,
                store_introduction: store_introduction,
                realname: realname,
                password: password,
                seltype: seltype
            },
            success: function (res) {
                app.toast({ title: res.msg });
                setTimeout(function () {
                    if (res.code == 1) {
                        var pages = getCurrentPages();
                        var lastpage = pages[pages.length - 2];
                        lastpage.setData({
                            [`${ctype}`]: newval
                        });
                        wx.navigateBack()
                    }
                }, 500);
            }
        })
    },
})