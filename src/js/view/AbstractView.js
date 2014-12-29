/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-05-17
 */
 //"handy.view.AbstractView"
define('V.AbstractView',
[
'V.ViewManager',
'CM.AbstractEvents'
],
function(ViewManager,AbstractEvents){
	
	var AbstractView=AbstractEvents.derive({
		xtype               : 'View',            //类型
		//配置
//		cid                 : '',                //客户id，是id去除视图前缀后的部分，在视图内唯一，方便使用
//		renderTo            : null,              //渲染节点
		renderBy            : 'append',          //默认渲染方式
		autoRender          : true,              //是否默认就进行渲染
//		manager             : null,              //视图管理对象
		listeners           : [],                //事件配置列表，初始参数可以是对象也可以是对象数组
		//属性
//		_config             : null,              //配置模型对象
//		_id                 : null,              //id
//		inited              : false,             //是否已经初始化
//		initParam           : null,              //保存初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//		rendered            : false,             //是否已渲染
//      listened            : false,             //是否已初始化事件
//		_listeners          : [],                //实例事件池
		
		_parseListenEvents  : _fParseListenEvents,  //处理对象类型或者空格相隔的多事件
				
		initialize          : fInitialize,       //初始化
		init                : $H.noop,           //初始化，doConfig后调用，一般留给具体项目使用，方便开发
		doConfig            : fDoConfig,         //初始化配置
		getId               : fGetId,            //获取id
		getCid              : fGetCid,           //获取cid
		getEl               : fGetEl,            //获取容器节点
		getHtml             : fGetHtml,          //获取html
		render              : fRender,           //渲染
		findEl              : fFindEl,           //查找视图内节点
		parseItems          : $H.noop,           //分析子视图
		callChild           : $H.noop,           //调用子视图方法
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 处理对象类型或者空格相隔的多事件
	 * @param {string}sMethod 调用的方法名
	 * @param {Object}oEvent 参数同this.listen
	 * @return {boolean} true表示已成功处理事件，false表示未处理
	 */
	function _fParseListenEvents(sMethod,oEvent){
		var me=this;
		var name=oEvent.name;
		return me._parseEvents(name,function(aParams){
			var oEvt=$H.extend({},oEvent);
			oEvt.name=aParams[0];
			if(aParams.length==2){
				oEvt.handler=aParams[1];
			}
			me[sMethod].call(me,oEvt);
		});
	}
	
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		oParams=oParams||{};
		me.callSuper();
		me._listeners=[];
		me.listeners=$H.clone(me.listeners);
		//注册视图管理
		me.manager=me.constructor.manager||$H.getSingleton(ViewManager);
		//注册视图，各继承类自行实现
		me.manager.register(me,oParams);
		//初始化配置
		me.doConfig(oParams);
		//初始化，一般留给具体项目实现，方便开发
		me.init(oParams);
		//分析子视图
		me.parseItems();
		//渲染
		if(me.autoRender!=false){
			me.render();
		}
		me.inited=true;
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oSettings 初始化参数
	 */
	function fDoConfig(oSettings){
		var me=this;
		//复制保存初始参数
		me.initParam=oSettings;
		var oParams=oSettings||{};
		
		$H.extend(me,oParams);
		var renderTo;
		if(renderTo=oParams.renderTo){
			me.renderTo=$(renderTo);
		}else{
			me.renderTo=$(document.body);
		}
	}
	/**
	 * 获取id
	 * @method getId
	 * @return {string}返回id
	 */
	function fGetId(){
		return this._id;
	}
	/**
	 * 获取cid
	 * @method getCid
	 * @return {string}返回id
	 */
	function fGetCid(){
		return this.cid;
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
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		return this.html;
	}
	/**
	 * 渲染
	 * @method render
	 * @return {boolean=} 仅当没有成功渲染时返回false
	 */
	function fRender(){
		var me=this;
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
		//缓存容器
		me._container=$("#"+me.getId());
		me.initListeners();
	}
	/**
	 * 查找视图内节点
	 * @param {string}sSel jQuery选择器
	 * @return {jQuery} 返回结果
	 */
	function fFindEl(sSel){
		return this.getEl().find(sSel);
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function(Object[,fireParam..])}handler : 监听函数，第一个参数为事件对象oListener，其后的参数为fire时传入的参数
	 * 			{any=}data        : 数据
	 * 			{jQuery|Function(this:this)=}el       : 绑定事件的节点，不传表示容器节点，传入函数(this是本视图对象)则使用函数返回值
	 * 			{CM.AbstractEvents|Function=}target : 监听对象(listenTo方法)，继承自AbstractEvents的实例对象，传入函数(this是本视图对象)则使用函数返回值
	 * 			{boolean=}custom  : 为true时是自定义事件
	 * 			{number=}times    : 执行次数
	 * 			{boolean=}condition : 条件，不传默认执行监听
	 * 			{string=}selector : 选择器
	 * 			{any=}context     : 监听函数执行的上下文对象，默认是对象
	 * 			{string=}method   : 绑定方式，默认为"bind"，可以是"delegate","on"等jquery提供的事件方法
	 * }
	 */
	function fListen(oEvent){
		var me=this;
		if(me._parseListenEvents('listen',oEvent)){
			return;
		}
		if(oEvent.hasOwnProperty('condition')&&!oEvent.condition){
			return;
		}
		var sName=oEvent.name,
			context=oEvent.context,
			nTimes=oEvent.times,
			oTarget=oEvent.target,
			bIsCustom=oEvent.custom||oTarget||$H.contains(me._customEvents,sName),
			fHandler=oEvent.handler;
		if($H.isFunc(oTarget)){
			oTarget=oTarget.call(me);
		}
		//自定义事件
		if(bIsCustom){
			var aArgs=$H.removeUndefined([oTarget,sName,fHandler,context,nTimes]);
			me[oTarget?'listenTo':'on'].apply(me,aArgs);
		}else{
			//没有初始化事件，直接放入队列中
			if(!me.listened){
				me.listeners.push(oEvent);
				return;
			}
			//element事件
			var aListeners=me._listeners,
				oEl=oEvent.el,
				sMethod=oEvent.method||"bind",
				sSel=oEvent.selector,
				oData=oEvent.data,
				fFunc=oEvent.delegation=me._delegateHandler(fHandler,context);
			if($H.isFunc(oEl)){
				oEl=oEl.call(me);
			}
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			//TODO 暂时在这里统一转换移动事件
			if($H.mobile()&&oEl.tap){
				var oMap={
					'click'    : 'tap',
					'dblclick' : 'doubleTap'
				}
				sName=oMap[sName]||sName;
			}
			if(sSel){
				if(oData){
					oEl[sMethod](sSel,sName,oData,fFunc);
				}else{
					oEl[sMethod](sSel,sName,fFunc);
				}
			}else{
				if(oData){
					oEl[sMethod](sName,oData,fFunc);
				}else{
					oEl[sMethod](sName,fFunc);
				}
			}
			aListeners.push(oEvent);
		}
	}
	/**
	 * 解除事件
	 * @method unlisten
	 * @param {object}事件对象{
	 * 			{string}name      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
	 * 			{boolean=}custom  : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fUnlisten(oEvent){
		var me=this;
		if(me._parseListenEvents('unlisten',oEvent)){
			return;
		}
		var sName=oEvent.name,
			fHandler=oEvent.handler;
		if(oEvent.custom){
			me.off(sName,fHandler);
		}else{
			var oEl=oEvent.el,
				sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
				sSel=oEvent.selector,
				fDelegation;
			oEl=oEl?typeof oEl=='string'?me.findEl(oEl):oEl:me.getEl();
			for(var i=me._listeners.length-1;i>=0;i--){
				var oListener=me._listeners[i]
				if(oListener.handler==fHandler){
					fDelegation=oListener.delegation;
					me._listeners.splice(i,1);
					break;
				}
			}
			if(sSel){
				oEl[sMethod](sSel,sName,fDelegation);
			}else{
				oEl[sMethod](sName,fDelegation);
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
		var aListeners=me.listeners;
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
		me.off('all');
		me.unlistenTo('all');
		me.callChild();
	}
	/**
	 * 销毁
	 * @method destroy
	 * @return {boolean=} 成功返回true，失败返回false，如果之前已经销毁返回空
	 */
	function fDestroy(){
		var me=this;
		if(me.destroyed){
			return;
		}
		me.clearListeners();
		me.unlistenTo('all');
		me.getEl().remove();
		me.destroyed=true;
		
		//注销组件
		me.manager.unregister(me);
		delete me._container;
		delete me.renderTo;
		delete me.html;
		return true;
	}
	
	return AbstractView;
	
});