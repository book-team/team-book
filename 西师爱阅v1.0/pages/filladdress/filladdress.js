var app = getApp();
var area = require('../../utils/area')
var p = 0, c = 0, d = 0
Page({
    data: {
        addinfo: {},
        provinceName: [],
        provinceCode: [],
        provinceSelIndex: '',
        cityName: [],
        cityCode: [],
        citySelIndex: '',
        districtName: [],
        districtCode: [],
        districtSelIndex: '',
        showMessage: false,
        messageContent: '',
        editId: 0,
        addr_street: '',
        input_street: ''
    },
    onLoad: function (e) {
        app.addIplog();
        app.setPageUserInfo();
        var edit = e.edit;
        if (edit == 1) {
            var index = e.index;
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            var addList = prevPage.data.addressList;
            this.setData({
                addinfo: addList[index],
                addr_street: addList[index].street,
                editId: addList[index].id
            });
            p = addList[index].provinceid, c = addList[index].cityid, d = addList[index].countyid;
            this.setAreaData('province', p)
            this.setAreaData('city', p, c)
            this.setAreaData('district', p, c, d)
        } else {
            this.setData({
                addinfo: {},
                editId: 0
            });
            this.setAreaData();
        }
        var consignee = wx.getStorageSync('name') || '';
        var telphone = wx.getStorageSync('telphone') || '';
        var addinfo = {
            'consignee': consignee,
            'telphone': telphone
        }
    },
    changeProvince: function (e) {
        this.resetAreaData('province')
        p = e.detail.value
        this.setAreaData('province', p)
    },
    changeCity: function (e) {
        this.resetAreaData()
        c = e.detail.value
        this.setAreaData('city', p, c)
    },
    changeDistrict: function (e) {
        d = e.detail.value
        this.setAreaData('district', p, c, d)
    },
    setAreaData: function (t, p, c, d) {
        switch (t) {
            case 'province':
                this.setData({
                    provinceSelIndex: p,
                    cityEnabled: true
                })
                break;
            case 'city':
                this.setData({
                    citySelIndex: c,
                    districtEnabled: true
                })
                break;
            case 'district':
                this.setData({
                    districtSelIndex: d
                })
        }
        var p = p || 0;
        var c = c || 0;
        var d = d || 0;
        var province = area['100000']
        var provinceName = [];
        var provinceCode = [];
        for (var item in province) {
            provinceName.push(province[item])
            provinceCode.push(item)
        }
        this.setData({
            provinceName: provinceName,
            provinceCode: provinceCode
        })
        var city = area[provinceCode[p]]
        var cityName = [];
        var cityCode = [];
        for (var item in city) {
            cityName.push(city[item])
            cityCode.push(item)
        }
        this.setData({
            cityName: cityName,
            cityCode: cityCode
        })
        var district = area[cityCode[c]]
        var districtName = [];
        var districtCode = [];
        for (var item in district) {
            districtName.push(district[item])
            districtCode.push(item)
        }
        this.setData({
            districtName: districtName,
            districtCode: districtCode
        })
    },
    resetAreaData: function (type) {
        this.setData({
            districtName: [],
            districtCode: [],
            districtSelIndex: '',
            districtEnabled: false
        })
        if (type == 'province') {
            this.setData({
                cityName: [],
                cityCode: [],
                citySelIndex: ''
            })
        }
    },
    savePersonInfo: function (e) {
        var that = this;
        var data = e.detail.value;
        var telRule = /^1[1|2|3|4|5|6|7|8|9]\d{9}$/;
        if (data.name == '') {
            this.showMessage('请输入姓名')
        } else if (data.tel == '') {
            this.showMessage('请输入手机号码')
        } else if (!telRule.test(data.tel)) {
            this.showMessage('手机号码格式不正确')
        } else if (data.province == '') {
            this.showMessage('请选择所在省')
        } else if (data.address == '') {
            this.showMessage('请输入详细地址')
        } else if (data.address == '') {
            this.showMessage('请输入邮政编码')
        } else {
            var p = this.data.provinceSelIndex;
            var c = this.data.citySelIndex;
            var d = this.data.districtSelIndex;
            var editId = this.data.editId;
            app.sendRequest({
                url: '/webapp/addAddress',
                method: 'post',
                data: {
                    openid: app.getSessionKey(),
                    consignee: data.name,
                    telphone: data.tel,
                    province: data.province,
                    provinceid: p,
                    city: data.city,
                    cityid: c,
                    county: data.district,
                    countyid: d,
                    street: data.address,
                    isdefault: data.default ? 1 : 0,
                    id: editId,
                    postid: data.postid
                },
                success: function (res) {
                    if (res.code == 1) {
                        app.turnBack();
                    }
                }
            })
        }
    },
    showMessage: function (text) {
        var that = this
        that.setData({
            showMessage: true,
            messageContent: text
        })
        setTimeout(function () {
            that.setData({
                showMessage: false,
                messageContent: ''
            })
        }, 1000)
    },
    enterStreet: function (e) {
        var reg = /(\r\n)|(\n)|(\s+)/g;
        var val = e.detail.value;
        if (reg.test(val)) {
            var input_street = this.data.input_street;
            this.setData({
                addr_street: input_street
            })
            return false;
        }
        this.setData({
            input_street: val
        })
    }
})