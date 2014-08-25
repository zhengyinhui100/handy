/**
 * 弹出层类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-02-01
 */

$Define('C.Popup',
'C.AbstractComponent',
function(AC){
	
	var Popup=AC.define('Popup'),
	_popupNum=0,
	_mask;
	
	Popup.extend({
		//初始配置
		delayShow       : true,            //延迟显示
		clickHide       : true,            //是否点击就隐藏
//		timeout         : null,            //自动隐藏的时间(毫秒)，不指定此值则不自动隐藏
		showPos         : 'center',        //定位方法名:center(居中)、followEl(跟随指定元素)、top(顶部)，或者传入自定义定位函数
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
		followEl         : fFollowEl,        //根据指定节点显示
		mask             : fMask,            //显示遮罩层
		unmask           : fUnmask           //隐藏遮罩层
	});
	/**
	 * 初始化配置
	 * @method doConfig
	 */
	function fDoConfig(oParam){
		var me=this;
		me.callSuper();
		me.extCls=(me.extCls||'')+' hui-popup';
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
		//Android下弹出遮罩层时，点击仍能聚焦到到输入框，暂时只能在弹出时disable掉，虽然能避免聚焦及弹出输入法，
		//不过，仍旧会有光标竖线停留在点击的输入框里，要把延迟加到几秒之后才能避免，但又会影响使用
		if($H.android()){
			me.listeners.push({
				name:'show',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.show");
					if(bHasDone!=true){
						$("input,textarea,select").attr("disabled","disabled");
					}
				}
			});
			me.listeners.push({
				name:'hide',
				custom:true,
				handler:function(){
					//外部可以通过监听器自行处理这个问题，只需要返回true即可不调用此处的方法
					var bHasDone=$H.Events.trigger("component.popup.hide");
					if(bHasDone!=true){
						//ps:这里延迟300ms执行还是有可能会有聚焦效果，所以设个保险的500ms
						setTimeout(function(){
							$("input,textarea,select").removeAttr("disabled");
						},500);
					}
				}
			});
		}
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		oEl.css('z-index',_popupNum*1000+1000);
		//如果未设置宽度，默认和父组件宽度一样
		if(!me.width&&me.parent){
			var width=me.width=me.parent.getEl().outerWidth();
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
		$H.once('hisoryChange',function(){
			if(me.showed&&!me.destroyed){
				me.hide();
				$H.stop();
				return false;
			}
		});
		me.callSuper();
	}
	/**
	 * 隐藏
	 * @method hide
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
			left: $H.em2px(5),
			top:$H.em2px(0.5),
			position:'fixed'
		});
	}
	/**
	 * 居中显示
	 * @method center
	 */
	function fCenter(){
		// 设置定位坐标
		var me=this;
		var oEl=me.getEl();
		var width=me.width||oEl[0].clientWidth;
		var height=me.height||oEl[0].clientHeight;
		var oDoc=document;
		var x = ((oDoc.documentElement.offsetWidth || oDoc.body.offsetWidth) - width)/2;
		var y = ((oDoc.documentElement.clientHeight || oDoc.body.clientHeight) - height)/2 + (oDoc.documentElement.scrollTop||oDoc.body.scrollTop);
		y = y < 10 ? window.screen.height/2-200 : y;
		oEl.css({
			left:x + "px",
			top:y-(me.offsetTop||0) + "px"
		});
	}
	/**
	 * 显示在指定元素显示
	 * @method followEl
	 * @param {jQuery}oEl 定位标准元素
	 */
	function fFollowEl(oEl){
		var me=this;
		var el=oEl||me.parent.getEl();
		var oPos=$H.position(el[0]);
		me.getEl().css(oPos);
	}
	/**
	 * 显示遮罩层
	 * @method mask
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
	 * @method unmask
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