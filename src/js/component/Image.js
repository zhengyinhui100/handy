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
			cls         : 'image',
			imgSrc      : '',          //图片地址
			radius      : 'little'     //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		},
//		height          : 50,          //指定高度会自动修正图片高度，在不改变图片宽高比的前提下，最大化接近指定的高度
//		width           : 50,          //指定宽度会自动修正图片宽度，在不改变图片宽高比的前提下，最大化接近指定的宽度
		_customEvents   : ['imgLoad'],
		listeners       : [{
			name:'load',
			el:'img',
			handler:function(oEvt){
				var me=this;
				var oImg=oEvt.target;
				//先移除宽度和高度属性才能获取准确的图片尺寸
				$(oImg).removeAttr("width").removeAttr("height");
				// 生成比例
	            var w = oImg.width,
	                h = oImg.height,
	                scale = w / h,
	                nFixW=me.width,
	                nFixH=me.height;
	            oImg=$(oImg);
	            if(nFixW||nFixH){
		            if(w>nFixW){
		            	w=nFixW;
		            	h = w / scale;
		            }
		            if(h>nFixH){
		            	h=nFixH;
		            	w=h*scale;
		            }
		            oImg.attr({width:w,height:h});
	            }
	            var nLeft,nTop;
	            if(w<nFixW){
	            	nLeft=(nFixW-w)/2;
	            	oImg.css('left',nLeft);
	            }
	            if(h<nFixH){
	            	nTop=(nFixH-h)/2;
	            	oImg.css('top',nTop);
	            }
				me.trigger("imgLoad",oEvt);
			}
		}],
		
		tmpl            : '<div><img {{bindAttr src="imgSrc"}}/></div>'
		
	});
	
	return Image;
	
});