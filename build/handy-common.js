/* Handy v1.0.0-dev | 2014-03-14 | zhengyinhui100@gmail.com */
/**
 * 抽象视图类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-02-17
 */
//"handy.common.AbstractView"
$Define('cm.AbstractView',function(){
	
	var AbstractView=$HO.createClass();
	var _oTagReg=/^(<[a-zA-Z]+)/;
	var _oHasClsReg=/^[^>]+class=/;
	var _oClsReg=/(class=")/;
	
	$HO.extend(AbstractView.prototype,{
		
		xtype               : 'AbstractView',    //类型
		
		//配置
//		renderTo            : null,              //渲染节点
//		hidden              : false,             //是否隐藏
//		hideMode            : 'display',         //隐藏方式,'display'|'visibility'
//		disabled            : false,             //是否禁用
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		extCls              : '',                //附加class
//		notListen           : false,             //不自动初始化监听器
		
		
		//属性
//		params              : null,              //初始化时传入的参数
//		_container          : null,              //试图对象容器节点
//      listened            : false,             //是否已初始化事件
//		isSuspend           : false,             //是否挂起事件
//		destroyed           : false,             //是否已销毁
//		_id                 : null,              //id
//		tmpl                : [],                //模板，首次初始化前为数组，初始化后为字符串，ps:模板容器节点上不能带有id属性
//		rendered            : false,             //是否已渲染
//      showed              : false,             //是否已显示
		_customEvents       : [                  //自定义事件,可以通过参数属性的方式直接进行添加
			'beforeRender','render','afterRender',
			'beforeShow','afterShow','hide',
			'destroy'
		],  
		_defaultEvents      : [                  //默认事件，可以通过参数属性的方式直接进行添加
			'mousedown','mouseup','mouseover','mousemove','mouseenter','mouseleave',
			'dragstart','drag','dragenter','dragleave','dragover','drop','dragend',
			'touchstart','touchmove','touchend','touchcancel',
			'keydown','keyup','keypress',
			'click','dblclick',
			'focus','focusin','focusout',
			'contextmenu','change','submit'
		],
//      listeners           : [],                //类事件配置
//		_listeners          : {},                //实例事件池  
		
		initialize          : fInitialize,       //初始化
		doConfig            : fDoConfig,         //初始化配置
		getEl               : fGetEl,            //获取容器节点
		getId               : fGetId,            //获取id
		initHtml            : fInitHtml,         //初始化html
		getHtml             : fGetHtml,          //获取html
		initStyle           : fInitStyle,        //初始化样式
		
		beforeRender        : fBeforeRender,     //渲染前工作
		render              : fRender,           //渲染
		afterRender         : fAfterRender,      //渲染后续工作
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
		afterShow           : fAfterShow,        //显示后工作
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
		
		fire                : fFire,             //触发自定义事件
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		
		destroy             : fDestroy           //销毁
	});
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oParams 初始化参数
	 */
	function fInitialize(oParams){
		var me=this;
		//初始化配置
		me.doConfig(oParams);
		me.beforeRender();
		if(me.autoRender!=false){
			me.render();
			//渲染后续工作
			me.afterRender();
		}
		//注册视图，各继承类自行实现
		//Manager.register(me);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {Object}oParams 初始化参数
	 */
	function fDoConfig(oParams){
		var me=this;
		//保存参数
		me.params=oParams;
		//复制参数
		me.settings=$HO.clone(oParams);
		if(oParams.renderTo){
			me.renderTo=$(oParams.renderTo);
		}else{
			me.renderTo=$(document.body);
		}
		var aListeners=me.listeners||[];
		//添加参数中的事件
		if(oParams.listeners){
			aListeners=aListeners.concat(oParams.listeners);
		}
		me._listeners=aListeners;
		
		//只覆盖基本类型的属性
		$HO.extend(me,oParams,{notCover:function(sProp){
			var value=me[sProp];
			//默认事件，可通过参数属性直接添加
			var bIsCustEvt=$HO.contains(me._customEvents,sProp);
			var bIsDefEvt=$HO.contains(me._defaultEvents,sProp);
			if(bIsCustEvt||bIsDefEvt){
				me._listeners.push({
					type:sProp,
					notEl:bIsCustEvt,
					handler:oParams[sProp]
				});
			}
			if((value!=null&&typeof value=='object')||$HO.isFunction(value)){
				return true;
			}
		}});
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
	 * 获取id
	 * @method getId
	 * @return {string}返回id
	 */
	function fGetId(){
		return this._id;
	}
	/**
	 * 初始化html
	 * @method initHtml
	 * @return {string} 返回html
	 */
	function fInitHtml(){
		var me=this;
		//将数组方式的模板转为字符串
		if(typeof me.tmpl!='string'){
			me.tmpl=me.constructor.prototype.tmpl=me.tmpl.join('');
		}
		//由模板生成html
		var sHtml=$H.Template.tmpl({id:me.xtype,tmpl:me.tmpl},me);
		return sHtml;
	}
	/**
	 * 获取html
	 * @method getHtml
	 */
	function fGetHtml(){
		var me=this;
		var sId=me.getId();
		//添加隐藏style，调用show方法时才显示
		var sStyle;
 		if(me.displayMode=='visibility'){
			sStyle='visibility:hidden;';
 		}else{
			sStyle='display:none;';
 		}
 		var sHtml=me.initHtml();
		var bHasCls=_oHasClsReg.test(sHtml);
		var sExtCls=me.extCls+" ";
		if(bHasCls){
			//添加class
			sHtml=sHtml.replace(_oClsReg,'$1'+sExtCls);
		}
		//添加id和style
		sHtml=sHtml.replace(_oTagReg,'$1 id="'+sId+'" style="'+sStyle+'"'+(bHasCls?'':' class="'+sExtCls+'"'));
		return sHtml;
	}
	/**
	 * 初始化样式
	 * @method initStyle
	 */
	function fInitStyle(){
		var me=this;
		var oEl=this.getEl();
		//添加style
		var oStyle=me.style||{};
		if(me.width!=undefined){
			oStyle.width=me.width;
		}
		if(me.height!=undefined){
			oStyle.height=me.height;
		}
		oEl.css(oStyle);
	}
	/**
	 * 渲染前工作
	 * @method beforeRender
	 */
	function fBeforeRender(){
		var me=this;
		me.fire('beforeRender');
	}
	/**
	 * 渲染
	 * @method render
	 */
	function fRender(){
		var me=this;
		me.fire('render');
		var sHtml=me.getHtml();
		me.renderTo[me.renderBy](sHtml);
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
	 * @return {boolean=} 仅当不是正常成功显示时返回false
	 */
	function fShow(){
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
	 * 触发自定义事件
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
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{any=}scope       : 监听函数执行的上下文对象，默认是对象
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
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示容器节点
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
	
});/**
 * 组件管理类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-01-10
 */
//"handy.component.ComponentManager"
$Define("cm.AbstractManager", function() {

	var AbstractManager = $HO.createClass();
	
	$HO.extend(AbstractManager.prototype, {
	    _types        : {},               //存储类
	    _all          : {},               //存储所有实例
		type          : 'manager',        //被管理对象的类型，也用于生成标记被管理对象的class
		registerType  : fRegisterType,    //注册组件类
		getClass      : fGetClass,        //根据xtype获取组件类
		register      : fRegister,        //注册组件
		unregister    : fUnRegister,      //注销组件
		eachInEl      : fEachInEl,        //循环指定节点里的被管理对象
		generateId    : fGenerateId,      //生成组件的id
		get           : fGet              //根据id或cid查找组件
	});
	
	/**
	 * 注册组件类型
	 * @method registerType
	 * @param {string}sXType 组件类型
	 * @param {object}oClass 组件类
	 */
	function fRegisterType(sXtype,oClass){
		this._types[sXtype]=oClass;
		oClass.prototype.xtype=sXtype;
		//快捷别名
		$C[sXtype]=oClass;
	}
	/**
	 * 根据xtype获取组件类
	 * @method getClass
	 * @param {string}sXType 组件类型
	 * @return {object} 返回对应的组件类
	 */
	function fGetClass(sXtype){
		return this._types[sXtype];
	}
	/**
	 * 注册组件
	 * @method register
	 * @param {object}oComponent 组件对象
	 */
	function fRegister(oComponent){
		this._all[oComponent.getId()]=oComponent;
	}
	/**
	 * 注销组件
	 * @method unRegister
	 * @param {object}oComponent 组件对象
	 */
	function fUnRegister(oComponent){
		delete this._all[oComponent.getId()];
	}
	/**
	 * 遍历指定节点里的所有组件
	 * @method eachInEl
	 * @param {jQuery}oEl 指定的节点
	 * @param {function(Component)}fCall
	 */
	function fEachInEl(oEl,fCall){
		var me=this;
		//获取组件el
		var oItemEl=oEl.find(".js-"+me.type);
		oItemEl.each(function(i,oEl){
			oEl=$(oEl);
			var sId=oEl.attr('id');
			var oItem=me.get(sId);
			//如果未被销毁，执行回调
			if(oItem){
				fCall(oItem);
			}
		})
	}
	/**
	 * 生成组件的id
	 * @method generateId
	 * @param {string=}sCid cid
	 * @param {boolean=}bNotChk 仅当为true时不检查id是否重复
	 */
	function fGenerateId(sCid,bNotChk){
		var me=this;
		var sId=$H.expando+"_"+me.type+"_"+(sCid||$H.Util.getUuid());
		if(bNotChk!=true&&me._all[sId]){
			$D.error('id重复:'+sId);
		}else{
			return sId;
		}
	}
	/**
	 * 根据id或cid查找组件
	 * @method get
	 * @param {string}sId 组件id或者cid
	 */
	function fGet(sId){
		var me=this;
		var all=me._all;
		return all[sId]||all[me.generateId(sId,true)];
	}

	return AbstractManager;
	
});/**
 * 模型类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Model"
$Define('c.Model',
function(){
	
	var Model=$HO.createClass();
	
	$HO.extend(Model.prototype,{
//		_changing             : false,               //是否正在改变
		_pending              : false,               //
//		_previousAttributes   : {},                  //较早的值
//		cid                   : 0,                   //客户id
//		attributes            : {},                  //属性对象
//    	changed               : {},                  //改变了的值
//	    validationError       : {},                  //校验错误的值
        idAttribute           : 'id',                //id默认属性名
        
   		_validate             : _fValidate,          //执行校验，如果通过校验返回true，否则，触发"invalid"事件
		
		initialize            : fInitialize,         //初始化
		toJson                : fToJSON,             //返回对象数据副本
   		get                   : fGet,                //获取指定属性值
   		escape                : fEscape,             //获取html编码过的属性值 
   		has                   : fHas,                //判断是否含有参数属性
   		set                   : fSet,                //设置值
   		unset                 : fUnset,              //移除指定属性
   		clear                 : fClear,              //清除所有属性
   		hasChanged            : fHasChanged,         //判断自上次change事件后有没有修改，可以指定属性
   		changedAttrbutes      : fChangedAttributes,  //返回改变过的属性，可以指定需要判断的属性
   		previous              : fPrevious,           //返回修改前的值，如果没有修改过，则返回null
   		fetch                 : fFetch,              //获取模型数据
   		save                  : fSave,               //保存模型
   		destroy               : fDestroy,            //销毁/删除模型
   		url                   : fUrl,                //获取模型url
   		parse                 : fParse,              //分析处理回调数据，默认直接返回response
   		clone                 : fClone,              //克隆模型
   		isNew                 : fIsNew,              //判断是否是新模型(没有提交保存，并且缺少id属性)
   		isValid               : fIsValid            //校验当前是否是合法的状态
	});
	
	var wrapError;
	
	/**
	 * 执行校验，如果通过校验返回true，否则，触发"invalid"事件
	 * @param {Object=}oAttrs 参数属性，传入表示只校验参数属性
	 * @param {Object=}oOptions 选项
	 * @return {boolean} true表示通过校验
	 */
    function _fValidate(oAttrs, oOptions) {
    	var me=this;
        if (!oOptions.validate || !me.validate){
        	return true;
        }
        oAttrs = $HO.extend({}, me.attributes, oAttrs);
        var error = me.validationError = me.validate(oAttrs, oOptions) || null;
        if (!error){
        	return true;
        }
        me.trigger('invalid', me, error, $HO.extend(oOptions, {validationError: error}));
        return false;
    }
	/**
	 * 初始化
	 * @method initialize
	 * @param {Object}oAttributes 初始化的对象
	 * @param {Object}oOptions 选项{
	 * 		{common.Collection}collection 集合对象
	 * 		{boolean}parse 是否解析
	 * }
	 */
	function fInitialize(oAttributes, oOptions) {
		var me=this;
		var oAttrs = oAttributes || {};
		oOptions || (oOptions = {});
		me.cid = $H.Util.getUuid();
		me.attributes = {};
		if (oOptions.collection){
			me.collection = oOptions.collection;
		}
		if (oOptions.parse){
			oAttrs = me.parse(oAttrs, oOptions) || {};
		}
		oAttrs = $HO.extend(oAttrs, $H.Util.result(me, 'defaults'),{notCover:true});
		me.set(oAttrs, oOptions);
		me.changed = {};
	}
	/**
	 * 返回对象数据副本
	 * @method toJSON
	 * @return {Object} 返回对象数据副本
	 */
    function fToJSON() {
        return $HO.clone(this.attributes);
    }
	/**
	 * 
	 */
    // Proxy `Backbone.sync` by default -- but override me if you need
    // custom syncing semantics for *me* particular model.
//    sync: function() {
//        return Backbone.sync.apply(me, arguments);
//    },
    /**
     * 获取指定属性值
     * @method get
     * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性
     */
    function fGet(sAttr) {
        return this.attributes[sAttr];
    }
	/**
	 * 获取html编码过的属性值
	 * @method escape
	 * @param {string}sAttr 参数属性名
     * @return {*} 返回对应属性编码后的值
	 */
    function fEscape(sAttr) {
        return $H.String.escapeHTML(this.get(sAttr));
    }
	/**
	 * 判断是否含有参数属性
	 * @method has
	 * @param {string}sAttr 参数属性
	 * @return {boolean} 指定属性不为空则返回true
	 */
    function fHas(sAttr) {
    	var value=this.get(sAttr);
    	return  value!= null&&value!=undefined;
    }
	/**
	 * 设置值，并触发change事件(如果发生了变化)
	 * @method set
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 */
    function fSet(sKey, val, oOptions) {
    	var me=this;
    	var oAttrs;
	    if (typeof sKey === 'object') {
	    	oAttrs = sKey;
	    	oOptions = val;
	    } else {
	    	(oAttrs = {})[sKey] = val;
	    }
	    oOptions || (oOptions = {});
	    //先执行校验
	    if (!me._validate(oAttrs, oOptions)){
	    	return false;
	    }
	
	    var bUnset= oOptions.unset;
	    var bSilent= oOptions.silent;
	    var aChanges= [];
	    var bChanging= me._changing;
	    me._changing  = true;
	
	    //开始改变前，先存储初始值
	    if (!bChanging) {
	        me._previousAttributes = $H.Object.clone(me.attributes);
	    	me.changed = {};
	    }
	    var oCurrent = me.attributes, 
	    	oPrev = me._previousAttributes;
	
	    //TODO Check for aChanges of `id`.
	    if (me.idAttribute in oAttrs){
	  	    me.id = oAttrs[me.idAttribute];
	    }
	
	    //循环进行设置、更新、删除
	    for (var sAttr in oAttrs) {
	   	    val = oAttrs[sAttr];
	   	    //与当前值不相等，放入改变列表中
	    	if (!$HO.equals(oCurrent[sAttr], val)){
	    		aChanges.push(sAttr);
	    	}
	    	//与初始值不相等，放入已经改变的hash对象中
	    	if (!$HO.equals(oPrev[sAttr], val)) {
	            me.changed[sAttr] = val;
	    	} else {
	    		//跟初始值相等，即没有变化
	        	delete me.changed[sAttr];
	    	}
	    	//如果取消设置，删除对应属性
	    	bUnset ? delete oCurrent[sAttr] : oCurrent[sAttr] = val;
	    }
	
	    //触发对应属性change事件
	    if (!bSilent) {
	        if (aChanges.length){
	        	me._pending = oOptions;
	        }
	        for (var i = 0, l = aChanges.length; i < l; i++) {
	      	    me.trigger('change:' + aChanges[i], me, oCurrent[aChanges[i]], oOptions);
	        }
	    }
	
	  // You might be wondering why there's a `while` loop here. Changes can
	  // be recursively nested within `"change"` events.
	    if (bChanging){
	    	return me;
	    }
	    //触发模型对象change事件
	    if (!bSilent) {
	        while (me._pending) {
	       		oOptions = me._pending;
	            me._pending = false;
	            me.trigger('change', me, oOptions);
	        }
	    }
	    me._pending = false;
	    me._changing = false;
	    return me;
    }
    /**
     * 移除指定属性
     * @method unset
     * @param {string}sAttr 参数属性
     * @param {Object=}oOptions 备选参数
     * @return {Model}返回模型对象本身
     */
    function fUnset(sAttr, oOptions) {
    	oOptions=oOptions||{};
    	oOptions.unset=true;
        return this.set(sAttr, void 0, oOptions);
    }
    /**
     * 清除所有属性
     * @method clear
     * @param {Object=}oOptions 
     */
    function fClear(oOptions) {
    	var me=this;
        var oAttrs = {};
        for (var sKey in me.attributes) {
            oAttrs[sKey] = void 0;
        }
        oOptions=oOptions||{};
    	oOptions.unset=true;
        return me.set(oAttrs,oOptions);
    }
	/**
	 * 判断自上次change事件后有没有修改，可以指定属性
	 * @method hasChanged
	 * @param {string=}sAttr 参数属性，为空表示判断对象有没有修改
	 * @retur {boolean} true表示有修改
	 */
    function fHasChanged(sAttr) {
    	var oChange=this.changed;
        if (sAttr == null){
        	return !$HO.isEmpty(oChange);
        }
        return $HO.contains(oChange, sAttr);
    }
	/**
	 * 返回改变过的属性，可以指定需要判断的属性
	 * @method hasChanged
	 * @param {Object=}oDiff 参数属性，表示只判断传入的属性
	 * @retur {boolean} 如果有改变，返回改变的属性，否则，返回false
	 */
    function fChangedAttributes(oDiff) {
    	var me=this;
        if (!oDiff){
            return me.hasChanged() ? $HO.clone(me.changed) : false;
        }
        var val, changed = false;
        var oOld = me._changing ? me._previousAttributes : me.attributes;
        for (var sAttr in oDiff) {
            if (!$HO.equals(oOld[sAttr], (val = oDiff[sAttr]))){
	            (changed || (changed = {}))[sAttr] = val;
            }
        }
        return changed;
    }
	/**
	 * 返回修改前的值，如果没有修改过，则返回null
	 * @method previous
	 * @param {string}sAttr 指定属性
	 * @return {*} 返回修改前的值，如果没有修改过，则返回null
	 */
    function fPrevious(sAttr) {
    	var me=this;
        if (sAttr == null || !me._previousAttributes){
        	return null;
        }
        return me._previousAttributes[sAttr];
    }
	/**
	 * 返回所有修改前的值
	 * @method previousAttributes
	 * @return {Object} 返回所有修改前的值
	 */
    function fPreviousAttributes() {
        return $HO.clone(this._previousAttributes);
    }
	/**
	 * 获取模型数据
	 * @param {Object=}oOptions 备选参数
	 */
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        if (oOptions.parse === void 0) {
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        oOptions.success = function(resp) {
        	if (!me.set(me.parse(resp, oOptions), oOptions)){
        		return false;
        	}
        	if (success){
        		success(me, resp, oOptions);
        	}
        	me.trigger('sync', me, resp, oOptions);
        };
        wrapError(me, oOptions);
        return me.sync('read', me, oOptions);
    }
	/**
	 * 保存模型
	 * @param {String}sKey 属性
	 * @param {*}val 值
	 * @param {Object}oOptions 选项{
	 * 		{boolean=}unset 是否取消设置
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 */
    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    function fSave(sKey, val, oOptions) {
    	var me=this;
        var oAttrs, method, xhr, attributes = me.attributes;
      // Handle both `"sKey", value` and `{sKey: value}` -style arguments.
        if (sKey == null || typeof sKey === 'object') {
        	oAttrs = sKey;
        	oOptions = val;
        } else {
        	(oAttrs = {})[sKey] = val;
        }

        oOptions = $HO.extend({validate: true}, oOptions);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
        if (oAttrs && !oOptions.wait) {
       	    if (!me.set(oAttrs, oOptions)) return false;
        } else {
        	if (!me._validate(oAttrs, oOptions)) return false;
        }

      // Set temporary attributes if `{wait: true}`.
        if (oAttrs && oOptions.wait) {
            me.attributes = $HO.extend({}, attributes, oAttrs);
        }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
        if (oOptions.parse === void 0) oOptions.parse = true;
        var model = me;
        var success = oOptions.success;
        oOptions.success = function(resp) {
	        // Ensure attributes are restored during synchronous saves.
	        model.attributes = attributes;
	        var serverAttrs = model.parse(resp, oOptions);
	        if (oOptions.wait) serverAttrs = $HO.extend(oAttrs || {}, serverAttrs);
	        if ($HO.isObject(serverAttrs) && !model.set(serverAttrs, oOptions)) {
	          return false;
	        }
	        if (success) success(model, resp, oOptions);
	        model.trigger('sync', model, resp, oOptions);
	      };
      	wrapError(me, oOptions);

	    method = me.isNew() ? 'create' : (oOptions.patch ? 'patch' : 'update');
	    if (method === 'patch') oOptions.oAttrs = oAttrs;
	    xhr = me.sync(method, me, oOptions);
	
	      // Restore attributes.
	    if (oAttrs && oOptions.wait){
	    	me.attributes = attributes;
	    }
	    return xhr;
    }
	/**
	 * 销毁/删除模型
	 * @param {Object=}oOptions 备选参数{
	 * 		{boolean=}wait: true表示等提交成功后才修改属性
	 * }
	 */
    function fDestroy(oOptions) {
    	var me=this;
      oOptions = oOptions ? $HO.clone(oOptions) : {};
      var model = me;
      var success = oOptions.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, oOptions);
      };

      oOptions.success = function(resp) {
        if (oOptions.wait || model.isNew()) destroy();
        if (success) success(model, resp, oOptions);
        if (!model.isNew()) model.trigger('sync', model, resp, oOptions);
      };

      if (me.isNew()) {
        oOptions.success();
        return false;
      }
      wrapError(me, oOptions);

      var xhr = me.sync('delete', me, oOptions);
      if (!oOptions.wait) destroy();
      return xhr;
    }
	/**
	 * 获取模型url
	 * @return {string} 返回模型url
	 */
    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override me to change the endpoint
    // that will be called.
    function fUrl() {
    	var me=this;
        var sUrl =
        $H.Util.result(me, 'urlRoot') ||
        $H.Util.result(me.collection, 'url');
        if(!sUrl){
        	var sMsg='必须设置一个url属性或者函数';
        	$D.error(sMsg,new Error(sMsg));
        }
        if (me.isNew()){
        	return sUrl;
        }
        return sUrl.replace(/([^\/])$/, '$1/') + encodeURIComponent(me.id);
    }
    /**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
        return resp;
    }
    /**
     * 克隆模型
     * @return {Model} 返回克隆副本
     */
    function fClone() {
    	var me=this;
        return new me.constructor(me.attributes);
    }
	/**
	 * 判断是否是新模型(没有提交保存，并且缺少id属性)
	 * @return {boolean} true表示是新模型
	 */
    function fIsNew() {
    	var me=this;
        return !me.has(me.idAttribute);
    }
	/**
	 * 校验当前是否是合法的状态
	 * @return {boolean} true表示合法
	 */
    function fIsValid(oOptions) {
        return this._validate({}, $HO.extend(oOptions || {}, { validate: true }));
    }
	
	return Model;
	
});/**
 * 集合类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2014-03-06
 */
//"handy.common.Collection"
$Define('c.Collection',
'c.Model',
function(Model){
	
	var Collection=$HO.createClass();
	
	$HO.extend(Collection.prototype,{
		
//		model                  : Model,               //子对象模型类
//		models                 : [],                  //模型列表
//		_byId                  : {},                  //根据id和cid索引
//		length                 : 0,                   //模型集合长度
		
		_reset                 : _fReset,             //重置集合
		_prepareModel          : _fPrepareModel,      //初始化模型
		_addReference          : _fAddReference,      //关联模型和集合
		_removeReference       : _fRemoveReference,   //移除模型和集合关联关系
		_onModelEvent          : _fOnModelEvent,      //模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
		
		initialize             : fInitialize,         //初始化
		toJSON                 : fToJSON,             //返回json格式数据(模型数据的数组)
		add                    : fAdd,                //添加模型
		remove                 : fRemove,             //移除模型
		set                    : fSet,                //设置模型
		reset                  : fReset,              //重置模型，此方法不会触发add、remove等事件，只会触发reset事件
		push                   : fPush,               //添加到集合最后
		pop                    : fPop,                //取出集合最后一个模型
		unshift                : fUnshift,            //添加到集合最前面
		shift                  : fShift,              //取出集合第一个模型
		slice                  : fSlice,              //返回选定的元素的数组，同"Array.slice"
		get                    : fGet,                //通过id或cid获取模型
		at                     : fAt,                 //获取指定位置的模型
		where                  : fWhere,              //返回包含指定 key-value 组合的模型的数组
		findWhere              : fFindWhere,          //返回包含指定 key-value 组合的第一个模型
		sort                   : fSort,               //排序
		pluck                  : fPluck,              //提取集合里指定的属性值
		parse                  : fParse,              //分析处理回调数据，默认直接返回response
		clone                  : fClone               //克隆
		
	});
	
	var wrapError;
	
	//从base.Collection生成方法
	$HO.each([
		'some','every','find','filter','invoke'
	], function(sMethod) {
	    Collection.prototype[sMethod] = function() {
	      var aArgs = Array.prototype.slice.call(arguments);
	      var HC=$H.Collection;
	      aArgs.unshift(this.models);
	      return HC[sMethod].apply(HC, aArgs);
	    };
	});
	
	/**
	 * 重置集合
	 */
    function _fReset() {
    	var me=this;
        me.length = 0;
        me.models = [];
        me._byId  = {};
    }

    /**
     * 初始化模型
     * @param {Object}oAttrs key-value组合
     * @param {Object}oOptions 选项，同Model初始化选项
     * @return {Model|boolean} 返回初始化的模型，如果初始化失败，则返回false
     */
    function _fPrepareModel(oAttrs, oOptions) {
    	var me=this;
        if (oAttrs instanceof Model){
        	return oAttrs;
        }
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        oOptions.collection = me;
        var oModel = new me.model(oAttrs, oOptions);
        if (!oModel.validationError){
        	return oModel;
        }
        me.trigger('invalid', me, oModel.validationError, oOptions);
        return false;
    }
	/**
	 * 关联模型和集合
	 * @param {Model}oModel 模型对象
	 */
    function _fAddReference(oModel) {
    	var me=this;
        me._byId[oModel.cid] = oModel;
        if (oModel.id != null){
        	me._byId[oModel.id] = oModel;
        }
        if (!oModel.collection){
        	oModel.collection = me;
        }
        oModel.on('all', me._onModelEvent, me);
    }
    /**
     * 移除模型和集合关联关系
     * @param {Model}oModel 模型对象
     */
    function _fRemoveReference(oModel) {
    	var me=this;
        if (me === oModel.collection){
        	delete oModel.collection;
        }
        oModel.off('all', me._onModelEvent, me);
    }
	/**
	 * 模型事件函数，当模型有事件发生时触发，主要是跟随模型进行更新和删除
	 * @param {string}sEvent 事件名称
	 * @param {Model}oModel 模型对象
	 * @param {Collection}oCollection
	 * @param {Object}oOptions 同remove方法的选项
	 */
    function _fOnModelEvent(sEvent, oModel, oCollection, oOptions) {
    	var me=this;
        if ((sEvent === 'add' || sEvent === 'remove') && oCollection !== me){
        	return;
        }
        if (sEvent === 'destroy'){
        	me.remove(oModel, oOptions);
        }
        if (oModel && sEvent === 'change:' + oModel.idAttribute) {
            delete me._byId[oModel.previous(oModel.idAttribute)];
            if (oModel.id != null){
            	me._byId[oModel.id] = oModel;
            }
        }
        me.trigger.apply(me, arguments);
    }
	/**
	 * 初始化
	 * @param {Array=}aModels 模型数组
	 * @param {Object=}oOptions 选项{
	 * 		{Model=}model 模型类
	 * 		{function=}comparator 比较函数
	 * }
	 */
	function fInitialize(aModels, oOptions) {
		var me=this;
	    oOptions || (oOptions = {});
	    if (oOptions.model) {
	    	me.model = oOptions.model;
	    }
	    if (oOptions.comparator !== void 0) {
	    	me.comparator = oOptions.comparator;
	    }
	    me._reset();
	    me.initialize.apply(me, arguments);
	    if (aModels){
	    	me.reset(aModels, $HO.extend({silent: true}, oOptions));
	    }
	}
	/**
	 * 返回json格式数据(模型数据的数组)
	 * @param {Object=}oOptions 选项(同set方法)
	 * @return {Array} 模型数据数组
	 */
    function fToJSON(oOptions) {
        return $H.Collection.map(this,function(oModel){
        	return oModel.toJSON(oOptions); 
        });
    }

//    // Proxy `Backbone.sync` by default.
//    sync: function() {
//      return Backbone.sync.apply(me, arguments);
//    },
	/**
	 * 添加模型
	 * @param 同"set"方法
	 * @return {Model}返回被添加的模型，如果是数组，返回第一个元素
	 */
    function fAdd(models, oOptions) {
    	$HO.extend(oOptions,{
    		add:true,
    		remove:false,
    		merge:false
    	});
        return this.set(models,oOptions);
    }
    /**
     * 移除模型
     * @param 同"set"方法
     * @return {Model}返回被移除的模型，如果是数组，返回第一个元素
     */
    function fRemove(models, oOptions) {
    	var me=this;
        var bSingular = !$HO.isArray(models);
        models = bSingular ? [models] : $HO.clone(models);
        oOptions || (oOptions = {});
        var i, l, index, oModel;
        for (i = 0, l = models.length; i < l; i++) {
        	oModel = models[i] = me.get(models[i]);
        	if (!oModel){
        		continue;
        	}
        	delete me._byId[oModel.id];
        	delete me._byId[oModel.cid];
        	index = me.indexOf(oModel);
        	me.models.splice(index, 1);
        	me.length--;
        	if (!oOptions.silent) {
          		oOptions.index = index;
          		oModel.trigger('remove', oModel, me, oOptions);
        	}
        	me._removeReference(oModel, oOptions);
        }
        return bSingular ? models[0] : models;
    }
	/**
	 * 设置模型
	 * @param {Object|Model|Array}models 模型属性对象或模型对象或数组
	 * @param {Object}oOptions 选型{
	 * 		{boolean=}add : 是否是添加
	 * 		{boolean=}merge : 是否是合并
	 * 		{boolean=}remove : 是否删除
	 * 		{boolean=}sort : 是否排序
	 * 		{number=}at : 指定添加位置
	 * 		{boolean=}parse : 是否分析处理数据
	 * }
	 * @return {Model}返回被设置的模型，如果是数组，返回第一个元素
	 */
    function fSet(models, oOptions) {
    	var me=this;
    	oOptions = $H.Util.extend(oOptions, {
    		add: true,
    		remove: true,
    		merge: true
    	});
        if (oOptions.parse){
        	models = me.parse(models, oOptions);
        }
        var bSingular = !$HO.isArray(models);
        var aModels = bSingular ? (models ? [models] : []) : $HO.clone(models);
        var i, l, id, oModel, oAttrs, oExisting, sort;
        var at = oOptions.at;
        var cTargetModel = me.model;
        //是否可排序
        var bSortable = me.comparator && (at == null) && oOptions.sort !== false;
        var sortAttr = typeof me.comparator=="string" ? me.comparator : null;
        var aToAdd = [], aToRemove = [], oModelMap = {};
        //是否添加
        var bAdd = oOptions.add, 
        //是否合并
        bMerge = oOptions.merge,
        //是否移除
        bRemove = oOptions.remove;
        var order = !bSortable && bAdd && bRemove ? [] : false;

        //循环设置模型
        for (i = 0, l = aModels.length; i < l; i++) {
        	oAttrs = aModels[i] || {};
        	if (oAttrs instanceof Model) {
          		id = oModel = oAttrs;
        	} else {
         		id = oAttrs[cTargetModel.prototype.idAttribute || 'id'];
        	}

        	//如果已经存在对应id的模型
        	if (oExisting = me.get(id)) {
        		//移除
            	if (bRemove){
            		oModelMap[oExisting.cid] = true;
            	}
            	//合并
          		if (bMerge) {
           			oAttrs = oAttrs === oModel ? oModel.attributes : oAttrs;
                	if (oOptions.parse){
                		oAttrs = oExisting.parse(oAttrs, oOptions);
                	}
            		oExisting.set(oAttrs, oOptions);
            		//
            		if (bSortable && !sort && oExisting.hasChanged(sortAttr)){
            			sort = true;
            		}
          		}
         		aModels[i] = oExisting;

        	} else if (bAdd) {
         		//添加	
            	oModel = aModels[i] = me._prepareModel(oAttrs, oOptions);
            	if (!oModel){
            		continue;
            	}
            	aToAdd.push(oModel);
            	me._addReference(oModel, oOptions);
        	}

        	oModel = oExisting || oModel;
        	if (order && (oModel.isNew() || !oModelMap[oModel.id])){
        		order.push(oModel);
        	}
        	oModelMap[oModel.id] = true;
        }

        //如果有需要的话，移除相应模型
        if (bRemove) {
        	for (i = 0, l = me.length; i < l; ++i) {
           		if (!oModelMap[(oModel = me.models[i]).cid]){
           			aToRemove.push(oModel);
           		}
        	}
        	if (aToRemove.length){
        		me.remove(aToRemove, oOptions);
        	}
        }

        if (aToAdd.length || (order && order.length)) {
        	if (bSortable){
        		sort = true;
        	}
        	//更新长度
            me.length += aToAdd.length;
            //指定位置上添加
        	if (at != null) {
            	for (i = 0, l = aToAdd.length; i < l; i++) {
            		me.models.splice(at + i, 0, aToAdd[i]);
          		}
       		} else {
          		if (order){
          			me.models.length = 0;
          		}
          		var orderedModels = order || aToAdd;
          		for (i = 0, l = orderedModels.length; i < l; i++) {
            		me.models.push(orderedModels[i]);
          		}
        	}
        }

        //排序
        if (sort){
        	me.sort({silent: true});
        }

        //触发相应事件
        if (!oOptions.silent) {
        	for (i = 0, l = aToAdd.length; i < l; i++) {
            	(oModel = aToAdd[i]).trigger('add', oModel, me, oOptions);
        	}
        	if (sort || (order && order.length)){
        		me.trigger('sort', me, oOptions);
        	}
        }

        //返回被设置的模型，如果是数组，返回第一个元素
        return bSingular ? aModels[0] : aModels;
    }
	/**
	 * 重置模型，此方法不会触发add、remove等事件，只会触发reset事件
	 * @param 同"set"方法
	 * @return {Model} 返回重置的模型
	 */
    function fReset(models, oOptions) {
    	var me=this;
        oOptions || (oOptions = {});
        for (var i = 0, l = me.models.length; i < l; i++) {
        	me._removeReference(me.models[i], oOptions);
        }
        oOptions.previousModels = me.models;
        me._reset();
        models = me.add(models, $HO.extend({silent: true}, oOptions));
        if (!oOptions.silent){
        	me.trigger('reset', me, oOptions);
        }
        return models;
    }
	/**
	 * 添加到集合最后
	 * @param 同"set"方法
	 * @return 返回添加的模型
	 */
    function fPush(oModel, oOptions) {
    	var me=this;
        return me.add(oModel, $HO.extend({at: me.length}, oOptions));
    }
	/**
	 * 取出集合最后一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回取出的模型
	 */
    function fPop(oOptions) {
    	var me=this;
        var oModel = me.at(me.length - 1);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 添加到集合最前面
	 * @param 同"set"方法
	 * @return {Model} 返回添加的模型
	 */
    function fUnshift(oModel, oOptions) {
        return this.add(oModel, $HO.extend({at: 0}, oOptions));
    }
	/**
	 * 取出集合第一个模型
	 * @param 同"set"方法
	 * @return {Model} 返回第一个模型
	 */
    function fShift(oOptions) {
    	var me=this;
        var oModel = me.at(0);
        me.remove(oModel, oOptions);
        return oModel;
    }
	/**
	 * 返回选定的元素的数组，同"Array.slice"
	 * @param {number}nStart 规定从何处开始选取。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，
	 * 						 -1 指最后一个元素，-2 指倒数第二个元素，以此类推。
	 * @param {number=}nEnd 规定从何处结束选取。该参数是数组片断结束处的数组下标。如果没有指定该参数，
	 * 						那么切分的数组包含从 start 到数组结束的所有元素。如果这个参数是负数，
	 * 						那么它规定的是从数组尾部开始算起的元素。
	 * @return {Array} 选定的元素的数组
	 */
    function fSlice() {
      return Array.prototype.slice.apply(this.models, arguments);
    }
	/**
	 * 通过id或cid获取模型
	 * @param {Object|number|string}obj 可以直接是id或cid，也可以是包含id或cid属性的对象
	 * @return {Model} 返回对应模型
	 */
    function fGet(obj) {
    	var me=this;
        if (obj == null){
      		return void 0;
        }
        return me._byId[obj] || me._byId[obj.id] || me._byId[obj.cid];
    }
	/**
	 * 获取指定位置的模型
	 * @param {number}nIndex 参数索引
	 * @return {Model} 返回该模型
	 */
    function fAt(nIndex) {
        return this.models[nIndex];
    }
	/**
	 * 返回包含指定 key-value 组合的模型的数组
	 * @param {Object}oAttrs key-value 组合
	 * @param {boolean}bFirst 是否只返回第一个模型
	 * @return {Array|Model|undefined} 返回匹配对象的数组，如果没有，则返回空数组，如果bFirst==true，返回第一个匹配的模型
	 */
    function fWhere(oAttrs, bFirst) {
    	var me=this;
        if ($HO.isEmpty(oAttrs)){
        	return bFirst ? void 0 : [];
        }
        return me[bFirst ? 'find' : 'filter'](function(oModel) {
        	for (var key in oAttrs) {
            	if (oAttrs[key] !== oModel.get(key)){
            		return false;
            	}
        	}
        	return true;
        });
    }
	/**
	 * 返回包含指定 key-value 组合的第一个模型
	 * @param {Object}oAttrs key-value 组合
	 * @return {Model|undefined} 返回第一个匹配的模型，没有匹配的模型则返回undefined
	 */
    function fFindWhere(oAttrs) {
        return this.where(oAttrs, true);
    }
	/**
	 * 排序
	 * @param {Object=}oOptions 选项{
	 * 		{boolean=}silent 是否不触发事件
	 * }
	 * @return {Collection} 返回排序后的集合
	 */
    function fSort(oOptions) {
    	var me=this;
        if (!me.comparator){
        	var sMsg='没有比较器';
        	$D.error(sMsg,new Error(sMsg));
        }
        oOptions || (oOptions = {});

        if (typeof me.comparator=='string' || me.comparator.length === 1) {
        	me.models = me.sortBy(me.comparator, me);
        } else {
       		me.models.sort($H.Function.bind(me.comparator, me));
        }

        if (!oOptions.silent){
        	me.trigger('sort', me, oOptions);
        }
        return me;
    }
    /**
     * 提取集合里指定的属性值
	 *  @param {string}sAttr 参数属性
	 *  @return {Array} 返回集合对应属性的数组
     */
    function fPluck(sAttr) {
      return $H.Collection.invoke(this.models, 'get', sAttr);
    }

    // Fetch the default set of models for me collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    function fFetch(oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        if (oOptions.parse === void 0){
        	oOptions.parse = true;
        }
        var success = oOptions.success;
        var collection = me;
        oOptions.success = function(resp) {
        	var method = oOptions.reset ? 'reset' : 'set';
        	collection[method](resp, oOptions);
        	if (success){
        		success(collection, resp, oOptions);
        	}
        	collection.trigger('sync', collection, resp, oOptions);
        };
        wrapError(me, oOptions);
        return me.sync('read', me, oOptions);
    }

    // Create a new instance of a model in me collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    function fCreate(oModel, oOptions) {
    	var me=this;
        oOptions = oOptions ? $HO.clone(oOptions) : {};
        if (!(oModel = me._prepareModel(oModel, oOptions))) return false;
        if (!oOptions.wait) me.add(oModel, oOptions);
        var collection = me;
        var success = oOptions.success;
        oOptions.success = function(oModel, resp) {
        	if (oOptions.wait) collection.add(oModel, oOptions);
        	if (success) success(oModel, resp, oOptions);
        };
        oModel.save(null, oOptions);
        return oModel;
    }
	/**
     * 分析处理回调数据，默认直接返回response
     * @param {Object}resp
     * @param {Object}oOptions
     */
    function fParse(resp, oOptions) {
        return resp;
    }
	/**
	 * 克隆
	 * @return {Collection} 返回克隆的集合
	 */
    function fClone() {
    	var me=this;
        return new me.constructor(me.models);
    }
	
	return Collection;
	
});