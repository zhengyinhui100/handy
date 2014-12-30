/**
 * 图片展示类，弹出展示大图片
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.DisplayImage',
[
'B.Object',
'B.Util',
'C.AbstractComponent',
'C.Popup',
'C.AbstractImage'
],
function(Obj,Util,AC,Popup,AbstractImage){
	
	var DisplayImage=AC.define('DisplayImage',Popup);
	
	Obj.extendIf(DisplayImage.prototype,AbstractImage.prototype);
	
	DisplayImage.extend({
		//初始配置
		xConfig         : {
			cls         : 'dispimg'
		},
		
//		imgSrc          : '',              //缩略图src
//		origSrc         : '',              //原图src
		showPos         : null,
		noMask          : true,
		isFixed         : true,

		listeners       : [{
			name:'afterShow',
			custom:true,
			handler:function(){
				var me=this;
				var oEl=me.getEl()[0];
				me.findEl('.js-loading').css({
					left:oEl.clientWidth/2-Util.em2px(1.375),
					top:oEl.clientHeight/2-Util.em2px(1.375)
				});
				me.showLoading();
				me.findEl('.js-img').attr('src',me.imgSrc);
				me.findEl('.js-orig').attr('src',me.origSrc);
			}
		},{
			name:'load',
			el:'.js-img',
			handler:function(oEvt){
				var me=this;
			    me.fixImgSize(oEvt.target,true);
			}
		},{
			name:'load',
			el:'.js-orig',
			handler:function(oEvt){
				var me=this;
				me.showLoading(false);
			    me.findEl('.js-img').addClass('hui-hidden');
				me.fixImgSize(oEvt.target,true);
			}
		}],
		tmpl        : [
			'<div class="c-v-middle-container">',
				'<span class="js-loading hui-icon hui-icon-loading hui-icon-bg hui-hidden"></span>',
				'<img class="js-img hui-unvisible"/>',
				'<img class="js-orig hui-unvisible">',
			'</div>'].join(""),
		showLoading : fShowLoading       //显示/隐藏加载提示
		
	});
	
	/**
	 * 调整图片大小以最大化适应模块大小
	 * @param {jquery}jImg 图片对象
	 */
	function fFixImgSize(jImg){
		var oImg=jImg[0];
		var oEl=this.getEl()[0];
		//先移除宽度和高度属性才能获取准确的图片尺寸
		jImg.removeAttr("width").removeAttr("height");
        var w = oImg.width,
            h = oImg.height,
            scale = w / h,
            nFixW=oEl.clientWidth,
            nFixH=oEl.clientHeight;
        if(nFixW&&w!=nFixW){
        	w=nFixW;
        	h = Math.ceil(w / scale);
        }
        if(nFixH&&h>nFixH){
        	h=nFixH;
        	w=Math.ceil(h*scale);
        }
        jImg.css({width:w,height:h});
        jImg.css("marginTop",-h/2);
        jImg.removeClass('hui-hidden');
	}
	/**
	 * 显示/隐藏加载提示
	 * @param {boolean=}bShow 仅当false隐藏
	 */
	function fShowLoading(bShow){
		var me=this;
		me.findEl('.js-loading')[bShow===false?"addClass":"removeClass"]('hui-hidden');
	}
	
	return DisplayImage;
	
});