/**
 * 图片展示模块
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

$Define("M.DisplayImage",
'M.AbstractModule',
function(AbstractModule){
	
	var DisplayImage=AbstractModule.derive({
//		imgSrc      : '',              //缩略图src
//		origSrc     : '',              //原图src
		listeners   : [{
			name:'afterShow',
			custom:true,
			handler:function(){
				var me=this;
				var oEl=me.getEl()[0];
				me.findEl('.js-loading').css({
					left:oEl.clientWidth/2-22,
					top:oEl.clientHeight/2-22
				});
			}
		},{
			name : "click",
			handler:function(){
				$M.back();
			}
		},{
			name:'load',
			el:'.js-img',
			handler:function(){
				var me=this;
			    var oImg=me.findEl('.js-img');
			    me.fixImgSize(oImg);
			    oImg.css("marginTop",-oImg.height()/2);
			}
		},{
			name:'load',
			el:'.js-orig',
			handler:function(){
				var me=this;
				me.showLoading(false);
			    me.findEl('.js-img').hide();
				var oImg=me.findEl('.js-orig').show();
				me.fixImgSize(oImg);
				oImg.css("marginTop",-oImg.height()/2);
			}
		}],
		tmpl        : [
			'<div class="hui-displayimage c-v-middle-container">',
				'<span class="js-loading hui-icon hui-icon-loading hui-icon-bg hui-hidden"></span>',
				'<div class="hui-displayimage-inner c-h-middle-container c-v-middle">',
					'<img class="js-img c-h-middle"/>',
					'<img class="js-orig c-h-middle">',
				'</div>',
			'</div>'].join(""),
		entry       : fEntry,            //进入模块
		fixImgSize  : fFixImgSize,       //调整图片大小以最大化适应模块大小
		showLoading : fShowLoading       //显示/隐藏加载提示
	});
	
	/**
	 * 进入模块
	 * @param {object}oParams 参数选项
	 */
	function fEntry(oParams){
		var me=this;
		if(oParams.imgSrc!=me.lastSrc){
			var src=me.imgSrc=me.lastSrc=oParams.imgSrc;
			me.findEl('.js-img').attr('src',src).show();
			me.showLoading();
			me.findEl('.js-orig').attr('src',oParams.origSrc).hide();
		}
	}
	/**
	 * 调整图片大小以最大化适应模块大小
	 * @param {jquery}jImg 图片对象
	 */
	function fFixImgSize(jImg){
		var oImg=jImg[0];
		var oEl=this.getEl()[0];
        var w = oImg.width,
            h = oImg.height,
            scale = w / h,
            nFixW=oEl.clientWidth,
            nFixH=oEl.clientHeight,
            nFixScale=nFixW/nFixH;
        if(scale>nFixScale){
        	w=nFixW;
        	h = w / scale;
        }else{
        	h=nFixH;
        	w=h*scale;
        }
        jImg.attr({width:w,height:h});
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