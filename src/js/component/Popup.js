/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

define('C.Popup',
[
'L.Browser',
'B.Util',
'B.Event',
'C.AbstractComponent'
],
function(Browser,Util,Event,AC){
	
	var Popup=AC.define('Popup'),
	_popupNum=0,
	_mask;
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
//		timeout         : null,            //自动隐藏的时间(毫秒)，不指定此值则不自动隐藏
		isFixed         : false,           //是否是position:fixed
		showPos         : 'center',        //定位方法名:center(居中)、followEl(跟随指定元素)、top(顶部)，或者传入自定义定位函数
//		offsetTop       : 0,               //顶部偏移量
		destroyWhenHide : true,            //隐藏时保留对象，不自动销毁，默认弹出层会自动销毁
//		noMask          : false,           //仅当true时没有遮罩层
		
		//组件共有配置
		shadowOverlay   : true,
		
		tmpl            : '<div>{{placeItem}}</div>',
		
		doConfig         : fDoConfig,        //初始化配置
		afterShow        : fAfterShow,       //显示
		hide             : fHide,            //隐藏
		top              : fTop,             //顶部显示
		center           : fCenter,          //居中显示
		bottom           : fBottom,          //底部显示
		followEl         : fFollowEl,        //根据指定节点显示
		mask             : fMask,            //显示遮罩层
		unmask           : fUnmask           //隐藏遮罩层
	});
	/**
	 * 初始化配置
	 */
	function fDoConfig(oParam){
		var me=this;
		me.callSuper();
		me.extCls=(me.extCls||'')+' hui-popup'+(me.isFixed?' hui-popup-fixed':'');
		//添加点击即隐藏事件
		if(me.clickHide){
			me.listeners.push({
				name:'click',
				el: $(document),
				handler:function(){
					this.hide();
				}
			});
		}
		//TODO:这里暂时使用fastclick解决，不然，disabled会使oForm.serializeArray()获取不到数据
		//移动端弹出遮罩层时，点击仍能聚焦到到输入框，暂时只能在弹出时disable掉，虽然能避免聚焦及弹出输入法，
		//不过，仍旧会有光标竖线停留在点击的输入框里，要把延迟加到几秒之后才能避免，但又会影响使用
//		if(Browser.mobile()){
//			me.listeners.push({
//				name:'show',
//				custom:true,
//				handler:function(){
//					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
//					var bHasDone=Event.trigger("component.popup.show");
//					if(bHasDone!=true){
//						$("input,textarea,select").attr("disabled","disabled");
//					}
//				}
//			});
//			me.listeners.push({
//				name:'hide',
//				custom:true,
//				handler:function(){
//					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
//					var bHasDone=Event.trigger("component.popup.hide");
//					if(bHasDone!=true){
//						//ps:这里延迟300ms执行还是有可能会有聚焦效果，所以设个保险的500ms
//						setTimeout(function(){
//							$("input,textarea,select").removeAttr("disabled");
//						},500);
//					}
//				}
//			});
//		}
	}
	/**
	 * 显示后工作
	 */
	function fAfterShow(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		oEl.css('z-index',_popupNum*1000+1000);
		//如果未设置宽度，默认和父组件宽度一样
		if(!me.width&&me.parent){
			var oParentEl=me.parent.getEl();
			var width=me.width=oParentEl[0].clientWidth;
			oEl.css('width',width);
		}
		//默认居中显示
		var showPos=me.showPos;
		var sType=typeof showPos;
		if(sType==="string"){
			me[showPos]();
		}else if(sType==="function"){
			showPos.call(me);
		}else if(sType==='object'&&showPos!==null){
			oEl.css(me.showPos);
		}
		if(!me.noMask){
			me.mask();
		}
		//定时隐藏
		if(me.timeout){
			setTimeout(function(){
				if(!me.destroyed){
					me.hide();
				}
			},me.timeout);
		}
		//用户点击后退时先隐藏弹出层
		Event.once('hisoryChange',function(){
			if(me.showed&&!me.destroyed){
				me.hide();
				Event.stop();
				return false;
			}
		});
		me.callSuper();
	}
	/**
	 * 隐藏
	 */
	function fHide(){
		var me=this;
		var bIsHide=me.callSuper();
		if(bIsHide!=false){
			if(!me.noMask){
				me.unmask();
			}
			if(me.destroyWhenHide){
				me.destroy();
			}
		}
	}
	/**
	 * 顶部显示
	 */
	function fTop(){
		var me=this;
		var oEl=me.getEl();
		oEl.css({
			left: '50%',
			top:Util.em2px(0.5),
			position:'fixed'
		});
	}
	/**
	 * 居中显示
	 */
	function fCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=oEl[0].clientWidth;
		var height=oEl[0].clientHeight;
		var oDoc=document;
		var oDocEl=oDoc.documentElement;
		var oBody=oDoc.body;
		var nDocWidth;
		//IE8下如果html节点设置了width，offsetWidth不准确
		if(Browser.ie()<=8){
			var nStyleW=oDocEl.currentStyle.width;
			if(nStyleW){
				if(nStyleW.indexOf('em')>0){
					nDocWidth=Util.em2px(nStyleW);
				}else{
					nDocWidth=parseInt(nStyleW.replace('px',''));
				}
			}else{
				nDocWidth=oDocEl.offsetWidth || oBody.offsetWidth;
			}
		}else{
			nDocWidth=oBody.offsetWidth;
		}
		var x = ( nDocWidth- width)/2;
		var nClientHeight=oDocEl.clientHeight || oBody.clientHeight;
		//稍微偏上一些显示
		var nSpace=nClientHeight - height;
		var y = nSpace/2 -nSpace/10;
		if(!me.isFixed){
			y+= oDocEl.scrollTop||oBody.scrollTop;
		}
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	/**
	 * 底部显示
	 */
	function fBottom(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=oEl[0].clientWidth;
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		oEl.css({
			left:x + "px",
			bottom:me.get('hasArrow')?'1em':0
		});
	}
	/**
	 * 显示在指定元素显示
	 * @param {jQuery}oFollowEl 定位标准元素
	 */
	function fFollowEl(oFollowEl){
		var me=this;
		oFollowEl=oFollowEl||me.parent.getEl();
		oFollowEl=oFollowEl[0];
		var oPos=Util.position(oFollowEl);
		var oEl=me.getEl();
		var oDoc=document;
		var oDocEl=oDoc.documentElement;
		var oBody=oDoc.body;
		var nHeight=oEl[0].clientHeight;
		var nClientHeight=oDocEl.clientHeight || oBody.clientHeight;
		var nScrollTop=Util.scrollTop(oFollowEl);
		oPos.top-=nScrollTop;
		//弹出层底部位置
		var oElBotttom=oPos.top+nHeight;
		//弹出层底部超出可视范围
		var nOfffset=oElBotttom-nClientHeight;
		//网上调整以显示完整的弹出层
		if(nOfffset>0){
		    oPos.top=oPos.top-nOfffset;
		}
		oEl.css(oPos);
	}
	/**
	 * 显示遮罩层
	 */
	function fMask(){
		var me=this;
		if(!_mask){
			_mask=$('<div class="hui-mask hui-hidden"></div>').appendTo(me.renderTo);
		}else{
			_mask.appendTo(me.renderTo);
		}
		_mask.css('z-index',_popupNum*1000+998);
		if(_popupNum==0){
			_mask.removeClass('hui-hidden');
		}
		_popupNum++;
	}
	/**
	 * 隐藏遮罩层
	 */
	function fUnmask(){
		var me=this;
		_popupNum--;
		if(_popupNum==0){
			_mask.addClass('hui-hidden');
		}else{
			_mask.css('z-index',(_popupNum-1)*1000+998);
		}
	}
	
	return Popup;
	
});