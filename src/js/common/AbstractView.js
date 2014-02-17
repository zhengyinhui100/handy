/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */
//"handy.common.AbstractView"
$Define('cm.AbstractView',function(){
	
	var AbstractView=$HO.createClass();
	
	$HO.extend(AbstractView.prototype,{
//      listened            : false,             //是否已初始化事件
		
		fire                : fFire,             //触发组件自定义事件
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners   //恢复事件
	});
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
			oEl=oEvent.el||me.getEl(),
			sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
			sSel=oEvent.selector,
			fDelegation;
		//移动浏览器由于click可能会有延迟，这里转换为touchend事件
		if($H.Browser.mobile()){
			if(sType=="click"){
				sType="touchend";
			}
		}
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
	 */
	function fInitListeners(){
		var me=this;
		//已经初始化，直接退回
		if(me.listened){
			return;
		}
		me.listened=true;
		var aListeners=me._listeners;
		me._listeners=[];
		for(var i=aListeners.length-1;i>=0;i--){
			me.listen(aListeners[i]);
		}
		me.callChild();
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
		me.callChild();
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 */
	function fSuspendListeners(){
		var me=this;
		//已经挂起，直接退回
		if(me.isSuspend){
			return;
		}
		me.isSuspend=true;
		me.callChild();
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 */
	function fResumeListeners(){
		var me=this;
		//已经恢复，直接退回
		if(!me.isSuspend){
			return;
		}
		me.isSuspend=false;
		me.callChild();
	}
	
	return AbstractView;
	
});