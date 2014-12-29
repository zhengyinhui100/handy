/**
 * 图片类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-07-12
 */

define('C.Image',
[
'C.AbstractComponent',
'C.AbstractImage'
],
function(AC,AbstractImage){
	
	var Image=AC.define('Image',AbstractImage);
	
	Image.extend({
		//初始配置
		xConfig         : {
			cls         : 'image',
			imgSrc      : '',          //图片地址
			radius      : 'normal'     //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		},
		listeners       : [{
			name:'load',
			el:'img',
			handler:function(oEvt){
				var me=this;
				var oImg=oEvt.target;
				me.fixImgSize(oImg);
			}
		}],
		
		tmpl            : '<div><img {{bindAttr src="imgSrc"}} class="hui-unvisible"/></div>'
		
	});
	
	return Image;
	
});