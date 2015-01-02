/**
 * 图片抽象类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 */

define('C.AbstractImage',
[
'B.Object',
'C.AbstractComponent'
],
function(Obj,AC){
	
	var AbstractImage=AC.define('AbstractImage');
	
	AbstractImage.extend({
		_customEvents   : {imgFixed:1}, //自定义事件，图片已修正
//		height          : 50,           //指定高度会自动修正图片高度，在不改变图片宽高比的前提下，最大化接近指定的高度
//		width           : 50,           //指定宽度会自动修正图片宽度，在不改变图片宽高比的前提下，最大化接近指定的宽度
		fixImgSize      : fFixImgSize   //修正图片尺寸，及居中显示
	});
	/**
	 * 修正图片尺寸，及居中显示
	 * @param {element}oImg 图片节点对象
	 * @return {boolean=}bContain 是否把图片缩小以显示所有图片，默认是放大图片以覆盖父节点
	 */
	function fFixImgSize(oImg,bContain){
		var me=this;
		//先移除宽度和高度属性才能获取准确的图片尺寸
		var jImg=$(oImg).removeAttr("width").removeAttr("height").css({width:'',height:''});
		var oEl=me.getEl()[0];
		// 生成比例
        var w = nOrigW=oImg.width,
            h = nOrigH=oImg.height,
            scale = w / h,
            nFixW=me.width,
            nFixH=me.height;
    	if(nFixW===undefined||(Obj.isStr(nFixW)&&nFixW.indexOf('em')>0)){
    		nFixW=oEl.clientWidth;
    	}
    	if(nFixH===undefined||(Obj.isStr(nFixH)&&nFixH.indexOf('em')>0)){
    		nFixH=oEl.clientHeight;
    	}
    	if(bContain){
    		//缩小以显示整个图片
	        if(nFixW||nFixH){
	            if(nFixW&&w!=nFixW){
	            	w=nFixW;
	            	h = Math.ceil(w / scale);
	            }
	            if(nFixH&&h>nFixH){
	            	h=nFixH;
	            	w=Math.ceil(h*scale);
	            }
	            jImg.css({width:w,height:h});
	        }
	        //居中定位
	        var nLeft=0,nTop=0;
	        if(w<nFixW){
	        	nLeft=(nFixW-w)/2;
	        	nLeft=Math.ceil(nLeft);
	        }
	    	jImg.css('left',nLeft);
	        if(h<nFixH){
	        	nTop=(nFixH-h)/2;
	        	nTop=Math.ceil(nTop);
	        }
	    	jImg.css('top',nTop);
    	}else{
    		//放大以覆盖父节点
	        if(nFixW||nFixH){
	            if(nFixW&&w!=nFixW){
	            	w=nFixW;
	            	h = Math.ceil(w / scale);
	            }
	            if(nFixH&&h<nFixH){
	            	h=nFixH;
	            	w=Math.ceil(h*scale);
	            }
	            jImg.css({width:w,height:h});
	        }
	        //居中定位
	        var nLeft=0,nTop=0;
	        if(w>nFixW){
	        	nLeft=(nFixW-w)/2;
	        	nLeft=Math.ceil(nLeft);
	        }
	    	jImg.css('left',nLeft);
	        if(h>nFixH){
	        	nTop=(nFixH-h)/2;
	        	nTop=Math.ceil(nTop);
	        }
	    	jImg.css('top',nTop);
    	}
    	
        //修正尺寸后才显示图片，避免出现图片大小变化过程
        jImg.removeClass('hui-unvisible');
		me.trigger("imgFixed",jImg);
		return {
			width:w,
			height:h,
			origW:nOrigW,
			origH:nOrigH,
			left:nLeft,
			top:nTop
		}
	}
	
	return AbstractImage;
	
});