/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Popup',
'c.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup');
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
		
		//组件共有配置
		withMask        : true,
		shadowOverlay   : true,
		
		tmpl            : [
			'<div class="hui-popup"><%=this.getHtml("$>*")%></div>'
		],
		listeners       : [{
			type:'click',
			el: $(document),
			handler:function(){
				var me=this;
				if(me.clickHide){
					this.hide();
				}
			}
		}],
		
		show             : fShow,            //显示
		showAtCenter     : fShowAtCenter     //居中显示
	});
	
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		// 设置定位坐标
		var me=this;
		//默认居中显示
		me.showAtCenter();
		//指定父类，避免死循环，如果是父组件通过callChild调用的会有参数，要传进去
		me.callSuper(Popup.superClass,arguments);
	}
	/**
	 * 居中显示
	 * @method showAtCenter
	 */
	function fShowAtCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - oEl.width())/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - oEl.height())/2 + oDoc.body.scrollTop;
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	
	return Popup;
	
});