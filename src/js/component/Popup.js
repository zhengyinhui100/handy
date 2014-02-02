/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('c.Popup',
'c.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup');
	
	$HO.extend(Popup.prototype,{
		//初始配置
		clickHide       : true,            //是否点击就隐藏
		
		//组件共有配置
		withMask        : true,
		
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
	 * @param {boolean=}bShowed 是否已调用过显示方法，仅当为true时不再调用默认显示方法
	 */
	function fShow(bShowed){
		// 设置定位坐标
		var me=this;
		if(!bShowed){
			//默认居中显示
			me.showAtCenter();
		}
		me.callSuper(Popup.superClass,[true]);
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