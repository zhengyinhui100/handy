/**
 * 图片裁剪类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.Crop',
[
'L.Browser',
'B.Object',
'B.Util',
'C.AbstractComponent',
'C.AbstractImage',
'E.Draggable'
],
function(Browser,Obj,Util,AC,AbstractImage,Draggable){
	
	var Crop=AC.define('Crop',AbstractImage);
	
	var _startEvent=Browser.hasTouch()?'touchstart':'mousedown';
	
	Crop.extend({
		//初始配置
		xConfig         : {
			cls         : 'crop'
		},
		listeners       : [{
			name:'show',
			custom:true,
			handler:function(){
				var me=this;
				me.findEl('.js-orig-img,.js-crop-img').attr('src',me.imgSrc);
			}
		},{
			name:'load',
			el:'.js-orig-img',
			handler:function(){
				this.initCrop();
			}
		},{
			name:_startEvent,
			el:'.js-box-img',
			handler:function(){
				this.startDrag();
			}
		},{
			name:_startEvent,
			el:'.js-op-bar',
			handler:function(oEvt){
				this.startZoom(oEvt);
			}
		}],
		
		imgSrc          : '',                  //图片源
		cropWidth       : '70%',               //剪切框宽度，可以是百分比、或者是像素值数字或者是em单位的尺寸
		cropHeight      : '70%',               //剪切框高度，传入fixedScale时，会根据fixedScale分别计算宽度和高度，以小的结果为准
		fixedScale      : 1,                   //固定宽高比,true时会自动根据cropWidth和cropHeight计算
		
		tmpl            : [
			'<div>',
				'<img class="js-orig-img hui-orig-img hui-unvisible">',
				'<div class="hui-mask"></div>',
				'<div class="js-crop-box hui-crop-box">',
					'<div class="js-box-img hui-box-img">',
						'<img class="js-crop-img hui-crop-img hui-unvisible">',
					'</div>',
					'<div class="hui-box-op">',
						'<div class="hui-op-handle hui-op-handle-n"></div>',
						'<div class="hui-op-handle hui-op-handle-e"></div>',
						'<div class="hui-op-handle hui-op-handle-s"></div>',
						'<div class="hui-op-handle hui-op-handle-w"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-n"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-e"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-s"></div>',
						'<div class="js-op-bar hui-op-bar hui-op-bar-w"></div>',
					'</div>',
				'</div>',
			'</div>'].join(''),
		initCrop        : fInitCrop,   //初始化
		startDrag       : fStartDrag,  //点击剪切框内容，准备开始拖拽
		startZoom       : fStartZoom,  //点击剪切框边框，准备开始缩放
		move            : fMove,       //移动选择框
		dragCrop        : fDragCrop,   //拖拽选中框
		zoomCrop        : fZoomCrop,   //缩放选择框
		getResult       : fGetResult,  //获取裁剪结果
		destroy         : fDestroy     //销毁
	});
	
	/**
	 * 初始化
	 */
	function fInitCrop(){
		var me=this;
		var oImg=me.origImg=me.findEl('.js-orig-img');
		//修正图片大小
		var oSize=me.fixImgSize(oImg[0],true);
		me.origW=oSize.origW;
		me.origH=oSize.origH;
		var cropW=me.cropWidth;
		if(Obj.isStr(cropW)){
			if(cropW.indexOf('%')>0){
				me.cropWidth=oSize.width*parseInt(cropW.replace('%',''))/100;
			}else{
				me.cropWidth=Util.em2px(cropW);
			}
		}
		var cropH=me.cropHeight;
		if(Obj.isStr(cropH)){
			if(cropW.indexOf('%')>0){
				me.cropHeight=oSize.height*parseInt(cropH.replace('%',''))/100;
			}else{
				me.cropHeight=Util.em2px(cropH);
			}
		}
		var fixedScale=me.fixedScale;
		if(fixedScale===true){
			me.fixedScale=me.cropWidth/me.cropHeight;
		}else if(fixedScale){
			var cropH=me.cropWidth/fixedScale;
			if(me.cropHeight>cropH){
				me.cropHeight=cropH;
			}else{
				me.cropWidth=me.cropHeight*fixedScale;
			}
		}
		//图片居中显示的偏移量
		var nLeftOffset=me.leftOffset=oSize.left;
		var nTopOffset=me.topOffset=oSize.top;
		//裁剪框居中显示
		var nWidth=me.imgWidth=oSize.width;
		var nHeight=me.imgHeight=oSize.height;
		//缩放比例
		me.scale=nHeight/oSize.origH;
		var nLeft=me.cropX=Math.ceil((nWidth-me.cropWidth)/2);
		var nTop=me.cropY=Math.ceil((nHeight-me.cropHeight)/2);
		me.cropBox=me.findEl('.js-crop-box').css({
			left:nLeftOffset+nLeft,
			top:nTopOffset+nTop,
			width:me.cropWidth,
			height:me.cropHeight
		});
		//裁剪框中的图片校对位置
		me.cropImg=me.findEl('.js-crop-img').css({
			height:nHeight,
			width:nWidth,
			marginLeft:-nLeft,
			marginTop:-nTop
		}).removeClass('hui-unvisible');
		me.draggable=new Draggable(me.getEl(),{
			move:function(oPos){
				return me.move(oPos);
			},
			end:function(){
				me.dragging=false;
				me.zooming=false;
			}
		});
	}
	/**
	 * 点击剪切框内容，准备开始拖拽
	 */
	function fStartDrag(){
		var me=this;
		me.dragging=true;
		me.initCropX=me.cropX;
		me.initCropY=me.cropY;
	}
	/**
	 * 点击剪切框边框，准备开始缩放
	 * @param {jEvent}oEvt 事件对象
	 */
	function fStartZoom(oEvt){
		var me=this;
		me.zooming=true;
		me.initCropWidth=me.cropWidth;
		me.initCropHeight=me.cropHeight;
		var sCls=oEvt.currentTarget.className;
		if(sCls.indexOf('-n')>0){
			me.zoomDirect='n';
		}else if(sCls.indexOf('-e')>0){
			me.zoomDirect='e';
		}else if(sCls.indexOf('-s')>0){
			me.zoomDirect='s';
		}else{
			me.zoomDirect='w';
		}
		me.initCropX=me.cropX;
		me.initCropY=me.cropY;
	}
	/**
	 * 移动选择框
	 * @param {object}oPos 位置信息
	 */
	function fMove(oPos){
		var me=this;
		if(me.dragging){
			me.dragCrop(oPos);
		}else if(me.zooming){
			me.zoomCrop(oPos);
		}
		return false;
	}
	/**
	 * 拖拽选择框
	 * @param {object}oPos 位置信息
	 */
	function fDragCrop(oPos){
		var me=this;
		var nCropX=me.initCropX+oPos.offsetX;
		var nCropY=me.initCropY+oPos.offsetY;
		//不能超出图片边界
		if(nCropX<0){
			nCropX=0;
		}
		var nMaxX=me.imgWidth-me.cropWidth;
		if(nCropX>nMaxX){
			nCropX=nMaxX;
		}
		if(nCropY<0){
			nCropY=0;
		}
		var nMaxY=me.imgHeight-me.cropHeight;
		if(nCropY>nMaxY){
			nCropY=nMaxY;
		}
		me.cropImg.css({
			marginLeft:-nCropX,
			marginTop:-nCropY
		});
		me.cropBox.css({
			left:me.leftOffset+nCropX,
			top:me.topOffset+nCropY
		});
		me.cropX=nCropX;
		me.cropY=nCropY;
	}
	/**
	 * 缩放选择框
	 * @param {object}oPos 位置信息
	 */
	function fZoomCrop(oPos){
		var me=this;
		var sDirection=me.zoomDirect;
		var nFixedScale=me.fixedScale;
		var nOffsetX=oPos.offsetX;
		var nOffsetY=oPos.offsetY;
		//向上或向左
		if(sDirection==='n'||sDirection==='w'){
			var nMaxX=me.initCropX;
			var nMaxY=me.initCropY;
			if(sDirection==='n'){
				if(nFixedScale){
					nMaxY=Math.min(nMaxY,nMaxX/nFixedScale);
				}
				//不能超过图片边界
				if(nMaxY+nOffsetY<0){
					nOffsetY=-nMaxY;
				}
				nOffsetX=nFixedScale?nOffsetY*nFixedScale:0;
			}else{
				if(nFixedScale){
					nMaxX=Math.min(nMaxX,nMaxY*nFixedScale);
				}
				if(nMaxX+nOffsetX<0){
					nOffsetX=-nMaxX;
				}
				nOffsetY=nFixedScale?nOffsetX/nFixedScale:0;
			}
			me.dragCrop({
				offsetX:nOffsetX,
				offsetY:nOffsetY
			});
			nOffsetX=-nOffsetX;
			nOffsetY=-nOffsetY;
		}else{
			var nMaxX=me.imgWidth-me.cropX-me.initCropWidth;
			var nMaxY=me.imgHeight-me.cropY-me.initCropHeight;
			if(sDirection==='e'){
				if(nFixedScale){
					nMaxX=Math.min(nMaxX,nMaxY*nFixedScale);
				}
				//不能超过图片边界
				if(nOffsetX>nMaxX){
					nOffsetX=nMaxX;
				}
				nOffsetY=nFixedScale?nOffsetX/nFixedScale:0;
			}else{
				if(nFixedScale){
					nMaxY=Math.min(nMaxY,nMaxX/nFixedScale);
				}
				if(nOffsetY>nMaxY){
					nOffsetY=nMaxY;
				}
				nOffsetX=nFixedScale?nOffsetY*nFixedScale:0;
			}
		}
		me.cropWidth=me.initCropWidth+nOffsetX;
		me.cropHeight=me.initCropHeight+nOffsetY;
		me.cropBox.css({
			width:me.cropWidth,
			height:me.cropHeight
		});
		return false;
	}
	/**
	 * 获取裁剪结果
	 * @return {object} {
	 * 		{number}x:起始横坐标,
	 * 		{number}y:起始纵坐标,
	 * 		{number}w:宽度,
	 * 		{number}h:高度
	 * }
	 */
	function fGetResult(){
		var me=this;
		var nScale=me.scale;
		var fCeil=Math.ceil;
		return {
			cropX:fCeil(me.cropX/nScale),
			cropY:fCeil(me.cropY/nScale),
			cropW:fCeil(me.cropWidth/nScale),
			cropH:fCeil(me.cropHeight/nScale),
			origW:me.origW,
			origH:me.origH
		};
	}
	/**
	 * 销毁
	 */
	function fDestroy(){
		var me=this;
		me.draggable.destroy();
		me.callSuper();
	}
	
	return Crop;
	
});