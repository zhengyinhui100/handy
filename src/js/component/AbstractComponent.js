/**
 * 组件基类
 * @author 郑银辉(zhengyinhui100@gmail.com)
 * @created 2013-12-28
 */

$Define("handy.component.AbstractComponent","handy.component.ComponentManager",function(CM){
	
	var AC=$HO.createClass(),
	_oIdReg=/^(<[a-zA-Z]+)/,
	_oClsReg=/(class=")/;
	
	//静态方法
	$HO.extend(AC,{
		define              : fDefine,           //定义组件
		html                : fHtml              //静态生成组件html
	});
	
	//实例方法
	$HO.extend(AC.prototype,{
		
		ctype               : 'AbstractComponent',       //组件类型
		
		//默认配置
		renderTo            : null,              //渲染节点
		hidden              : false,             //是否隐藏
		disabled            : false,             //是否禁用
		hideMode            : 'display',         //隐藏方式
		autoRender          : true,              //是否默认就进行渲染
		renderBy            : 'append',          //默认渲染方式
//		autoShow            : true,              //是否显示
		delayListen         : false,             //延迟初始化监听器
//		notListen           : false,             //不自动初始化监听器
		////通用效果
		radius              : null,         	 //圆角，null：无圆角，little：小圆角，normal：普通圆角，big：大圆角
		shadow              : false,        	 //外阴影
		shadowInset         : false,        	 //内阴影
		isMini              : false,       	     //小号
		isFocus             : false,        	 //聚焦
		isInline            : false,             //是否内联(宽度自适应)
		
		//属性
//		_id                 : null,              //组件id
		html                : null,              //组件html
		//rendered          : false,             //是否已渲染
		isSuspend           : false,             //是否挂起事件
//		_container          : null,              //组件容器节点
//		_listeners          : {},                //事件池  
//		globalEvents        : [                  //全局事件
//			'beforeRender','afterRender','show','hide','destroy'
//		],               
		
		initialize          : fInitialize,       //初始化
		doConfig            : fDoConfig,         //初始化配置
		getId               : fGetId,            //获取组件id
		getEl               : fGetEl,            //获取组件节点
		initHtml            : function(){},      //初始化组件html
		getHtml             : fGetHtml,          //获取html
		getExtCls           : fGetExtCls,        //生成通用样式
		find                : fFind,             //查找子元素
		hide                : fHide,             //隐藏
		show                : fShow,             //显示
//		update
		enable              : fEnable,           //启用
		disable             : fDisable,          //禁用
//		mask
//		unmask
		fire                : fFire,             //触发组件自定义事件
		listen              : fListen,           //绑定事件
		unlisten            : fUnlisten,         //解除事件
		initListeners       : fInitListeners,    //初始化所有事件
		clearListeners      : fClearListeners,   //清除所有事件
		suspendListeners    : fSuspendListeners, //挂起事件
		resumeListeners     : fResumeListeners,  //恢复事件
		destroy             : fDestroy           //销毁
	});
	
	/**
	 * 定义组件
	 * @method define
	 * @param {string}sCtype 组件类型
	 * @return {class}组件类对象
	 */
	function fDefine(sCtype){
		var Component=$HO.createClass();
		$HO.inherit(Component,AC);
		CM.registerType(sCtype,Component);
		return Component;
	}
	/**
	 * 静态生成组件html
	 * @method html
	 * @param {object}oSettings 初始化参数
	 */
	function fHtml(oSettings,parentComponent){
		oSettings.delayListen=true;
		oSettings.autoRender=false;
		var component=new this(oSettings);
		if(parentComponent){
			parentComponent.children.push(component);
		}
		return component.getHtml();
	}
		
	/**
	 * 初始化
	 * @method initialize
	 * @param {object}oSettings 初始化参数
	 */
	function fInitialize(oSettings){
		var that=this;
		that.doConfig(oSettings);
		//组件html
		var sHtml=that.initHtml(oSettings);
		var sId=that.getId();
		//添加id
		sHtml=sHtml.replace(_oIdReg,'$1 id="'+sId+'"');
		sHtml=that.html=sHtml.replace(_oClsReg,'$1'+that.getExtCls());
		that.fire('beforeRender');
		if(oSettings.autoRender!=false){
			that.renderTo[that.renderBy](sHtml);
			//缓存容器
			that._container=$("#"+sId);
			that.fire('afterRender');
		}
		
		if(oSettings.notListen!=true){
			if(that.delayListen){
				setTimeout(function(){
					that.initListeners();
				});
			}else{
				that.initListeners();
			}
		}
		if(that.disabled){
			that.suspendListeners();
		}
		//注册组件
		CM.register(that);
	}
	/**
	 * 初始化配置
	 * @method doConfig
	 * @param {object} oParams
	 */
	function fDoConfig(oParams){
		var that=this;
		$HO.extend(that,oParams,{ignore:['listeners']});
		if(oParams.renderTo){
			that.renderTo=$(oParams.renderTo);
		}else{
			that.renderTo=$(document.body);
		}
		//生成对象的监听器列表
		var aListeners=that.listeners||[];
		if(oParams.listeners){
			that._listeners=aListeners.concat(oParams.listeners);
		}else{
			that._listeners=aListeners.concat();
		}
		that.children=[];
	}
	/**
	 * 获取组件id
	 * @method getId
	 * @return {string}返回组件id
	 */
	function fGetId(){
		var that=this;
		return that._id||(that._id=CM.generateId(that.cid));
	}
	/**
	 * 获取组件节点
	 * @method getEl
	 * @return {jQuery} 返回组件节点
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
	 * 生成通用样式
	 * @method getExtCls
	 * @return {string} 返回通用样式
	 */
	function fGetExtCls(){
		var that=this;
		var aCls=[];
		if(that.disabled){
			aCls.push('w-disable');
		}
		if(that.radius){
			aCls.push('w-radius-'+that.radius);
		}
		if(that.isMini){
			aCls.push('w-mini');
		}
		if(that.shadow){
			aCls.push('w-shadow');
		}
		if(that.shadowInset){
			aCls.push('w-shadow-inset');
		}
		if(that.isFocus){
			aCls.push('w-focus');
		}
		if(that.isInline){
			aCls.push('w-inline');
		}
		return aCls.length>0?aCls.join(' ')+' ':'';
	}
	/**
	 * 触发组件自定义事件
	 * @method fire
	 * @param {string}sType 事件类型
	 */
	function fFire(sType){
		var that=this;
		for(var i=that._listeners.length-1;i>=0;i--){
			var oListener=that._listeners[i]
			if(oListener.type==sType){
				fDelegation=oListener.delegation;
				fDelegation({obj:that,data:oListener.data});
			}
		}
	}
	/**
	 * 绑定事件
	 * @method listen
	 * @param {object}事件对象{
	 * 			{string}type      : 事件名
	 * 			{function}handler : 监听函数
	 * 			{any=}data        : 数据
	 * 			{jQuery=}el       : 绑定事件的节点，不传表示组件容器节点
	 * 			{boolean=}notEl    : 为true时是自定义事件
	 * 			{string=}selector : 选择器
	 * 			{any=}scope       : 监听函数执行的上下文对象，默认是组件对象
	 * 			{string=}method   : 绑定方式，默认为"bind"
	 * }
	 */
	function fListen(oEvent){
		var that=this,
			sType=oEvent.type,
			aListeners=that._listeners,
			oEl=oEvent.el||that.getEl(),
			sMethod=oEvent.method||"bind",
			sSel=oEvent.selector,
			oData=oEvent.data,
			fFunc=oEvent.delegation=function(){
			if(that.isSuspend!=true){
				return oEvent.handler.apply(oEvent.scope||that,arguments);
			}
		}
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
		aListeners.push(oEvent)
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
		var that=this,
			sType=oEvent.type,
			oEl=oEvent.el||that.getEl(),
			sMethod=oEvent.method=="delegate"?"undelegate":"unbind",
			sSel=oEvent.selector,
			fDelegation;
		for(var i=that._listeners.length-1;i>=0;i--){
			var oListener=that._listeners[i]
			if(oListener.handler==oEvent.handler){
				fDelegation=oListener.delegation;
				that._listeners.splice(i,1);
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
		var that=this;
		//缓存容器，autoRender为false时需要此处获取容器
		that._container=that._container||$("#"+that._id);
		var aListeners=that._listeners;
		that._listeners=[];
		for(var i=aListeners.length-1;i>=0;i--){
			that.listen(aListeners[i]);
		}
		var children=that.children;
		if(children){
			for(var i=0,len=children.length;i<len;i++){
				children.initListeners();
			}
		}
	}
	/**
	 * 清除所有事件
	 * @method clearListeners
	 */
	function fClearListeners(){
		var that=this;
		var aListeners=that._listeners;
		for(var i=aListeners.length-1;i>=0;i--){
			that.unlisten(aListeners[i]);
		}
		var children=that.children;
		if(children){
			for(var i=0,len=children.length;i<len;i++){
				children.clearListeners();
			}
		}
	}
	/**
	 * 挂起事件
	 * @method suspendListeners
	 */
	function fSuspendListeners(){
		this.isSuspend=true;
	}
	/**
	 * 恢复事件
	 * @method resumeListeners
	 */
	function fResumeListeners(){
		this.isSuspend=false;
	}
	/**
	 * 查找子元素或子组件
	 * @method
	 */
	function fFind(selector){
		return this.getEl().find(selector);
	}
	/**
	 * 隐藏
	 * @method hide
	 */
	function fHide(){
		var that=this;
		that.getEl().hide();
		that.fire('hide');
	}
	/**
	 * 显示
	 * @method show
	 */
	function fShow(){
		var that=this;
		that.getEl().show();
		that.fire('show');
	}
	/**
	 * 启用
	 * @method enable
	 */
	function fEnable(){
		var that=this;
		that.resumeListeners();
		that.getEl().removeClass("w-disable");
	}
	/**
	 * 禁用
	 * @method disable
	 */
	function fDisable(){
		var that=this;
		that.suspendListeners();
		that.getEl().addClass("w-disable");
	}
	/**
	 * 销毁组件
	 * @method destroy
	 */
	function fDestroy(){
		var that=this;
		that.clearListeners();
		that.getEl().remove();
		//注销组件
		CM.unregister(that);
		that.fire('destroy');
	}
		
	return AC;
	
});