import HtmlToJson from './html2json.js';
function wxParse(bindName = 'wxParseData', type='html', data='<div class="color:red;">数据不能为空</div>', target,imagePadding) {
  var that = target;
  var transData = {};
  if (type == 'html') {
    transData = HtmlToJson.html2json(data, bindName);
  }
  transData.view = {};
  transData.view.imagePadding = 0;
  if(typeof(imagePadding) != 'undefined'){
    transData.view.imagePadding = imagePadding
  }
  if (bindName == 'default'){
    that.wxParseImgTap = function () { };
    return transData.nodes;
  }else{
    var bindData = {};
    bindData[bindName] = transData;
    that.setData(bindData)
    that.wxParseImgLoad = wxParseImgLoad;
    that.wxParseImgTap = wxParseImgTap;
  }
}
function wxParseImgTap(e) {
  var that = this;
  var nowImgUrl = e.target.dataset.src;
  var tagFrom = e.target.dataset.from;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    wx.previewImage({
      current: nowImgUrl, 
      urls: that.data[tagFrom].imageUrls 
    })
  }
}
function wxParseImgLoad(e) {
  var that = this;
  var tagFrom = e.target.dataset.from;
  var idx = e.target.dataset.idx;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    calMoreImageInfo(e, idx, that, tagFrom)
  }
}
function calMoreImageInfo(e, idx, that, bindName) {
  var temData = that.data[bindName];
  if (temData.images.length == 0) {
    return;
  }
  var temImages = temData.images;
  var recal = wxAutoImageCal(e.detail.width, e.detail.height,that,bindName);
  temImages[idx].width = recal.imageWidth;
  temImages[idx].height = recal.imageheight;
  temData.images = temImages;
  var bindData = {};
  bindData[bindName] = temData;
  that.setData(bindData);
}
function wxAutoImageCal(originalWidth, originalHeight,that,bindName) {
  var windowWidth = 0, windowHeight = 0;
  var autoWidth = 0, autoHeight = 0;
  var results = {};
  wx.getSystemInfo({
    success: function (res) {
      var padding = that.data[bindName].view.imagePadding;
      windowWidth = res.windowWidth-2*padding;
      windowHeight = res.windowHeight;
      if (originalWidth > windowWidth) {
        autoWidth = windowWidth;
        autoHeight = (autoWidth * originalHeight) / originalWidth;
        results.imageWidth = autoWidth;
        results.imageheight = autoHeight;
      } else {
      }
    }
  })
  return results;
}
function wxParseTemArray(temArrayName,bindNameReg,total,that){
  var array = [];
  var temData = that.data;
  var obj = null;
  for(var i = 0; i < total; i++){
    var simArr = temData[bindNameReg+i].nodes;
    array.push(simArr);
  }
  temArrayName = temArrayName || 'wxParseTemArray';
  obj = JSON.parse('{"'+ temArrayName +'":""}');
  obj[temArrayName] = array;
  that.setData(obj);
}
module.exports = {
  wxParse: wxParse
}