/**
 * 图片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-12
 */

$Define('C.Image',
[
'C.AbstractComponent',
'M.DisplayImage'
],
function(AC,DisplayImage){
	
	var Image=AC.define('Image');
	
	Image.extend({
		//初始配置
		xConfig         : {
			cls         : 'img',
			imgSrc      : '',          //图片地址
			radius      : 'little'     //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		},
//		fixHeight       : 50,          //适应高度，自动修正图片高度，在不改变图片宽高比的前提下，最大化接近适应高度
//		fixWidth        : 50,          //适应宽度，自动修正图片宽度，在不改变图片宽高比的前提下，最大化接近适应宽度
		_customEvents   : ['imgLoad'],
		listeners       : [{
			name:'load',
			handler:function(oEvt){
				var me=this;
				var oImg=oEvt.target;
				//先移除宽度和高度属性才能获取准确的图片尺寸
				$(oImg).removeAttr("width").removeAttr("height");
				// 生成比例
	            var w = oImg.width,
	                h = oImg.height,
	                scale = w / h,
	                nFixW=me.fixWidth,
	                nFixH=me.fixHeight;
	            if(nFixW||nFixH){
		            if(w>nFixW){
		            	w=nFixW;
		            	h = w / scale;
		            }
		            if(h>nFixH){
		            	h=nFixH;
		            	w=h*scale;
		            }
		            $(oImg).attr({width:w,height:h});
	            }
				me.trigger("imgLoad",oEvt);
			}
		}],
		
		tmpl            : '<img {{bindAttr src="imgSrc"}}/>'
		
	});
	
	return Image;
	
});