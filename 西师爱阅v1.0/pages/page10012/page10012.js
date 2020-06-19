
var app = getApp();
var appAllData = require('./data.js');
var mydata = appAllData.appData();
var router = appAllData.router();
var articleList = appAllData.articles();
var commentid = appAllData.comments();
var title = appAllData.title();
var dymanicList = appAllData.dymanicList();
var countArr = appAllData.countArr();
var goodsArr = appAllData.goodsArr();
var cityArr = appAllData.cityArr();
var forumArr = appAllData.forumArr();
var topicArr = appAllData.topicArr();
var shopArr = appAllData.shopArr();
var groupGoodsArr = appAllData.groupGoodsArr();
var takeoutArr = appAllData.takeoutArr();
var carouselArr = appAllData.carouselArr();
var seckillArr = appAllData.seckillArr();
var goodsClaArr = appAllData.goodsClaArr();
var listDetailArr = appAllData.listDetailArr();
var productArr = appAllData.productArr();
var takeoutShopArr = appAllData.takeoutShopArr();
var newseckillArr = appAllData.newseckillArr();
var distributeArr = appAllData.distributeArr();
var theCityArr = appAllData.theCityArr();
var newgoodsArr = appAllData.newgoodsArr();
var serviceArr = appAllData.serviceArr();
var techArr = appAllData.techArr();
var appointShopArr = appAllData.appointShopArr();
var bargainArr = appAllData.bargainArr();
var subGoodsArr = appAllData.subGoodsArr();
var cityMerArr = appAllData.cityMerArr();
var newsearchArr = appAllData.newsearchArr();
var newdistributeArr = appAllData.newdistributeArr();
var couponlistArr = appAllData.couponlistArr();
var goodsShopArr = appAllData.goodsShopArr();
var houseApartArr = appAllData.houseApartArr();
var videoArr = appAllData.videoArr();
var hotelListArr = appAllData.hotelListArr();
var hotelSoArr = appAllData.hotelSoArr();
var appJumpArr = appAllData.appJumpArr();
var newpersonArr = appAllData.newpersonArr();
var newAudioArr = appAllData.newAudioArr();
var busicardArr = appAllData.busicardArr();
var addXcxTip = appAllData.addXcxTip();
var addXcxTip = appAllData.addXcxTip();
var lid = 0;
var pageData = {
    data: mydata,
    page_router: router,
    pagetit: title,
    articleList: articleList,
    commentid: commentid,
    dymanicList: dymanicList,
    countArr: countArr,
    goodsArr: goodsArr,
    cityArr: cityArr,
    forumArr: forumArr,
    topicArr: topicArr,
    shopArr: shopArr,
    groupGoodsArr: groupGoodsArr,
    takeoutArr: takeoutArr,
    carouselArr: carouselArr,
    seckillArr: seckillArr,
    goodsClaArr: goodsClaArr,
    listDetailArr: listDetailArr,
    productArr: productArr,
    takeoutShopArr: takeoutShopArr,
    newseckillArr: newseckillArr,
    distributeArr: distributeArr,
    theCityArr: theCityArr,
    newgoodsArr: newgoodsArr,
    serviceArr: serviceArr,
    techArr: techArr,
    appointShopArr: appointShopArr,
    bargainArr: bargainArr,
    subGoodsArr: subGoodsArr,
    cityMerArr: cityMerArr,
    newsearchArr: newsearchArr,
    newdistributeArr: newdistributeArr,
    couponlistArr: couponlistArr,
    goodsShopArr: goodsShopArr,
    houseApartArr: houseApartArr,
    videoArr: videoArr,
    hotelListArr: hotelListArr,
    hotelSoArr: hotelSoArr,
    appJumpArr: appJumpArr,
    newpersonArr: newpersonArr,
    newAudioArr: newAudioArr,
    busicardArr: busicardArr,
    addXcxTip: addXcxTip,
    prevPage: 0,
    oprenum: 0,
    opagenum: 1,
    ohavenums: 1,
    prenum: 0,
    pagenum: 1,
    havenums: 1,
    timer: 0,
    newtimer: 0,
    onLoad: function (e) {
        var scene = decodeURIComponent(e.scene);
        app.setTabelNum(scene);
        app.setListId(e.lid);
        lid = e.lid || 0;
        app.addIplog();
        app.checkLogin();
        this.suspensionBottom();
        app.setPageTitle(title);
        app.setDisOpenid(scene);
        app.checkNotice();
        app.getDislevel();
        app.theCityLoad();
        app.setAddTip();
    },
    onShow: function () {
        app.setPageUserInfo();
        app.takeoutLoad(0);
        app.checkFirst();
        app.senIntegral();
        app.checkNotice();
    },
    onHide: function () {
        clearInterval(this.timer);
        app.cleartime();
    },
    onUnload: function () {
        app.cleartime();
    },
    dataInitial: function () {
        app.dataInitial();
    },
    onShareAppMessage: function () {
        var pageRouter = this.page_router;
        app.addShareLog();
        return {
            title: app.getAppTitle(),
            desc: app.getAppDescription(),
            path: '/pages/' + pageRouter + '/' + pageRouter + '?lid=' + lid,
        }
    },
    tapInnerLinkHandler: function (e) {
        app.tapInnerLinkHandler(e);
    },
    tapPhoneCallHandler: function (e) {
        app.tapPhoneCallHandler(e);
    },
    tapRefresh: function () {
        var router = this.page_router;
        var url = '/pages/' + router + '/' + router;
        app.turnToPage(url, 1);
    },
    tapBack: function () {
        app.turnBack();
    },
    UserCenterPage: function (e) {
        app.UserCenterPage(e);
    },
    inputChange: function (e) {
        app.inputChange(e);
    },
    bindScoreChange: function (e) {
        app.bindScoreChange(e);
    },
    bindSelectChange: function (e) {
        app.bindSelectChange(e);
    },
    uploadFormImg: function (e) {
        app.uploadFormImg(e);
    },
    changechecked: function (e) {
        app.changechecked(e);
    },
    infoDetail: function (e) {
        app.infoDetail(e);
    },
    release: function (e) {
        app.release(e);
    },
    previewImage: function (e) {
        app.previewImage(e);
    },
    showMore: function (e) {
        var dset = app.getset(e);
        app.cityInit(dset.compid, dset.nid, dset.shownum, dset.ordertype);
    },
    bindDateChange: function (e) {
        app.bindDateChange(e);
    },
    bindTimeChange: function (e) {
        app.bindTimeChange(e);
    },
    submitForm: function (e) {
        app.submitForm(e);
    },
    MapEdit: function (e) {
        app.MapEdit(e);
    },
    suspensionBottom: function () {
        app.suspensionBottom(router);
    },
    loadmore: function (e) {
        var dset = app.getset(e);
        app.commentData(dset.compid, dset.cid);
    },
    commentChange: function (e) {
        app.commentChange(e);
    },
    submitComment: function (e) {
        app.submitComment(e);
    },
    showReply: function (e) {
        app.showReply(e);
    },
    hideReply: function (e) {
        app.hideReply(e);
    },
    commentZan: function (e) {
        app.commentZan(e);
    },
    clickReply: function (e) {
        app.clickReply(e)
    },
    submitReply: function (e) {
        app.submitReply(e);
    },
    replyChange: function (e) {
        app.replyChange(e);
    },
    pageScrollFunc: function (e) {
        app.pageScrollFunc(e);
    },
    searchArticle: function (e) {
        app.searchArticle(e);
    },
    enterLbSearhText: function (e) {
        app.enterLbSearhText(e);
    },
    tagLbSearch: function (e) {
        app.tagLbAppSearch(e);
    },
    clickLbSearch: function (e) {
        app.clickLbAppSearch(e);
    },
    changeCount: function (e) {
        app.changeAppCount(e);
    },
    sortListFunc: function (e) {
        app.sortAppListFunc(e);
    },
    searchGoods: function (e) {
        app.searchGoods(e);
    },
    bindCommodity: function (e) {
        app.bindCommodity(e);
    },
    bindGoodList: function (e) {
        app.bindGoodList(e);
    },
    bindArticle: function (e) {
        app.bindArticle(e);
    },
    selectLocal: function (e) {
        app.selectLocal(e);
    },
    cancelCity: function (e) {
        app.cancelCity(e);
    },
    submitCity: function (e) {
        app.submitCity(e);
    },
    bindCityChange: function (e) {
        app.bindCityChange(e);
    },
    bindExpand: function (e) {
        app.bindExpand(e);
    },
    bindCoupon: function (e) {
        app.bindCoupon(e);
    },
    pointSign: function () {
        app.pointSign();
    },
    signClose: function () {
        app.signClose();
    },
    closeRule: function () {
        app.closeRule();
    },
    searchTopic: function (e) {
        app.searchTopic(e);
    },
    tapFranchiseeLocation: function (e) {
        app.tapFranchiseeLocation(e);
    },
    loadMoreShop: function (e) {
        app.loadMoreShop(e);
    },
    turnToShopeDetail: function (e) {
        app.turnToShopeDetail(e);
    },
    searchShop: function (e) {
        app.searchShop(e);
    },
    bindAppointment: function (e) {
        app.bindAppointment(e);
    },
    bindTostore: function (e) {
        app.bindTostore(e);
    },
    bindSonshop: function (e) {
        app.bindSonshop(e);
    },
    searchGroupgoods: function (e) {
        app.searchGroupgoods(e);
    },
    showMenu: function (e) {
        app.showMenu(e);
    },
    selectMenu: function (e) {
        app.selectMenu(e);
    },
    inputGoods: function (e) {
        app.inputGoods(e);
    },
    searchTakeoutGoods: function (e) {
        var dset = app.getset(e);
        app.loadtakeout(dset.compid)
    },
    closeMulti: function (e) {
        app.closeMulti(e);
    },
    alertToast: function () {
        app.toast({ title: '多规格商品只能去购物车删除哦' });
    },
    showCart: function (e) {
        app.showCart(e, 0)
    },
    choseCart: function (e) {
        app.choseCart(e)
    },
    changeTab: function (e) {
        var dset = app.getset(e);
        let num = parseInt(dset.num);
        app.changeTab(dset.compid, num, 0);
    },
    changeComment: function (e) {
        app.changeComment(e, 0);
    },
    loadMoreEval: function (e) {
        app.loadMoreEval(e, 0);
    },
    changeNav: function (e) {
        app.changeNav(e);
    },
    clearCart: function (e) {
        app.clearCart(e, 0);
    },
    changeCart: function (e) {
        app.changeCart(e, 0);
    },
    changeFoot: function (e) {
        app.changeFoot(e, 0);
    },
    trueMulti: function (e) {
        app.trueMulti(e, 0);
    },
    showMulti: function (e) {
        app.showMulti(e);
    },
    showMulti2: function (e) {
        app.showMulti2(e);
    },
    chooseMulti: function (e) {
        app.chooseMulti(e);
    },
    chooseMulti2: function (e) {
        app.chooseMulti2(e);
    },
    receiveCoupon: function (e) {
        app.receiveCoupon(e, 0, this.page_router, 0);
    },
    goToEvaluate: function (e) {
        app.goTakoutToEvaluate(e, 0);
    },
    goSettlement: function () {
        app.goSettlement(0);
    },
    goToArt: function (e) {
        app.goToArt(e);
    },
    selSecTime: function (e) {
        app.selSecTime(e);
    },
    enterSeckNmae: function (e) {
        app.enterSeckNmae(e);
    },
    searchSeck: function (e) {
        app.searchSeck(e);
    },
    loadmoreOrder: function (e) {
        app.loadmoreOrder(e);
    },
    goToSeckDetail: function (e) {
        app.goToSeckDetail(e);
    },
    noMulti: function (e) {
        app.noMulti();
    },
    selGoodsCla: function (e) {
        app.selGoodsCla(e);
    },
    goToGoodsList: function (e) {
        app.goToGoodsList(e);
    },
    goToListDetail: function (e) {
        app.goToListDetail(e);
    },
    bindCommunity: function (e) {
        app.bindCommunity(e);
    },
    bindtakCoupon: function (e) {
        app.bindtakCoupon(e);
    },
    goToProduct: function (e) {
        app.goToProduct(e);
    },
    searchProduct: function (e) {
        app.searchProduct(e);
    },
    personalSetting: function (e) {
        app.personalSetting();
    },
    sel_goods_type: function (e) {
        app.sel_goods_type(e);
    },
    clicktakzan: function (e) {
        app.clicktakzan(e);
    },
    goToTakShop: function (e) {
        app.goToTakShop(e);
    },
    sel_groupgoods_type: function (e) {
        app.sel_groupgoods_type(e);
    },
    newloadmoreOrder: function (e) {
        app.newloadmoreOrder(e);
    },
    newsearchSeck: function (e) {
        app.newsearchSeck(e);
    },
    newgoToSeckDetail: function (e) {
        app.newgoToSeckDetail(e);
    },
    sel_seck_type: function (e) {
        app.sel_seck_type(e);
    },
    regetAddress: function (e) {
        app.regetAddress(e);
    },
    goToDistDetail: function (e) {
        app.goToDistDetail(e);
    },
    sel_dist_type: function (e) {
        app.sel_dist_type(e);
    },
    searchDist: function (e) {
        app.searchDist(e);
    },
    bindApp: function (event) {
        app.bindApp(event);
    },
    takeoutShowPre: function (e) {
        app.takeoutShowPre(e);
    },
    makePhone: function (e) {
        app.makePhone(e);
    },
    takshopSearch: function (e) {
        app.takshopSearch(e);
    },
    bindDisgood: function (e) {
        app.bindDisgood(e);
    },
    bindWeb: function (e) {
        app.bindWeb(e);
    },
    bindMap: function (e) {
        app.bindMap(e);
    },
    clickzan: function (e) {
        app.clickzan(e);
    },
    reflashList: function (e) {
        app.reflashList(e);
    },
    changeClassify: function (e) {
        app.changeClassify(e);
    },
    newsel_goods_type: function (e) {
        app.newsel_goods_type(e);
    },
    goToGoodsDetail: function (e) {
        app.goToGoodsDetail(e);
    },
    enterSearhText: function (e) {
        app.enterSearhText(e);
    },
    clickSearch: function (e) {
        app.clickSearch(e);
    },
    myCoupon: function () {
        app.myCoupon();
    },
    myMember: function () {
        app.myMember();
    },
    loadmoreTakOrder: function (e) {
        app.loadmoreTakOrder(e);
    },
    showTakType: function (e) {
        app.showTakType(e);
    },
    changeTakOrder: function (e) {
        app.changeTakOrder(e);
    },
    goToTakDetail: function (e) {
        app.goToTakDetail(e);
    },
    goToTakRefund: function (e) {
        app.goToTakRefund(e);
    },
    goToTakVerify: function (e) {
        app.goToTakVerify(e);
    },
    hiddenTakQR: function (e) {
        app.hiddenTakQR(e);
    },
    loadmoreSer: function (e) {
        app.loadmoreSer(dset);
    },
    scrollMoreSer: function (e) {
        app.scrollMoreSer(e);
    },
    searchService: function (e) {
        app.searchService(e);
    },
    loadmoreTech: function (e) {
        app.loadmoreTech(e);
    },
    techDetail: function (e) {
        app.techDetail(e);
    },
    searchTech: function (e) {
        app.searchTech(e);
    },
    bindBespcoupon: function (e) {
        app.bindBespcoupon(e);
    },
    searchApponitShop: function (e) {
        app.searchApponitShop(e);
    },
    goToAppoint: function (e) {
        app.goToAppoint(e);
    },
    loadmoreAppoint: function (e) {
        app.loadmoreAppoint(e);
    },
    openAppointMap: function (e) {
        app.openAppointMap(e);
    },
    NewUserCenterPage: function (e) {
        app.NewUserCenterPage(e);
    },
    bindAllCoupon: function (e) {
        app.bindAllCoupon(e);
    },
    bindSeckGoods: function (e) {
        app.bindSeckGoods(e);
    },
    bindGroupgoods: function (e) {
        app.bindGroupgoods(e);
    },
    bindBargaingoods: function (e) {
        app.bindBargaingoods(e);
    },
    searchBargain: function (e) {
        app.searchBargain(e);
    },
    loadmoreBargain: function (e) {
        app.loadmoreBargain(e);
    },
    goToBargainDetail: function (e) {
        app.goToBargainDetail(e);
    },
    scrollMoreGood: function (e) {
        app.scrollMoreGood(e);
    },
    loadmoreGoods: function (e) {
        app.loadmoreGoods(e);
    },
    scrollMoreGroupGood: function (e) {
        app.scrollMoreGroupGood(e);
    },
    loadmoreGroupGoods: function (e) {
        app.loadmoreGroupGoods(e);
    },
    scrollMoreSeckGood: function (e) {
        app.scrollMoreSeckGood(e);
    },
    loadmoreSeckGoods: function (e) {
        app.loadmoreSeckGoods(e);
    },
    scrollMoreDisGood: function (e) {
        app.scrollMoreDisGood(e);
    },
    loadmoreDisGood: function (e) {
        app.loadmoreDisGood(e);
    },
    loadmoreTakShop: function (e) {
        app.loadmoreTakShop(e);
    },
    loadmoreArt: function (e) {
        app.loadmoreArt(e);
    },
    scrollMoreProduct: function (e) {
        app.scrollMoreProduct(e);
    },
    loadmoreProduct: function (e) {
        app.loadmoreProduct(e);
    },
    sel_subgoods_type: function (e) {
        app.sel_subgoods_type(e);
    },
    loadmoreSubGoods: function (e) {
        app.loadmoreSubGoods(e);
    },
    searchSubGoods: function (e) {
        app.searchSubGoods(e);
    },
    bindServer: function (e) {
        app.bindServer(e);
    },
    bindTech: function (e) {
        app.bindTech(e);
    },
    loadmoreCityShop: function (e) {
        app.loadmoreCityShop(e);
    },
    goToCityShop: function (e) {
        app.goToCityShop(e);
    },
    searchCityShop: function (e) {
        app.searchCityShop(e);
    },
    bindSubshop: function (e) {
        app.bindSubshop(e);
    },
    takeoutMap: function (e) {
        app.takeoutMap(e);
    },
    choTakshopClass: function (e) {
        app.choTakshopClass(e);
    },
    choAppointshopClass: function (e) {
        app.choAppointshopClass(e);
    },
    bindList: function (e) {
        app.bindList(e);
    },
    loadmoreNewDisGood: function (e) {
        app.loadmoreNewDisGood(e);
    },
    sel_newdist_type: function (e) {
        app.sel_newdist_type(e);
    },
    searchNewDist: function (e) {
        app.searchNewDist(e);
    },
    bindNewDisgood: function (e) {
        app.bindNewDisgood(e);
    },
    clickAuthor: function () {
        app.clickAuthor();
    },
    getuserinfo: function (e) {
        app.getuserinfo(e);
    },
    goToCancelOrder: function (e) {
        app.goToCancelOrder(e);
    },
    showPaybox: function (e) {
        app.showPaybox(e);
    },
    hidePaybox: function (e) {
        app.hidePaybox(e);
    },
    goToPay: function (e) {
        app.goToPay(e);
    },
    bindRedpacket: function () {
        app.bindRedpacket();
    },
    loadMoreCoupon: function (e) {
        app.loadMoreCoupon(e);
    },
    getNewCoupon: function (e) {
        app.getNewCoupon(e);
    },
    choCityClass: function (e) {
        app.choCityClass(e);
    },
    goToShopHome: function (e) {
        app.goToShopHome(e);
    },
    searchGoodsShop: function (e) {
        app.searchGoodsShop(e);
    },
    loadmoreGshops: function (e) {
        app.loadmoreGshops(e);
    },
    choGoodsshopClass: function (e) {
        app.choGoodsshopClass(e);
    },
    searchThecity: function (e) {
        app.searchThecity(e);
    },
    textCopy: function (e) {
        app.textCopy(e);
    },
    searchCitylocation: function (e) {
        app.searchCitylocation(e);
    },
    chooseHouseNav: function (e) {
        app.chooseHouseNav(e);
    },
    bindHoutelPicker: function (e) {
        app.bindHoutelPicker(e);
    },
    goToRoomDetail: function (e) {
        app.goToRoomDetail(e);
    },
    sel_hotel_type: function (e) {
        app.sel_hotel_type(e);
    },
    openHotelMap: function (e) {
        app.openHotelMap(e);
    },
    enterHotelName: function (e) {
        app.enterHotelName(e);
    },
    searchHotel: function (e) {
        app.searchHotel(e);
    },
    sel_showCla: function (e) {
        app.sel_showCla(e);
    },
    hotelTap: function (e) {
        app.hotelTap(e);
    },
    sure_hotel_nid: function (e) {
        app.sure_hotel_nid(e);
    },
    loadmoreHotel: function (e) {
        app.loadmoreHotel(e);
    },
    gotoHotel: function (e) {
        app.gotoHotel(e);
    },
    gotoHotelSearch: function (e) {
        app.gotoHotelSearch(e);
    },
    bindTurntable: function () {
        app.bindTurntable();
    },
    aderror: function (e) {
        app.aderror(e);
    },
    emptyclick: function () {
    },
    gotoAddGoods: function (e) {
        app.gotoAddGoods(e);
    },
    gotoCart: function (e) {
        app.gotoCart(e);
    },
    close_page_goods: function (e) {
        app.close_page_goods(e);
    },
    chooseType: function (e) {
        app.chooseType(e);
    },
    changeCartnum: function (e) {
        app.changeCartnum(e);
    },
    sureAddCart: function (e) {
        app.sureAddCart(e);
    },
    entergoodsnum: function (e) {
        app.entergoodsnum(e);
    },
    playAudios: function (e) {
        app.playAudios(e);
    },
    NewPersonCenter: function (e) {
        app.NewPersonCenter(e);
    },
    newPerMessage: function () {
        app.newPerMessage();
    },
    goToCardDetail: function (e) {
        app.goToCardDetail(e);
    },
    loadmoreBusscard: function (e) {
        app.loadmoreBusscard(e);
    },
    bindBusicard: function (e) {
        app.bindBusicard(e);
    },
    callPhoce: function (e) {
        app.callPhoce(e);
    },
    closenewgift: function () {
        app.closenewgift();
    },
    closeAddTip: function () {
        app.closeAddTip();
    },
    openAuthor: function () {
        app.openAuthor();
    },
    refuseAuthor: function () {
        app.refuseAuthor();
    }
};
Page(pageData);