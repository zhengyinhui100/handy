/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.common.AbstractView"
$Define('cm.AbstractView',function(){
	
	var AbstractView=$HO.createClass();
	
	$HO.extend(AbstractView.prototype,{
//		_container          : null,              //试图对象容器节点
//      listened            : false,             //是否已初始化事件
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
		
		initialize          : fInitialize,       //初始化
		getEl               : fGetEl,            //获取容器节点
		getHtml             : $H.noop,           //获取html
		initStyle           : $H.noop,           //初始化样式
		
		fire                : fFire,             //触发组件自定义事件
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
		afterShow           : fAfterShow,        //显示后工作
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		destroy             : fDestroy           //销毁
	});
	/**
	 * 初始化
	 * @method initialize
	 */
	function fInitialize(){
		this.initListeners();
	}
	/**
	 * 获取容器节点
	 * @method getEl
	 * @return {jQuery} 返回容器节点
	 */
	function fGetEl(){
		return this._container;
	}
	/**
	 * 触发组件自定义事件
	 * @method fire
	 * @param {string}sType 事件类型
	 * @param {Array=}aArgs 附加参数
	 */
	function fFire(sType,aArgs){
		var me=this;
		for(var i=me._listeners.length-1;i>=0;i--){
			var oListener=me._listeners[i]
			if(oListener.type==sType){
				var fDelegation=oListener.delegation;
				if(aArgs){
					fDelegation.apply(null,aArgs.shift(oListener));
				}else{
					fDelegation(oListener);
				}
			}
		}
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}type      : 事件名
	 * 			{function(Object[,fireParam..])}handler : 监听函数，第一个参数为事件对象oListener，其后的参数为fire时传入的参数
	 * 			{any=}data        : 数据
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示组件容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{any=}scope       : 监听函数执行的上下文对象，默认是组件对象
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fListen(oEvent){
		var me=this,
			sType=oEvent.type,
			aListeners=me._listeners,
			oEl=oEvent.el,
			sMethod=oEvent.method||"bind",
			sSel=oEvent.selector,
			oData=oEvent.data,
			fFunc=oEvent.delegation=function(){
				if(me.isSuspend!=true){
					return oEvent.handler.apply(oEvent.scope||me,arguments);
				}
			};
		//移动浏览器由于click可能会有延迟，这里转换为touchend事件
		if($H.Browser.mobile()){
			if(sType=="click"){
				sType="touchend";
			}
		}
		oEl=oEl?typeof oEl=='string'?me.find(oEl):oEl:me.getEl();
		if(!oEvent.notEl){
			if(sSel){
				if(oData){
					oEl[sMethod](sSel,sType,oData,fFunc);
				}else{
					oEl[sMethod](sSel,sType,fFunc);
				}
			}else{
				if(oData){
					oEl[sMethod](sType,oData,fFunc);
				}else{
					oEl[sMethod](sType,fFunc);
				}
			}
		}
		aListeners.push(oEvent);
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}type      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示组件容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fUnlisten(oEvent){
		var me=this,
			sType=oEvent.type,
			oEl=oEvent.el,
			sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
			sSel=oEvent.selector,
			fDelegation;
		//移动浏览器由于click可能会有延迟，这里转换为touchend事件
		if($H.Browser.mobile()){
			if(sType=="click"){
				sType="touchend";
			}
		}
		oEl=oEl?typeof oEl=='string'?me.find(oEl):oEl:me.getEl();
		for(var i=me._listeners.length-1;i>=0;i--){
			var oListener=me._listeners[i]
			if(oListener.handler==oEvent.handler){
				fDelegation=oListener.delegation;
				me._listeners.splice(i,1);
				break;
			}
		}
		if(!oEvent.notEl){
			if(sSel){
				oEl[sMethod](sSel,sType,fDelegation);
			}else{
				oEl[sMethod](sType,fDelegation);
			}
		}
	}
	/**
	 * 初始化所有事件
	 * @method initListeners
	 * @return {boolean=}如果已经初始化了，则直接返回false
	 */
	function fInitListeners(){
		var me=this;
		//已经初始化，直接退回
		if(me.listened){
			return false;
		}
		me.listened=true;
		var aListeners=me._listeners;
		me._listeners=[];
		for(var i=aListeners.length-1;i>=0;i--){
			me.listen(aListeners[i]);
		}
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var me=this;
		var aListeners=me._listeners;
		for(var i=aListeners.length-1;i>=0;i--){
			me.unlisten(aListeners[i]);
		}
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 * @return {boolean=}如果已经挂起了，则直接返回false
	 */
	function fSuspendListeners(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return false;
		}
		me.isSuspend=true;
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 * @return {boolean=}如果已经恢复了，则直接返回false
	 */
	function fResumeListeners(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return false;
		}
		me.isSuspend=false;
	}
	/**
	 * 渲染
	 * @method render
	 */
	function fRender(){
		var me=this;
		me.fire('beforeRender');
		me.renderTo[me.renderBy](me.getHtml());
	}
	/**
	 * 渲染后续工作
	 * @method afterRender
	 * @return {boolean=} 仅当已经完成过渲染时返回false
	 */
	function fAfterRender(){
		var me=this;
		if(me.rendered){
			return false;
		}
		//缓存容器
		me._container=$("#"+me.getId());
		me.rendered=true;
		//初始化样式
		me.initStyle();
		//初始化事件
		if(me.notListen!=true){
			me.initListeners();
		}
		if(me.disabled){
			me.disable();
		}
		me.fire('afterRender');
		//显示
		if(!me.hidden){
			me.show();
		}
		delete me.html;
	}
	/**
	 * 隐藏
	 * @method hide
	 * @return {boolean=} 仅当已经隐藏时返回false
	 */
	function fHide(){
		var me=this;
		//已经隐藏，直接退回
		if(!me.showed){
			return false;
		}
		me.showed=false;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"hidden"})
		}else{
			oEl.hide();
		}
		me.fire('hide');
	}
	/**
	 * 显示
	 * @method show
	 * @param {boolean=}bNotDelay 仅当为true时强制不延迟显示
	 * @param {boolean=}bParentCall true表示是父组件通过callChild调用
	 * @return {boolean=} 仅当不是正常成功显示时返回false
	 */
	function fShow(bNotDelay,bParentCall){
		var me=this;
		//已经显示，直接退回
		if(me.showed){
			return false;
		}
		me.fire('beforeShow');
		me.showed=true;
		var oEl=me.getEl();
		if(me.displayMode=='visibility'){
			oEl.css({visibility:"visible"})
		}else{
			oEl.show();
		}
		me.afterShow();
	}
	/**
	 * 显示后工作
	 * @method afterShow
	 */
	function fAfterShow(){
		var me=this;
		me.fire('afterShow');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var me=this;
		me.resumeListeners();
		me.getEl().removeClass("hui-disable").find('input,textarea,select').removeAttr('disabled');
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var me=this;
		me.suspendListeners();
		me.getEl().addClass("hui-disable").find('input,textarea,select').attr('disabled','disabled');
	}
	/**
	 * 销毁
	 * @method destroy
	 * @return {boolean=}如果已经销毁了，则直接返回false
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return false;
		}
		me.fire('destroy');
		me.clearListeners();
		me.getEl().remove();
		me.destroyed=true;
	}
	
	return AbstractView;
	
});